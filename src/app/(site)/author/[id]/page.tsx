import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAuthorById, listPublishedArticles } from "@/lib/articles/public";
import { ArticleCard } from "@/components/site/article-card";
import { ListingHeader } from "@/components/site/listing-header";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const author = await getAuthorById(id);
  return { title: author?.name };
}

export default async function AuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const author = await getAuthorById(id);
  if (!author) notFound();

  const articles = await listPublishedArticles({ authorId: author.id, limit: 30 });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <ListingHeader eyebrow="Author" title={author.name} />
      {articles.length === 0 ? (
        <p className="text-muted">No articles from {author.name} yet.</p>
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
