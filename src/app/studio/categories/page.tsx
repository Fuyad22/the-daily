import { requireRole } from "@/lib/auth/dal";
import { listCategories } from "@/lib/articles/data";
import { CategoryList } from "./category-list";

export default async function CategoriesPage() {
  await requireRole(["editor", "admin"]);
  const categories = await listCategories();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Categories</h1>
      <CategoryList categories={categories} />
    </div>
  );
}
