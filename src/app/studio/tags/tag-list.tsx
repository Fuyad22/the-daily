"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTag, deleteTag } from "@/lib/taxonomy/actions";

type Tag = { id: string; name: string; slug: string };

export function TagList({ tags, canDelete }: { tags: Tag[]; canDelete: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createTag({ name });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setName("");
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteTag(id);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New tag name"
          className="max-w-xs"
        />
        <Button onClick={handleCreate} disabled={pending || !name.trim()}>
          Add
        </Button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-sm text-ink"
          >
            {tag.name}
            {canDelete && (
              <button
                type="button"
                disabled={pending}
                onClick={() => handleDelete(tag.id)}
                className="text-muted hover:text-accent"
                aria-label={`Delete ${tag.name}`}
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
