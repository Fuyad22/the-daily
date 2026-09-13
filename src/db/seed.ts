import "./load-env";

import { db } from "./standalone";
import { categories, tags } from "./schema";

const SEED_CATEGORIES = [
  { slug: "world", name: "World" },
  { slug: "business", name: "Business" },
  { slug: "technology", name: "Technology" },
  { slug: "culture", name: "Culture" },
  { slug: "opinion", name: "Opinion" },
];

const SEED_TAGS = [
  { slug: "breaking", name: "Breaking" },
  { slug: "analysis", name: "Analysis" },
  { slug: "long-read", name: "Long read" },
];

async function main() {
  await db.insert(categories).values(SEED_CATEGORIES).onConflictDoNothing();
  await db.insert(tags).values(SEED_TAGS).onConflictDoNothing();
  console.log(`Seeded ${SEED_CATEGORIES.length} categories and ${SEED_TAGS.length} tags.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
