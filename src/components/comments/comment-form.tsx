"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { postComment } from "@/lib/comments/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function CommentForm({
  articleId,
  parentId,
  onDone,
}: {
  articleId: string;
  parentId?: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await postComment({ articleId, parentId, body });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setBody("");
      setSubmitted(true);
      onDone?.();
      router.refresh();
    });
  }

  if (submitted) {
    return (
      <p className="text-sm text-muted">
        Thanks — your {parentId ? "reply" : "comment"} is awaiting review and will appear once approved.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parentId ? "Write a reply…" : "Join the discussion…"}
        rows={3}
        required
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div>
        <Button type="submit" disabled={pending || !body.trim()}>
          {pending ? "Posting…" : parentId ? "Post reply" : "Post comment"}
        </Button>
      </div>
    </form>
  );
}
