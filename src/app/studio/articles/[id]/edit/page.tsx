import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { getArticleForEdit, listCategories, listTags } from "@/lib/articles/data";
import { isBlobConfigured } from "@/lib/blob";
import { ArticleForm } from "@/components/editor/article-form";
import { ArticleStatusControls } from "@/components/editor/article-status-controls";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole(["author", "editor", "admin"]);
  const article = await getArticleForEdit(id);
  if (!article) notFound();

  const isOwner = article.authors.some((a) => a.userId === user.id);
  const isEditorial = user.role === "editor" || user.role === "admin";
  if (!isEditorial && !isOwner) notFound();

  const [categories, tags] = await Promise.all([listCategories(), listTags()]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Edit article</h1>
      <ArticleStatusControls
        articleId={article.id}
        status={article.status}
        role={user.role}
        isOwner={isOwner}
      />
      <ArticleForm
        mode="edit"
        articleId={article.id}
        categories={categories}
        tags={tags}
        canUploadImages={isBlobConfigured()}
        initial={{
          title: article.title,
          dek: article.dek ?? undefined,
          contentJson: article.contentJson ?? undefined,
          excerpt: article.excerpt ?? undefined,
          heroImageUrl: article.heroImageUrl ?? undefined,
          heroImageAlt: article.heroImageAlt ?? undefined,
          categoryId: article.categoryId,
          tagIds: article.tags.map((t) => t.tagId),
          isPremium: article.isPremium,
          seoTitle: article.seoTitle ?? undefined,
          seoDescription: article.seoDescription ?? undefined,
        }}
      />
    </div>
  );
}
