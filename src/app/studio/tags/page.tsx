import { hasRoleAtLeast, requireRole, STAFF_ROLES } from "@/lib/auth/dal";
import { listTags } from "@/lib/articles/data";
import { TagList } from "./tag-list";

export default async function TagsPage() {
  const user = await requireRole(STAFF_ROLES);
  const tags = await listTags();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Tags</h1>
      <TagList tags={tags} canDelete={hasRoleAtLeast(user.role, "editor")} />
    </div>
  );
}
