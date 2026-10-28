import Link from "next/link";
import { listCategories } from "@/lib/articles/data";
import { SITE_NAME } from "@/lib/site";

export async function SiteFooter() {
  const categories = await listCategories().catch(() => []);

  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-8 gap-y-10 px-6 py-12 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <p className="font-display text-2xl font-semibold text-ink">{SITE_NAME}</p>
          <p className="mt-3 max-w-[26ch] font-serif text-sm text-muted">
            Independent daily reporting and analysis.
          </p>
        </div>
        {categories.length > 0 && (
          <div>
            <p className="label text-muted">Sections</p>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link href={`/section/${category.slug}`} className="text-ink hover:text-accent">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <p className="label text-muted">More</p>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm">
            <li>
              <Link href="/search" className="text-ink hover:text-accent">
                Search
              </Link>
            </li>
            <li>
              <Link href="/subscribe" className="text-ink hover:text-accent">
                Subscribe
              </Link>
            </li>
            <li>
              <Link href="/rss.xml" className="text-ink hover:text-accent">
                RSS
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line px-6 py-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
