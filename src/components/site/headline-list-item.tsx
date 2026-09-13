import Link from "next/link";
import { formatArticleDate } from "@/lib/format";
import type { ArticleCardData } from "./article-card";

export function HeadlineListItem({ article }: { article: ArticleCardData }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex flex-col gap-1.5 border-t border-line py-4 first:border-t-0 first:pt-0"
    >
      <div className="label flex items-center gap-2 text-ink">
        {article.category && <span>{article.category.name}</span>}
        {article.isPremium && <span className="text-premium">· Premium</span>}
      </div>
      <h3 className="font-display text-lg font-semibold leading-snug text-ink group-hover:text-accent">
        {article.title}
      </h3>
      {article.publishedAt && (
        <p className="text-xs text-muted">{formatArticleDate(article.publishedAt)}</p>
      )}
    </Link>
  );
}
