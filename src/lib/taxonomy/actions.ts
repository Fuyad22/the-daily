"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, tags } from "@/db/schema";
import { EDITORIAL_ROLES, requireRole, STAFF_ROLES } from "@/lib/auth/dal";
import { slugify } from "@/lib/articles/slug";
import type { ActionResult } from "@/lib/articles/actions";

const nameSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  description: z.string().trim().max(300).optional(),
});

export async function createCategory(input: unknown): Promise<ActionResult> {
  await requireRole(EDITORIAL_ROLES);
  const parsed = nameSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await db.insert(categories).values({
    name: parsed.data.name,
    slug: slugify(parsed.data.name),
    description: parsed.data.description || null,
  });

  revalidatePath("/studio/categories");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireRole(EDITORIAL_ROLES);
  try {
    await db.delete(categories).where(eq(categories.id, id));
  } catch {
    return { error: "Move or delete its articles first — a category in use can't be removed." };
  }
  revalidatePath("/studio/categories");
  return { ok: true };
}

export async function createTag(input: unknown): Promise<ActionResult> {
  await requireRole(STAFF_ROLES);
  const parsed = nameSchema.pick({ name: true }).safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await db.insert(tags).values({
    name: parsed.data.name,
    slug: slugify(parsed.data.name),
  });

  revalidatePath("/studio/tags");
  return { ok: true };
}

export async function deleteTag(id: string): Promise<ActionResult> {
  await requireRole(EDITORIAL_ROLES);
  await db.delete(tags).where(eq(tags.id, id));
  revalidatePath("/studio/tags");
  return { ok: true };
}
