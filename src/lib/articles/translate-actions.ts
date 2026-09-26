"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { isTranslationConfigured, translateHtml, translateLines } from "@/lib/translate";
import { sanitizeArticleHtml } from "./render";
import { getPublishedArticleBySlug } from "./public";
import type { ActionResult } from "./actions";

type Translation = { title: string; dek: string | null; contentHtml: string | null };

/**
 * Machine-translates a published article to Bengali on first request and
 * caches the result on the row, so later readers (and re-visits) skip the
 * API call entirely. Only ever called from the public article page's toggle.
 */
export async function translateArticleToBengali(slug: string): Promise<ActionResult<Translation>> {
  if (!isTranslationConfigured()) {
    return { error: "Bangla translation isn't set up for this site yet." };
  }

  const article = await getPublishedArticleBySlug(slug);
  if (!article) return { error: "Article not found." };

  if (article.titleBn) {
    return { title: article.titleBn, dek: article.dekBn, contentHtml: article.contentHtmlBn };
  }

  try {
    const [title, dek] = await translateLines([article.title, article.dek ?? ""]);
    const contentHtml = article.contentHtml
      ? sanitizeArticleHtml(await translateHtml(article.contentHtml))
      : "";

    await db
      .update(articles)
      .set({
        titleBn: title,
        dekBn: dek || null,
        contentHtmlBn: contentHtml || null,
      })
      .where(eq(articles.id, article.id));

    return { title, dek: dek || null, contentHtml: contentHtml || null };
  } catch {
    return { error: "Translation failed. Try again in a moment." };
  }
}
