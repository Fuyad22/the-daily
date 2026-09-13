import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { categories } from "./categories";
import { tags } from "./tags";

export const articleStatusEnum = pgEnum("article_status", [
  "draft",
  "in_review",
  "scheduled",
  "published",
  "archived",
]);
export type ArticleStatus = (typeof articleStatusEnum.enumValues)[number];

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  dek: text("dek"),
  contentJson: jsonb("content_json").$type<Record<string, unknown>>(),
  contentHtml: text("content_html"),
  excerpt: text("excerpt"),
  heroImageUrl: text("hero_image_url"),
  heroImageAlt: text("hero_image_alt"),
  status: articleStatusEnum("status").notNull().default("draft"),
  isPremium: boolean("is_premium").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const articleAuthors = pgTable(
  "article_authors",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(1),
  },
  (table) => [primaryKey({ columns: [table.articleId, table.userId] })]
);

export const articleTags = pgTable(
  "article_tags",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.articleId, table.tagId] })]
);

export const articlesRelations = relations(articles, ({ one, many }) => ({
  category: one(categories, {
    fields: [articles.categoryId],
    references: [categories.id],
  }),
  authors: many(articleAuthors),
  tags: many(articleTags),
}));

export const articleAuthorsRelations = relations(articleAuthors, ({ one }) => ({
  article: one(articles, {
    fields: [articleAuthors.articleId],
    references: [articles.id],
  }),
  user: one(user, {
    fields: [articleAuthors.userId],
    references: [user.id],
  }),
}));

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, {
    fields: [articleTags.tagId],
    references: [tags.id],
  }),
}));
