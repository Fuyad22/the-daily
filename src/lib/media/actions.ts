"use server";

import { put } from "@vercel/blob";
import { requireRole } from "@/lib/auth/dal";
import { isBlobConfigured } from "@/lib/blob";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function uploadImage(
  formData: FormData
): Promise<{ url: string } | { error: string }> {
  await requireRole(["author", "editor", "admin"]);

  if (!isBlobConfigured()) {
    return { error: "Image upload isn't configured. Paste an image URL instead." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file provided." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Only JPEG, PNG, WebP, or GIF images are allowed." };
  }
  if (file.size > MAX_SIZE) {
    return { error: "Image must be smaller than 5MB." };
  }

  const blob = await put(`articles/${crypto.randomUUID()}-${file.name}`, file, {
    access: "public",
  });

  return { url: blob.url };
}
