// A plain Drizzle client for one-off Node scripts (seed, promote-admin) that
// run via tsx outside the Next.js server runtime. Importing "@/db" instead
// would trip its "server-only" guard, which only resolves correctly inside
// Next's own bundling.
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and add your Postgres connection string."
  );
}

const client = postgres(process.env.DATABASE_URL, { prepare: false });

export const db = drizzle(client, { schema });
