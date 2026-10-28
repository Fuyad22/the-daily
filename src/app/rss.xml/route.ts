import { and, desc, eq, lte } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { SITE_NAME } from "@/lib/site";

const BASE_URL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

// Same reason as sitemap.ts: without this, a route with no dynamic segments
// gets executed at build time instead of request time.
export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const recent = await db.query.articles.findMany({
    where: and(eq(articles.status, "published"), lte(articles.publishedAt, new Date())),
    orderBy: (article, { desc }) => desc(article.publishedAt),
    limit: 30,
  });

  const items = recent
    .map((article) => {
      const description = article.excerpt || article.dek;
      return `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${BASE_URL}/articles/${article.slug}</link>
      <guid>${BASE_URL}/articles/${article.slug}</guid>
      <pubDate>${article.publishedAt ? new Date(article.publishedAt).toUTCString() : ""}</pubDate>${
        description ? `\n      <description>${escapeXml(description)}</description>` : ""
      }
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${BASE_URL}</link>
    <description>Independent daily reporting and analysis.</description>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
