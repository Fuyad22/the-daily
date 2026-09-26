import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements, userAc } from "better-auth/plugins/admin/access";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";

// Better Auth's admin plugin only recognizes role names listed in `roles`, so
// "super_admin" needs its own entry here — reusing admin's built-in
// permission set — or adminRoles below fails validation at startup.
const ac = createAccessControl(defaultStatements);
const superAdminAc = ac.newRole(adminAc.statements);

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
    sendOnSignUp: true,
  },
  plugins: [
    admin({
      defaultRole: "reader",
      ac,
      roles: { super_admin: superAdminAc, user: userAc },
      adminRoles: ["super_admin"],
    }),
    // Must stay last: sets Better Auth's own cookies from within a Server Action.
    nextCookies(),
  ],
});

export type { Role } from "./roles";
