"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, comments, type CommentStatus } from "@/db/schema";
import { EDITORIAL_ROLES, getCurrentUser, requireRole } from "@/lib/auth/dal";
import { isRateLimited } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/articles/actions";

const commentInputSchema = z.object({
  articleId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  body: z.string().trim().min(1, "Comment can't be empty.").max(2000),
});

export async function postComment(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to comment." };

  const parsed = commentInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid comment." };
  }

  if (await isRateLimited(`comment:${user.id}`, 5, 60)) {
    return { error: "You're commenting too quickly — try again in a minute." };
  }

  const article = await db.query.articles.findFirst({
    where: eq(articles.id, parsed.data.articleId),
  });
  if (!article || article.status !== "published") {
    return { error: "Article not found." };
  }

  await db.insert(comments).values({
    articleId: parsed.data.articleId,
    userId: user.id,
    parentId: parsed.data.parentId ?? null,
    body: parsed.data.body,
  });

  revalidatePath(`/articles/${article.slug}`);
  return { ok: true };
}

export async function moderateComment(id: string, status: CommentStatus): Promise<ActionResult> {
  const moderator = await requireRole(EDITORIAL_ROLES);

  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, id),
    with: { article: true },
  });
  if (!comment) return { error: "Comment not found." };

  await db
    .update(comments)
    .set({ status, moderatedBy: moderator.id, moderatedAt: new Date() })
    .where(eq(comments.id, id));

  revalidatePath("/studio/comments");
  revalidatePath(`/articles/${comment.article.slug}`);
  return { ok: true };
}
