import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/dal";
import { listCategories } from "@/lib/articles/data";
import { SITE_NAME } from "@/lib/site";
import { LatestStrip } from "./latest-strip";

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
    <header className="bg-paper">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-4 pb-5 pt-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-start">
          <div className="hidden flex-col gap-1.5 text-[15px] text-ink lg:flex">
            <p>{today}</p>
            <Link href="/subscribe" className="text-muted hover:text-ink">
              Subscribe
            </Link>
          </div>

          <Link
            href="/"
            className="whitespace-nowrap font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl"
          >
            {SITE_NAME}
          </Link>

          <nav className="flex items-center gap-5 text-[15px] lg:justify-self-end">
            <Link href="/search" className="flex items-center gap-1.5 text-ink hover:text-accent">
              <svg
                viewBox="0 0 20 20"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="8.5" cy="8.5" r="5.5" />
                <path d="m13 13 4 4" />
              </svg>
              Search
            </Link>
            {user ? (
              <Link href="/account" className="font-semibold text-ink hover:text-accent">
                Account
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-sm bg-ink px-4 py-1.5 text-sm font-semibold text-paper hover:bg-ink/85"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>

        {categories.length > 0 && (
          <div className="overflow-x-auto border-b-4 border-double border-ink">
            <nav className="mx-auto flex w-max items-center gap-x-9 pb-3 pt-1 text-base text-ink">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/section/${category.slug}`}
                  className="whitespace-nowrap hover:underline hover:underline-offset-4"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
      <LatestStrip />
    </header>
  );
}
