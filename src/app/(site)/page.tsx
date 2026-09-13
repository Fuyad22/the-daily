import { listPublishedArticles } from "@/lib/articles/public";
import { ArticleCard } from "@/components/site/article-card";

export default async function HomePage() {
  const articles = await listPublishedArticles({ limit: 13 });
  const [featured, ...rest] = articles;

  if (!featured) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Est. 2026
        </p>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-ink">
          The Daily
        </h1>
        <p className="max-w-md font-serif text-lg text-muted">
          Independent daily reporting and analysis — launching soon.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <section className="mb-12">
        <ArticleCard article={featured} size="large" />
      </section>

      {rest.length > 0 && (
        <section className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </section>
      )}
    </main>
  );
}
