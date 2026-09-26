import "server-only";
import { generateHTML } from "@tiptap/html/server";
import sanitizeHtml from "sanitize-html";
import { articleExtensions } from "./extensions";

const ALLOWED_TAGS = [
  "p",
  "h2",
  "h3",
  "h4",
  "strong",
  "em",
  "s",
  "code",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "li",
  "hr",
  "br",
  "a",
  "img",
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "target", "rel"],
  img: ["src", "alt", "title"],
};

/**
 * Shared with src/lib/translate.ts: machine-translated HTML gets run back
 * through this before it's stored, same as editor-authored content.
 */
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
  });
}

/**
 * Converts a Tiptap JSON document to sanitized HTML. Run only on the server,
 * on save/publish — the public article page renders the stored result
 * directly, so readers never need Tiptap's client JS just to read an article.
 */
export function renderArticleContent(json: Record<string, unknown>): string {
  const html = generateHTML(json, articleExtensions);
  return sanitizeArticleHtml(html);
}
