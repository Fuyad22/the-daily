import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/dal";
import { listCategories } from "@/lib/articles/data";

export async function SiteHeader() {
  const [user, categories] = await Promise.all([
    getCurrentUser(),
    listCategories().catch(() => []),
  ]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-5 sm:grid sm:grid-cols-3">
        <p className="label hidden text-muted sm:block">{today}</p>
        <Link
          href="/"
          className="font-display text-3xl font-semibold tracking-tight text-ink sm:justify-self-center sm:text-4xl"
        >
          The Daily
        </Link>
        <nav className="flex items-center gap-5 sm:justify-self-end">
          <Link href="/search" className="label text-muted hover:text-ink">
            Search
          </Link>
          {user ? (
            <Link href="/account" className="label text-ink hover:text-accent">
              Account
            </Link>
          ) : (
            <Link href="/login" className="label text-ink hover:text-accent">
              Sign in
            </Link>
          )}
        </nav>
      </div>
      {categories.length > 0 && (
        <nav className="mx-auto mt-4 flex max-w-6xl items-center justify-center gap-6 overflow-x-auto px-6 pb-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/section/${category.slug}`}
              className="label whitespace-nowrap text-muted hover:text-accent"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
