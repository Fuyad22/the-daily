"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "./tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/cn";
import { createArticle, updateArticle, type ArticleInput } from "@/lib/articles/actions";
import { uploadImage } from "@/lib/media/actions";

type Category = { id: string; name: string };
type Tag = { id: string; name: string };

export function ArticleForm({
  mode,
  articleId,
  initial,
  categories,
  tags,
  canUploadImages = false,
  canCuratePlacement = false,
}: {
  mode: "create" | "edit";
  articleId?: string;
  initial?: Partial<ArticleInput>;
  categories: Category[];
  tags: Tag[];
  canUploadImages?: boolean;
  canCuratePlacement?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [dek, setDek] = useState(initial?.dek ?? "");
  const [contentJson, setContentJson] = useState<Record<string, unknown>>(
    (initial?.contentJson as Record<string, unknown>) ?? {}
  );
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [heroImageUrl, setHeroImageUrl] = useState(initial?.heroImageUrl ?? "");
  const [heroImageAlt, setHeroImageAlt] = useState(initial?.heroImageAlt ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? []);
  const [isPremium, setIsPremium] = useState(initial?.isPremium ?? false);
  const [featured, setFeatured] = useState<"" | "lead" | "headline">(initial?.featured ?? "");
  const [isBreaking, setIsBreaking] = useState(initial?.isBreaking ?? false);
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription ?? "");

  function toggleTag(id: string) {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  async function handleHeroFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadingHero(true);
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadImage(formData);
    setUploadingHero(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }
    setHeroImageUrl(result.url);
  }

  function handleSave() {
    setError(null);
    const input: ArticleInput = {
      title,
      dek,
      contentJson,
      excerpt,
      heroImageUrl,
      heroImageAlt,
      categoryId,
      tagIds,
      isPremium,
      featured: featured || null,
      isBreaking,
      seoTitle,
      seoDescription,
    };

    startTransition(async () => {
      const result =
        mode === "create" ? await createArticle(input) : await updateArticle(articleId!, input);

      if ("error" in result) {
        setError(result.error);
        return;
      }

      if (mode === "create" && "id" in result) {
        router.push(`/studio/articles/${result.id}/edit`);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Headline"
          className="text-lg"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dek">Dek (standfirst)</Label>
        <Input
          id="dek"
          value={dek}
          onChange={(e) => setDek(e.target.value)}
          placeholder="One-sentence summary shown under the headline"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Content</Label>
        <TiptapEditor
          content={initial?.contentJson as Record<string, unknown>}
          onChange={setContentJson}
          canUploadImages={canUploadImages}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-black/15 px-3.5 py-2.5 text-[14.5px] text-ink outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2 pb-2.5">
          <input
            id="isPremium"
            type="checkbox"
            checked={isPremium}
            onChange={(e) => setIsPremium(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          <Label htmlFor="isPremium" className="!text-[14.5px]">
            Premium (subscribers only)
          </Label>
        </div>
      </div>

      {canCuratePlacement && (
        <div className="grid grid-cols-1 gap-6 rounded-lg border border-line p-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="featured">Homepage placement</Label>
            <select
              id="featured"
              value={featured}
              onChange={(e) => setFeatured(e.target.value as "" | "lead" | "headline")}
              className="w-full rounded-lg border border-black/15 px-3.5 py-2.5 text-[14.5px] text-ink outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30"
            >
              <option value="">Not featured (chronological)</option>
              <option value="lead">Top story (homepage lead)</option>
              <option value="headline">Headline</option>
            </select>
          </div>
          <div className="flex items-end gap-2 pb-2.5">
            <input
              id="isBreaking"
              type="checkbox"
              checked={isBreaking}
              onChange={(e) => setIsBreaking(e.target.checked)}
              className="h-4 w-4 accent-danger"
            />
            <Label htmlFor="isBreaking" className="!text-[14.5px]">
              Breaking news banner
            </Label>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm",
                tagIds.includes(tag.id)
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-black/15 text-muted hover:border-black/25"
              )}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="heroImageUrl">Hero image URL</Label>
          <div className="flex gap-2">
            <Input
              id="heroImageUrl"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              placeholder="https://…"
            />
            {canUploadImages && (
              <>
                <input
                  ref={heroFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleHeroFileChange}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => heroFileInputRef.current?.click()}
                  disabled={uploadingHero}
                  className="shrink-0"
                >
                  {uploadingHero ? "Uploading…" : "Upload"}
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="heroImageAlt">Hero image alt text</Label>
          <Input
            id="heroImageAlt"
            value={heroImageAlt}
            onChange={(e) => setHeroImageAlt(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          placeholder="Shown on article cards and as the default meta description"
        />
      </div>

      <details className="rounded-lg border border-line p-4">
        <summary className="cursor-pointer text-sm font-semibold text-ink">
          SEO overrides (optional)
        </summary>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="seoTitle">SEO title</Label>
            <Input id="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="seoDescription">SEO description</Label>
            <Textarea
              id="seoDescription"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </details>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div>
        <Button onClick={handleSave} disabled={pending || !title || !categoryId}>
          {pending ? "Saving…" : mode === "create" ? "Save draft" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
