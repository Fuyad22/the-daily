import type { ArticleStatus } from "@/db/schema/articles";
import type { CommentStatus } from "@/db/schema/comments";

const ARTICLE_STATUS_CONFIG: Record<ArticleStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-black/[0.06] text-[#55545A]" },
  in_review: { label: "In review", className: "bg-premium-bg text-premium" },
  scheduled: { label: "Scheduled", className: "bg-black/[0.06] text-[#55545A]" },
  published: { label: "Published", className: "bg-[#e8f0ea] text-[#3f6b4a]" },
  archived: { label: "Archived", className: "bg-black/[0.06] text-muted" },
};

const COMMENT_STATUS_CONFIG: Record<CommentStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-premium-bg text-premium" },
  approved: { label: "Approved", className: "bg-[#e8f0ea] text-[#3f6b4a]" },
  rejected: { label: "Rejected", className: "bg-black/[0.06] text-muted" },
  spam: { label: "Spam", className: "bg-danger/10 text-danger" },
};

function Pill({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-[12.5px] font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

export function ArticleStatusPill({ status }: { status: ArticleStatus }) {
  return <Pill {...ARTICLE_STATUS_CONFIG[status]} />;
}

export function CommentStatusPill({ status }: { status: CommentStatus }) {
  return <Pill {...COMMENT_STATUS_CONFIG[status]} />;
}
