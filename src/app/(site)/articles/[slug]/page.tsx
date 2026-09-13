import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedArticleBySlug } from "@/lib/articles/public";
import { getCurrentUser } from "@/lib/auth/dal";
import { hasPremiumAccess } from "@/lib/subscriptions/access";
import { formatArticleDate } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { CommentSection } from "@/components/comments/comment-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt || article.dek || undefined,
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

  return (
    <>
    <article className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-8 flex flex-col gap-4">
        <Link
          href={`/section/${article.category.slug}`}
          className="text-[13px] font-semibold uppercase tracking-wide text-accent"
        >
          {article.category.name}
        </Link>
        <h1 className="font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          {article.title}
        </h1>
        {article.dek && <p className="font-serif text-xl text-muted">{article.dek}</p>}
        <div className="flex items-center gap-1 text-sm text-muted">
          {article.authors.length > 0 && (
            <span>
              By{" "}
              {article.authors.map((a, i) => (
                <span key={a.userId}>
                  <Link href={`/author/${a.userId}`} className="font-medium text-ink hover:text-accent">
                    {a.user.name}
                  </Link>
                  {i < article.authors.length - 1 ? ", " : ""}
                </span>
              ))}
            </span>
          )}
          {article.publishedAt && <span>· {formatArticleDate(article.publishedAt)}</span>}
        </div>
      </header>

      {article.heroImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- editor-pasted URL, see article-card.tsx
        <img
          src={article.heroImageUrl}
          alt={article.heroImageAlt ?? ""}
          className="mb-10 w-full rounded-lg"
        />
      )}

      {unlocked ? (
        <div className="prose-article" dangerouslySetInnerHTML={{ __html: article.contentHtml ?? "" }} />
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
    </article>
    {unlocked && <CommentSection articleId={article.id} />}
    </>
  );
}
