import type { Metadata } from "next";
import { searchArticles } from "@/lib/articles/public";
import { ArticleCard } from "@/components/site/article-card";
import { ListingHeader } from "@/components/site/listing-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const articles = query ? await searchArticles(query) : [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <ListingHeader eyebrow="The Daily" title="Search" />
      <form action="/search" className="mb-10 flex gap-2">
        <Input name="q" defaultValue={query} placeholder="Search articles…" autoFocus />
        <Button type="submit">Search</Button>
      </form>

      {query && (
        <p className="mb-6 text-sm text-muted">
          {articles.length} result{articles.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
        </p>
      )}

      <section className="flex flex-col divide-y divide-line">
        {articles.map((article) => (
          <div key={article.id} className="py-8 first:pt-0">
            <ArticleCard article={article} />
          </div>
        ))}
      </section>
    </main>
  );
}
