# Codex Rules

Read these before every change:

- `README.md`
- `PROJECT_LOG.md`
- `CODEX_RULES.md`

## Product direction

Bluewave is a **production credit union experience** for `bluewavecu.com` — member-owned, NCUA-insured language, real online banking flows, and an internal **operations console** for approvals. It is not a demo app, prototype, or generic fintech landing page.

- Use **member / membership / share draft / share savings** language on public and member UI.
- Reserve backend terms (**ledger**, **operations review**, **API**, **workflow**) for admin console and server code only.
- Never reintroduce mock data fallbacks, placeholder banking copy, or “demo platform” wording in member-facing UI.

## Canonical constants

| Concern | Source |
| --- | --- |
| Legal name, phone, address, routing, NCUA disclaimer | `src/lib/institution.ts` |
| Logo assets and display heights | `src/lib/branding.ts` |
| Member vs operations auth paths | `src/lib/authRoutes.ts` |
| Member nav and protected routes | `src/lib/memberRoutes.ts` |
| Admin nav | `src/lib/adminRoutes.ts` |
| Share account type labels | `getShareAccountLabel()` in `institution.ts` |

Do not hardcode contact info in components — import from `institution.ts`.

## Auth and routing

| Portal | Sign-in URL | Notes |
| --- | --- | --- |
| Members | `/auth` | Public “Online banking” CTA |
| Operations | `/lex/auth` | Not linked from marketing; admin-only |
| Register | `/register` | New membership enrollment |
| Legacy | `/login` | Permanent redirect to `/auth` |

Middleware rules:

- Unauthenticated member routes → `/auth?next=…`
- Unauthenticated admin routes → `/lex/auth?next=…`
- Signed-in **non-admin** visiting `/admin/*` → **404** (not dashboard redirect)
- Login API rejects portal mismatch (member credentials on admin portal and vice versa)

## Brand and layout

- Main logo: `/public/images/logo.webp` via `BrandLogo` (default 44px height).
- Auth enrollment logo: `/public/images/auth_logo.webp` via `AuthLogo`.
- Favicon: `/public/images/icon.webp`.
- On light auth/sidebar surfaces use `BrandLogo tone="dark"` (navy badge).
- Keep premium, mobile-first styling; extend existing layout/admin/ui components rather than rebuilding.

## Money movement safety (do not bypass)

- Member transfers and bill pay create **pending** records only.
- Balances change only after **operations approval** and **ledger posting**.
- Cron/worker jobs enqueue review-ready work — they never post balances directly.
- No direct balance edits; use controlled adjustments with ledger entries.

## Deployment (Vercel + Supabase)

- Primary production host: **Vercel** (`vercel.json`).
- Database: **Supabase Postgres** via Vercel integration env vars.
- Build runs `prisma migrate deploy` using **`POSTGRES_URL_NON_POOLING`** (direct connection). Do not run migrations through the pooler (`6543`) — it hangs builds.
- Cron on Hobby plan: **daily** (`0 0 * * *`), not hourly.
- `ALLOW_DEMO_SEED=false` on real production data.

## Engineering workflow

- Extend existing components and APIs; do not overwrite completed work unless instructed.
- Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` before committing.
- Update `PROJECT_LOG.md` after every completed step.
- Do **not** push or commit unless the user asks.

## Public legal pages

- `/privacy` — Privacy Policy
- `/terms` — Terms of Use
- Footer must link to both; NCUA disclaimer from `INSTITUTION.ncuaDisclaimer`.
