import Link from "next/link";
import { formatArticleDate } from "@/lib/format";
import { cn } from "@/lib/cn";

export type ArticleCardData = {
  id: string;
  slug: string;
  title: string;
  dek: string | null;
  excerpt: string | null;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  isPremium: boolean;
  publishedAt: Date | string | null;
  category?: { name: string; slug: string } | null;
};

export function ArticleCard({
  article,
  size = "default",
}: {
  article: ArticleCardData;
  size?: "default" | "large";
}) {
  const isLarge = size === "large";

  return (
    <Link href={`/articles/${article.slug}`} className="group flex flex-col gap-3">
      {article.heroImageUrl && (
        <div
          className={cn(
            "overflow-hidden rounded-lg bg-black/5",
            isLarge ? "aspect-[16/9]" : "aspect-[3/2]"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary editor-pasted
              URLs, not a known image host, so next/image's remotePatterns allowlist doesn't fit */}
          <img
            src={article.heroImageUrl}
            alt={article.heroImageAlt ?? ""}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="flex items-center gap-2 text-[12.5px] font-semibold uppercase tracking-wide text-accent">
        {article.category && <span>{article.category.name}</span>}
        {article.isPremium && <span className="text-premium">· Premium</span>}
      </div>
      <h3
        className={cn(
          "font-display font-semibold leading-tight text-ink group-hover:text-accent",
          isLarge ? "text-3xl sm:text-4xl" : "text-lg"
        )}
      >
        {article.title}
      </h3>
      {(article.dek || article.excerpt) && (
        <p
          className={cn(
            "font-serif text-muted",
            isLarge ? "text-lg" : "text-sm line-clamp-2"
          )}
        >
          {article.dek || article.excerpt}
        </p>
      )}
      {article.publishedAt && (
        <p className="text-xs text-muted">{formatArticleDate(article.publishedAt)}</p>
      )}
    </Link>
  );
}
