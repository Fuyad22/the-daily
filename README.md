# The Daily

A production-quality newspaper platform: article CMS, public reader site, Stripe subscriptions/paywall, and moderated comments.

"The Daily" is a placeholder name — easy to rename before launch.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind v4 (CSS-first config, see `src/app/globals.css`)
- Postgres via Drizzle ORM
- Better Auth for accounts/roles
- Stripe for subscriptions
- Tiptap for article authoring
- Vercel Blob for images, Resend for email, Upstash for rate limiting

## Getting started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

See `AGENTS.md` before writing routing/auth code — this Next.js version has breaking changes from older conventions (e.g. `proxy.ts` replacing `middleware.ts`).

## Status

Early scaffold. Database, auth, CMS, public site, subscriptions, and comments are being built in phases — see the project plan for the full build order.
