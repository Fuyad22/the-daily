import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articleAuthors, articles } from "@/db/schema";

export async function listArticles({ authorId }: { authorId?: string } = {}) {
  if (authorId) {
    const rows = await db
      .select({ article: articles })
      .from(articles)
      .innerJoin(articleAuthors, eq(articleAuthors.articleId, articles.id))
      .where(eq(articleAuthors.userId, authorId))
      .orderBy(desc(articles.updatedAt));
    return rows.map((row) => row.article);
  }

  return db.query.articles.findMany({
    orderBy: (article, { desc }) => desc(article.updatedAt),
  });
}

export async function getArticleForEdit(id: string) {
  return db.query.articles.findFirst({
    where: eq(articles.id, id),
    with: {
      tags: { with: { tag: true } },
      authors: true,
    },
  });
}

export async function listCategories() {
  return db.query.categories.findMany({
    orderBy: (category, { asc }) => asc(category.name),
  });
}

export async function listTags() {
  return db.query.tags.findMany({
    orderBy: (tag, { asc }) => asc(tag.name),
  });
}
