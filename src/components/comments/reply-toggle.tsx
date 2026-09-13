"use client";

import { useState } from "react";
import { CommentForm } from "./comment-form";

export function ReplyToggle({ articleId, parentId }: { articleId: string; parentId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1 text-xs font-semibold text-muted hover:text-accent"
      >
        Reply
      </button>
    );
  }

  return (
    <div className="mt-2">
      <CommentForm articleId={articleId} parentId={parentId} onDone={() => setOpen(false)} />
    </div>
  );
}
