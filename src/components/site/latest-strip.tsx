import Link from "next/link";
import { listPublishedArticles } from "@/lib/articles/public";
import { formatRelativeTime } from "@/lib/format";

// Real headlines only — hidden entirely until there are published articles.
export async function LatestStrip() {
  const articles = await listPublishedArticles({ limit: 4 }).catch(() => []);
  if (articles.length === 0) return null;

  return (
    <div className="mx-auto max-w-6xl px-6">
      <div className="overflow-x-auto border-b border-line">
        <ul className="mx-auto flex w-max items-center gap-x-8 py-3 text-sm">
          <li className="label text-danger">Latest</li>
          {articles.map((article) => (
            <li key={article.id} className="whitespace-nowrap">
              <Link
                href={`/articles/${article.slug}`}
                className="inline-block max-w-[280px] truncate align-bottom font-semibold text-ink hover:underline"
              >
                {article.title}
              </Link>
              {article.publishedAt && (
                <span className="ml-2 text-xs text-danger">
                  {formatRelativeTime(article.publishedAt)}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
