import "server-only";
import { cache } from "react";
import { and, desc, eq, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  articleAuthors,
  articles,
  articleTags,
  categories,
  tags as tagsTable,
  user,
} from "@/db/schema";

function publishedFilter() {
  return and(eq(articles.status, "published"), lte(articles.publishedAt, new Date()));
}

export const getPublishedArticleBySlug = cache(async (slug: string) => {
  return db.query.articles.findFirst({
    where: and(eq(articles.slug, slug), publishedFilter()),
    with: {
      category: true,
      tags: { with: { tag: true } },
      authors: { with: { user: true } },
    },
  });
});

export async function listPublishedArticles(
  opts: {
    categoryId?: string;
    tagId?: string;
    authorId?: string;
    limit?: number;
    offset?: number;
  } = {}
) {
  const { categoryId, tagId, authorId, limit = 20, offset = 0 } = opts;

  let idFilter;
  if (tagId) {
    const rows = await db
      .select({ id: articleTags.articleId })
      .from(articleTags)
      .where(eq(articleTags.tagId, tagId));
    idFilter = inArray(
      articles.id,
      rows.map((r) => r.id)
    );
  } else if (authorId) {
    const rows = await db
      .select({ id: articleAuthors.articleId })
      .from(articleAuthors)
      .where(eq(articleAuthors.userId, authorId));
    idFilter = inArray(
      articles.id,
      rows.map((r) => r.id)
    );
  }

  return db.query.articles.findMany({
    where: and(
      publishedFilter(),
      categoryId ? eq(articles.categoryId, categoryId) : undefined,
      idFilter
    ),
    with: { category: true },
    orderBy: (article, { desc }) => desc(article.publishedAt),
    limit,
    offset,
  });
}

/**
 * Homepage feed: editors can pin one "lead" story and up to 4 "headline"
 * stories (src/lib/articles/actions.ts enforces only one lead at a time).
 * Unfilled slots — including the whole feed on a site with no manual
 * placements yet — backfill from the normal reverse-chronological list, so
 * curation is optional rather than something that has to be kept up to date.
 */
export async function getHomepageFeed() {
  const HEADLINE_COUNT = 4;
  const REST_COUNT = 8;

  const [manualLead] = await db.query.articles.findMany({
    where: and(publishedFilter(), eq(articles.featured, "lead")),
    with: { category: true },
    orderBy: (article, { desc }) => desc(article.publishedAt),
    limit: 1,
  });

  const manualHeadlines = await db.query.articles.findMany({
    where: and(publishedFilter(), eq(articles.featured, "headline")),
    with: { category: true },
    orderBy: (article, { desc }) => desc(article.publishedAt),
    limit: HEADLINE_COUNT,
  });

  const usedIds = new Set(
    [manualLead, ...manualHeadlines].filter((a) => a !== undefined).map((a) => a.id)
  );

  const chronological = await listPublishedArticles({
    limit: 1 + HEADLINE_COUNT + REST_COUNT + usedIds.size,
  });
  const fillers = chronological.filter((article) => !usedIds.has(article.id));

  const lead = manualLead ?? fillers.shift();
  const headlines = [
    ...manualHeadlines,
    ...fillers.splice(0, HEADLINE_COUNT - manualHeadlines.length),
  ];
  const rest = fillers.slice(0, REST_COUNT);

  return { lead, headlines, rest };
}

export const getBreakingArticle = cache(async () => {
  return db.query.articles.findFirst({
    where: and(publishedFilter(), eq(articles.isBreaking, true)),
    orderBy: (article, { desc }) => desc(article.publishedAt),
  });
});

export async function getCategoryBySlug(slug: string) {
  return db.query.categories.findFirst({ where: eq(categories.slug, slug) });
}

export async function getTagBySlug(slug: string) {
  return db.query.tags.findFirst({ where: eq(tagsTable.slug, slug) });
}

export async function getAuthorById(id: string) {
  return db.query.user.findFirst({ where: eq(user.id, id) });
}

/**
 * Computes the tsvector at query time rather than via a stored/generated
 * column — correct full-text search semantics (websearch_to_tsquery handles
 * phrases and exclusions) without a schema migration. Fine for a new site's
 * article volume; add a GIN functional index if this ever shows up as slow.
 */
export async function searchArticles(query: string, { limit = 20 }: { limit?: number } = {}) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return db
    .select()
    .from(articles)
    .where(
      and(
        publishedFilter(),
        sql`to_tsvector('english', ${articles.title} || ' ' || coalesce(${articles.dek}, '') || ' ' || coalesce(${articles.excerpt}, '')) @@ websearch_to_tsquery('english', ${trimmed})`
      )
    )
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}
