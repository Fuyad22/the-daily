"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCategory, deleteCategory } from "@/lib/taxonomy/actions";

type Category = { id: string; name: string; slug: string; description: string | null };

export function CategoryList({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createCategory({ name });
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
      const result = await deleteCategory(id);
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
          placeholder="New category name"
          className="max-w-xs"
        />
        <Button onClick={handleCreate} disabled={pending || !name.trim()}>
          Add
        </Button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <ul className="overflow-hidden rounded-xl border border-line bg-surface">
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex items-center justify-between border-b border-line px-5 py-3 last:border-0"
          >
            <span className="text-sm font-medium text-ink">{category.name}</span>
            <Button variant="ghost" disabled={pending} onClick={() => handleDelete(category.id)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
