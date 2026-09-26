import Link from "next/link";
import { hasRoleAtLeast, requireRole, STAFF_ROLES } from "@/lib/auth/dal";
import { listArticles } from "@/lib/articles/data";
import { ArticleStatusPill } from "@/components/status-pill";
import { buttonVariants } from "@/components/ui/button";

export default async function StudioArticlesPage() {
  const user = await requireRole(STAFF_ROLES);
  const isEditorial = hasRoleAtLeast(user.role, "editor");
  const articles = await listArticles(isEditorial ? {} : { authorId: user.id });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Articles</h1>
        <Link href="/studio/articles/new" className={buttonVariants()}>
          New article
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        {articles.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted">No articles yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Title</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3">
                    <Link
                      href={`/studio/articles/${article.id}/edit`}
                      className="font-medium text-ink hover:text-accent"
                    >
                      {article.title || "Untitled"}
                    </Link>
                    {article.featured === "lead" && (
                      <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                        Top story
                      </span>
                    )}
                    {article.featured === "headline" && (
                      <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                        Headline
                      </span>
                    )}
                    {article.isBreaking && (
                      <span className="ml-2 rounded-full bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger">
                        Breaking
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <ArticleStatusPill status={article.status} />
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {new Date(article.updatedAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
