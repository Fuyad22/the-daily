import "server-only";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";

export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "article";
}

export async function uniqueArticleSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let suffix = 1;

  while (
    await db.query.articles.findFirst({
      where: excludeId
        ? and(eq(articles.slug, slug), ne(articles.id, excludeId))
        : eq(articles.slug, slug),
    })
  ) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  return slug;
}
