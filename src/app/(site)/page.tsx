import { getHomepageFeed } from "@/lib/articles/public";
import { ArticleCard } from "@/components/site/article-card";
import { HeadlineListItem } from "@/components/site/headline-list-item";
import { SITE_NAME } from "@/lib/site";

export default async function HomePage() {
  const { lead, headlines, rest } = await getHomepageFeed();

  if (!lead) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="label text-muted">Est. 2026</p>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-ink">
          {SITE_NAME}
        </h1>
        <p className="max-w-md font-serif text-lg text-muted">
          Independent daily reporting and analysis — launching soon.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <section className="grid grid-cols-1 gap-x-10 gap-y-10 border-b border-line pb-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ArticleCard article={lead} size="large" />
        </div>

        {headlines.length > 0 && (
          <div className="flex flex-col lg:border-l lg:border-line lg:pl-10">
            {headlines.map((article) => (
              <HeadlineListItem key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>

      {rest.length > 0 && (
        <section className="grid grid-cols-1 gap-x-8 gap-y-10 pt-12 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </section>
      )}
    </main>
  );
}
