import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/dal";
import { listCategories } from "@/lib/articles/data";
import { SITE_NAME } from "@/lib/site";

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
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 pt-5 sm:grid sm:grid-cols-[1fr_auto_1fr]">
        <p className="label hidden text-muted lg:block">{today}</p>
        <Link
          href="/"
          className="whitespace-nowrap font-display text-2xl font-semibold tracking-tight text-ink sm:col-start-2 sm:row-start-1 sm:text-3xl lg:text-4xl"
        >
          {SITE_NAME}
        </Link>
        <nav className="flex items-center gap-5 sm:col-start-3 sm:row-start-1 sm:justify-self-end">
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
