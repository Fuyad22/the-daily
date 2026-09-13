import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTagBySlug, listPublishedArticles } from "@/lib/articles/public";
import { ArticleCard } from "@/components/site/article-card";
import { ListingHeader } from "@/components/site/listing-header";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  return { title: tag ? `#${tag.name}` : undefined };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const articles = await listPublishedArticles({ tagId: tag.id, limit: 30 });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <ListingHeader eyebrow="Tag" title={tag.name} />
      {articles.length === 0 ? (
        <p className="text-muted">No articles tagged {tag.name} yet.</p>
      ) : (
        <section className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </section>
      )}
    </main>
  );
}
