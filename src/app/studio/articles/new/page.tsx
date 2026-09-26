import { hasRoleAtLeast, requireRole, STAFF_ROLES } from "@/lib/auth/dal";
import { listCategories, listTags } from "@/lib/articles/data";
import { isBlobConfigured } from "@/lib/blob";
import { ArticleForm } from "@/components/editor/article-form";

export default async function NewArticlePage() {
  const user = await requireRole(STAFF_ROLES);
  const [categories, tags] = await Promise.all([listCategories(), listTags()]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-ink">New article</h1>
      <ArticleForm
        mode="create"
        categories={categories}
        tags={tags}
        canUploadImages={isBlobConfigured()}
        canCuratePlacement={hasRoleAtLeast(user.role, "editor")}
      />
    </div>
  );
}
