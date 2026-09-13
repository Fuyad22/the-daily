import type { MetadataRoute } from "next";
import { and, eq, lte } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

const BASE_URL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

// Without this, Next treats sitemap.ts as statically optimizable and queries
// the database at build time instead of request time — unlike every other
// DB-backed route in this app, which is dynamic by default.
export const dynamic = "force-dynamic";

// A single file is plenty for a new site (the sitemap protocol caps a file at
// 50,000 URLs) — switch to generateSitemaps() and split by page once article
// count is anywhere close to that.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [publishedArticles, allCategories] = await Promise.all([
    db.query.articles.findMany({
      where: and(eq(articles.status, "published"), lte(articles.publishedAt, new Date())),
      columns: { slug: true, updatedAt: true },
    }),
    db.query.categories.findMany({ columns: { slug: true } }),
  ]);

  return [
    { url: BASE_URL, changeFrequency: "hourly", priority: 1 },
    ...allCategories.map((category) => ({
      url: `${BASE_URL}/section/${category.slug}`,
      changeFrequency: "hourly" as const,
      priority: 0.6,
    })),
    ...publishedArticles.map((article) => ({
      url: `${BASE_URL}/articles/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
