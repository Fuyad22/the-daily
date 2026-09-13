import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { comments, type CommentStatus } from "@/db/schema";

export async function getApprovedCommentsForArticle(articleId: string) {
  return db.query.comments.findMany({
    where: (comment, { and, eq }) =>
      and(eq(comment.articleId, articleId), eq(comment.status, "approved")),
    with: { author: true },
    orderBy: (comment, { asc }) => asc(comment.createdAt),
  });
}

export async function listCommentsForModeration(status: CommentStatus = "pending") {
  return db.query.comments.findMany({
    where: eq(comments.status, status),
    with: { author: true, article: true },
    orderBy: desc(comments.createdAt),
  });
}
