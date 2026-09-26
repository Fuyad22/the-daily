import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedArticleBySlug } from "@/lib/articles/public";
import { getCurrentUser } from "@/lib/auth/dal";
import { hasPremiumAccess } from "@/lib/subscriptions/access";
import { isTranslationConfigured } from "@/lib/translate";
import { formatArticleDate, estimateReadingTime } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { CommentSection } from "@/components/comments/comment-section";
import {
  ArticleTranslateProvider,
  TranslatableBody,
  TranslatableDek,
  TranslatableTitle,
  TranslateToggle,
} from "@/components/site/article-translate";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) return {};

  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt || article.dek || undefined;

  return {
    title,
    description,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: article.publishedAt?.toISOString(),
      authors: article.authors.map((a) => a.user.name),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) notFound();

  const user = await getCurrentUser();
  const unlocked = article.isPremium ? await hasPremiumAccess(user) : true;
  const canTranslate = unlocked && isTranslationConfigured();

  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt || article.dek || undefined,
    image: article.heroImageUrl || undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: article.authors.map((a) => ({ "@type": "Person", name: a.user.name })),
    publisher: { "@type": "Organization", name: "The Daily" },
    mainEntityOfPage: `${baseUrl}/articles/${article.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-4xl px-6 py-12">
        <ArticleTranslateProvider slug={article.slug}>
        <header className="mx-auto flex max-w-2xl flex-col gap-5">
          <Link href={`/section/${article.category.slug}`} className="label text-ink">
            {article.category.name}
          </Link>
          <TranslatableTitle>{article.title}</TranslatableTitle>
          {article.dek && <TranslatableDek>{article.dek}</TranslatableDek>}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-y border-line py-3 text-sm text-muted">
            {article.authors.length > 0 && (
              <span>
                By{" "}
                {article.authors.map((a, i) => (
                  <span key={a.userId}>
                    <Link
                      href={`/author/${a.userId}`}
                      className="font-medium text-ink hover:text-accent"
                    >
                      {a.user.name}
                    </Link>
                    {i < article.authors.length - 1 ? ", " : ""}
                  </span>
                ))}
              </span>
            )}
            {article.publishedAt && <span>· {formatArticleDate(article.publishedAt)}</span>}
            {article.contentHtml && (
              <span>· {estimateReadingTime(article.contentHtml)} min read</span>
            )}
          </div>
          {canTranslate && <TranslateToggle />}
        </header>

        {article.heroImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- editor-pasted URL, see article-card.tsx
          <img
            src={article.heroImageUrl}
            alt={article.heroImageAlt ?? ""}
            className="my-10 w-full rounded-sm"
          />
        )}

        <div className="mx-auto max-w-2xl">
          {unlocked ? (
            <TranslatableBody>{article.contentHtml ?? ""}</TranslatableBody>
          ) : (
            <div className="flex flex-col gap-6">
              {(article.excerpt || article.dek) && (
                <p className="prose-article">{article.excerpt || article.dek}</p>
              )}
              <div className="rounded-xl border border-premium/30 bg-premium-bg p-8 text-center">
                <p className="font-display text-lg font-semibold text-ink">
                  This story is for subscribers
                </p>
                <p className="mt-1 text-sm text-muted">Subscribe to The Daily to keep reading.</p>
                <Link href="/subscribe" className={`${buttonVariants()} mt-4`}>
                  Subscribe
                </Link>
              </div>
            </div>
          )}

          {article.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2 border-t border-line pt-6">
              {article.tags.map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="rounded-full border border-line px-3 py-1 text-xs text-muted hover:border-accent hover:text-accent"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
        </ArticleTranslateProvider>
      </article>
      {unlocked && <CommentSection articleId={article.id} />}
    </>
  );
}
