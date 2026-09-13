"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { moderateComment } from "@/lib/comments/actions";
import type { CommentStatus } from "@/db/schema/comments";

type CommentRow = {
  id: string;
  body: string;
  createdAt: Date;
  author: { name: string };
  article: { title: string; slug: string };
};

export function CommentModerationList({ comments }: { comments: CommentRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handle(id: string, status: CommentStatus) {
    startTransition(async () => {
      await moderateComment(id, status);
      router.refresh();
    });
  }

  if (comments.length === 0) {
    return <p className="text-sm text-muted">Nothing waiting on review.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {comments.map((comment) => (
        <li key={comment.id} className="rounded-xl border border-line bg-surface p-5">
          <div className="mb-2 flex items-center justify-between text-sm text-muted">
            <span>
              <span className="font-medium text-ink">{comment.author.name}</span> on{" "}
              <Link href={`/articles/${comment.article.slug}`} className="text-accent hover:underline">
                {comment.article.title}
              </Link>
            </span>
            <span>{new Date(comment.createdAt).toLocaleString()}</span>
          </div>
          <p className="mb-4 text-[15px] text-ink">{comment.body}</p>
          <div className="flex gap-2">
            <Button disabled={pending} onClick={() => handle(comment.id, "approved")}>
              Approve
            </Button>
            <Button variant="secondary" disabled={pending} onClick={() => handle(comment.id, "rejected")}>
              Reject
            </Button>
            <Button variant="ghost" disabled={pending} onClick={() => handle(comment.id, "spam")}>
              Spam
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
