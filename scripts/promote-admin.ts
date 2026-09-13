import { config } from "dotenv";

config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";

const email = process.argv[2];

if (!email) {
  console.error("Usage: npm run promote-admin -- <email>");
  process.exit(1);
}

async function main() {
  const [updated] = await db
    .update(user)
    .set({ role: "admin" })
    .where(eq(user.email, email))
    .returning({ id: user.id, email: user.email });

  if (!updated) {
    console.error(`No user found with email ${email}. They need to sign up first.`);
    process.exit(1);
  }

  console.log(`Promoted ${updated.email} to admin.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
