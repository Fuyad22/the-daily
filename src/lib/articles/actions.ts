"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { articleAuthors, articles, articleTags, type ArticleStatus } from "@/db/schema";
import { hasRoleAtLeast, requireRole, STAFF_ROLES, type Role } from "@/lib/auth/dal";
import { renderArticleContent } from "./render";
import { uniqueArticleSlug } from "./slug";

const articleInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  dek: z.string().trim().max(300).optional(),
  contentJson: z.record(z.string(), z.unknown()),
  excerpt: z.string().trim().max(500).optional(),
  heroImageUrl: z.string().trim().max(2000).optional(),
  heroImageAlt: z.string().trim().max(200).optional(),
  categoryId: z.string().uuid("Choose a category."),
  tagIds: z.array(z.string().uuid()).max(10),
  isPremium: z.boolean(),
  featured: z.enum(["lead", "headline"]).nullable().optional(),
  isBreaking: z.boolean().optional(),
  seoTitle: z.string().trim().max(200).optional(),
  seoDescription: z.string().trim().max(300).optional(),
});

export type ArticleInput = z.infer<typeof articleInputSchema>;
export type ActionResult<T = { ok: true }> = { error: string } | T;

async function loadArticleWithAuthors(id: string) {
  return db.query.articles.findFirst({
    where: eq(articles.id, id),
    with: { authors: true },
  });
}

function isOwnerOf(article: { authors: { userId: string }[] }, userId: string) {
  return article.authors.some((a) => a.userId === userId);
}

// Homepage placement is an editorial call — authors can create/edit their own
// drafts but can't set or clear it, so this silently drops the fields instead
// of erroring when a non-editorial user's input happens to include them.
function editorialFields(role: Role, data: ArticleInput) {
  if (!hasRoleAtLeast(role, "editor")) return {};
  return { featured: data.featured ?? null, isBreaking: data.isBreaking ?? false };
}

// Only one published article should be the homepage lead at a time.
async function clearOtherLeads(excludeId?: string) {
  await db
    .update(articles)
    .set({ featured: null })
    .where(
      excludeId
        ? and(eq(articles.featured, "lead"), ne(articles.id, excludeId))
        : eq(articles.featured, "lead")
    );
}

export async function createArticle(
  input: ArticleInput
): Promise<ActionResult<{ id: string }>> {
  const user = await requireRole(STAFF_ROLES);
  const parsed = articleInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid article data." };
  }
  const data = parsed.data;
  const slug = await uniqueArticleSlug(data.title);
  const contentHtml = renderArticleContent(data.contentJson);
  const fields = editorialFields(user.role, data);
  if (fields.featured === "lead") {
    await clearOtherLeads();
  }

  const [article] = await db
    .insert(articles)
    .values({
      slug,
      title: data.title,
      dek: data.dek || null,
      contentJson: data.contentJson,
      contentHtml,
      excerpt: data.excerpt || null,
      heroImageUrl: data.heroImageUrl || null,
      heroImageAlt: data.heroImageAlt || null,
      categoryId: data.categoryId,
      isPremium: data.isPremium,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      ...fields,
    })
    .returning({ id: articles.id });

  await db.insert(articleAuthors).values({ articleId: article.id, userId: user.id, position: 1 });
  if (data.tagIds.length > 0) {
    await db
      .insert(articleTags)
      .values(data.tagIds.map((tagId) => ({ articleId: article.id, tagId })));
  }

  revalidatePath("/studio/articles");
  revalidatePath("/");
  return { id: article.id };
}

export async function updateArticle(
  id: string,
  input: ArticleInput
): Promise<ActionResult> {
  const user = await requireRole(STAFF_ROLES);
  const existing = await loadArticleWithAuthors(id);
  if (!existing) return { error: "Article not found." };

  const canEdit =
    hasRoleAtLeast(user.role, "editor") ||
    (isOwnerOf(existing, user.id) && (existing.status === "draft" || existing.status === "in_review"));
  if (!canEdit) return { error: "You don't have permission to edit this article." };

  const parsed = articleInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid article data." };
  }
  const data = parsed.data;
  const contentHtml = renderArticleContent(data.contentJson);
  const fields = editorialFields(user.role, data);
  if (fields.featured === "lead") {
    await clearOtherLeads(id);
  }

  await db
    .update(articles)
    .set({
      title: data.title,
      dek: data.dek || null,
      contentJson: data.contentJson,
      contentHtml,
      excerpt: data.excerpt || null,
      heroImageUrl: data.heroImageUrl || null,
      heroImageAlt: data.heroImageAlt || null,
      categoryId: data.categoryId,
      isPremium: data.isPremium,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      // Any edit invalidates the cached Bangla translation — it's
      // re-generated on next request rather than left stale.
      titleBn: null,
      dekBn: null,
      contentHtmlBn: null,
      ...fields,
    })
    .where(eq(articles.id, id));

  await db.delete(articleTags).where(eq(articleTags.articleId, id));
  if (data.tagIds.length > 0) {
    await db.insert(articleTags).values(data.tagIds.map((tagId) => ({ articleId: id, tagId })));
  }

  revalidatePath("/studio/articles");
  revalidatePath(`/studio/articles/${id}/edit`);
  revalidatePath("/");
  return { ok: true };
}

function canTransition(
  role: Role,
  from: ArticleStatus,
  to: ArticleStatus,
  isOwner: boolean
): boolean {
  if (from === to) return false;
  if (hasRoleAtLeast(role, "editor")) return true;
  if (role === "author" && isOwner) {
    return (
      (from === "draft" && to === "in_review") || (from === "in_review" && to === "draft")
    );
  }
  return false;
}

export async function changeArticleStatus(
  id: string,
  status: ArticleStatus
): Promise<ActionResult> {
  const user = await requireRole(STAFF_ROLES);
  const existing = await loadArticleWithAuthors(id);
  if (!existing) return { error: "Article not found." };

  if (!canTransition(user.role, existing.status, status, isOwnerOf(existing, user.id))) {
    return { error: "That status change isn't allowed." };
  }

  const publishedAt =
    status === "published" && !existing.publishedAt ? new Date() : existing.publishedAt;

  await db.update(articles).set({ status, publishedAt }).where(eq(articles.id, id));

  revalidatePath("/studio/articles");
  revalidatePath(`/studio/articles/${id}/edit`);
  return { ok: true };
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  const user = await requireRole(STAFF_ROLES);
  const existing = await loadArticleWithAuthors(id);
  if (!existing) return { error: "Article not found." };

  const canDelete =
    hasRoleAtLeast(user.role, "editor") ||
    (isOwnerOf(existing, user.id) && existing.status === "draft");
  if (!canDelete) return { error: "You don't have permission to delete this article." };

  await db.delete(articles).where(eq(articles.id, id));
  revalidatePath("/studio/articles");
  return { ok: true };
}
