import Link from "next/link";
import { getBreakingArticle } from "@/lib/articles/public";

export async function BreakingNewsBanner() {
  const article = await getBreakingArticle();
  if (!article) return null;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="flex items-center justify-center gap-3 bg-danger px-6 py-2 text-center text-sm text-paper hover:bg-danger/90"
    >
      <span className="label shrink-0 rounded-sm bg-paper/20 px-1.5 py-0.5">Breaking</span>
      <span className="truncate font-semibold">{article.title}</span>
    </Link>
  );
}
