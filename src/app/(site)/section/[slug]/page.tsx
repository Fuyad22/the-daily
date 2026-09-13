import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug, listPublishedArticles } from "@/lib/articles/public";
import { ArticleCard } from "@/components/site/article-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category?.name };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const articles = await listPublishedArticles({ categoryId: category.id, limit: 30 });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-8 font-display text-3xl font-semibold text-ink">{category.name}</h1>
      {articles.length === 0 ? (
        <p className="text-muted">No articles in this section yet.</p>
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
