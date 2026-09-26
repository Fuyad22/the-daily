import { EDITORIAL_ROLES, requireRole } from "@/lib/auth/dal";
import { listCommentsForModeration } from "@/lib/comments/data";
import { CommentModerationList } from "./comment-moderation-list";

export default async function StudioCommentsPage() {
  await requireRole(EDITORIAL_ROLES);
  const pending = await listCommentsForModeration("pending");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Comment moderation</h1>
      <CommentModerationList comments={pending} />
    </div>
  );
}
