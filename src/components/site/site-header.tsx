import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/dal";
import { listCategories } from "@/lib/articles/data";

export async function SiteHeader() {
  const [user, categories] = await Promise.all([getCurrentUser(), listCategories()]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/search" className="text-sm text-muted hover:text-ink">
          Search
        </Link>
        <Link
          href="/"
          className="font-display text-2xl font-semibold tracking-tight text-ink"
        >
          The Daily
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <Link href="/account" className="text-ink hover:text-accent">
              Account
            </Link>
          ) : (
            <Link href="/login" className="text-ink hover:text-accent">
              Sign in
            </Link>
          )}
        </nav>
      </div>
      {categories.length > 0 && (
        <div className="mx-auto flex max-w-6xl items-center gap-5 overflow-x-auto px-6 pb-3 text-[13px] font-semibold uppercase tracking-wide text-muted">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/section/${category.slug}`}
              className="whitespace-nowrap hover:text-accent"
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
