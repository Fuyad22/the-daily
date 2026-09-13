import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { listArticles } from "@/lib/articles/data";
import { ArticleStatusPill } from "@/components/status-pill";
import { buttonVariants } from "@/components/ui/button";

export default async function StudioDashboard() {
  const user = await requireRole(["author", "editor", "admin"]);
  const isEditorial = user.role === "editor" || user.role === "admin";
  const recent = await listArticles(isEditorial ? {} : { authorId: user.id });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <Link href="/studio/articles/new" className={buttonVariants()}>
          New article
        </Link>
      </div>

      <div className="rounded-xl border border-line bg-surface">
        <div className="border-b border-line px-5 py-3 text-sm font-semibold text-ink">
          Recently updated
        </div>
        {recent.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted">No articles yet.</p>
        ) : (
          <ul>
            {recent.slice(0, 8).map((article) => (
              <li
                key={article.id}
                className="flex items-center justify-between border-b border-line px-5 py-3 last:border-0"
              >
                <Link
                  href={`/studio/articles/${article.id}/edit`}
                  className="text-sm font-medium text-ink hover:text-accent"
                >
                  {article.title || "Untitled"}
                </Link>
                <ArticleStatusPill status={article.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
