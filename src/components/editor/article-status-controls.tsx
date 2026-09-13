"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArticleStatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { changeArticleStatus, deleteArticle } from "@/lib/articles/actions";
import type { ArticleStatus } from "@/db/schema/articles";
import type { Role } from "@/lib/auth/dal";

function optionsFor(status: ArticleStatus, role: Role, isOwner: boolean): ArticleStatus[] {
  if (role === "editor" || role === "admin") {
    return (["draft", "in_review", "published", "archived"] as const).filter((s) => s !== status);
  }
  if (role === "author" && isOwner) {
    if (status === "draft") return ["in_review"];
    if (status === "in_review") return ["draft"];
  }
  return [];
}

const STATUS_LABEL: Record<ArticleStatus, string> = {
  draft: "Move to draft",
  in_review: "Submit for review",
  scheduled: "Schedule",
  published: "Publish",
  archived: "Archive",
};

export function ArticleStatusControls({
  articleId,
  status,
  role,
  isOwner,
}: {
  articleId: string;
  status: ArticleStatus;
  role: Role;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const canDelete = role === "editor" || role === "admin" || (isOwner && status === "draft");

  function handleTransition(next: ArticleStatus) {
    setError(null);
    startTransition(async () => {
      const result = await changeArticleStatus(articleId, next);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    if (!window.confirm("Delete this article? This can't be undone.")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteArticle(articleId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/studio/articles");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface p-4">
      <ArticleStatusPill status={status} />
      {optionsFor(status, role, isOwner).map((next) => (
        <Button
          key={next}
          variant="secondary"
          disabled={pending}
          onClick={() => handleTransition(next)}
        >
          {STATUS_LABEL[next]}
        </Button>
      ))}
      {canDelete && (
        <Button variant="ghost" disabled={pending} onClick={handleDelete} className="ml-auto">
          Delete
        </Button>
      )}
      {error && <p className="w-full text-sm text-danger">{error}</p>}
    </div>
  );
}
