# Bluewave Credit Union — Production Environment Setup

Use this guide when configuring the Render web service for `bluewavecu.com`. Set all variables in the Render Dashboard under **Environment** for the web service (or in `render.yaml` with `sync: false` for secrets).

## Required Render environment variables

| Variable | Required | Example / notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Render PostgreSQL **internal** connection string |
| `JWT_SECRET` | Yes | 32+ character random secret (see below) |
| `NEXT_PUBLIC_APP_URL` | Yes | `https://bluewavecu.com` (must match public HTTPS URL) |
| `CRON_SECRET` | Yes | Random bearer secret for cron jobs (see below) |
| `RESEND_API_KEY` | Yes (production) | From [Resend](https://resend.com) after domain verification |
| `EMAIL_FROM` | Recommended | `Bluewave Credit Union <no-reply@bluewavecu.com>` |
| `ADMIN_ALERT_EMAIL` | Recommended | Admin inbox for alerts (registration, transfers, support) |
| `ALLOW_DEMO_SEED` | Yes | **`false`** in production (default in `render.yaml`) |
| `NODE_ENV` | Yes | `production` (set automatically by Blueprint) |

Copy from `.env.example` — never commit real values to Git.

---

## Generate secrets

### JWT secret

Use a cryptographically random string of at least 32 characters:

```bash
openssl rand -base64 48
```

Store the output as `JWT_SECRET` on Render. Changing it after deploy invalidates all existing sessions.

### Cron secret

Generate a separate random value for `CRON_SECRET`:

```bash
openssl rand -hex 32
```

Render Cron Jobs must call:

```bash
curl -X POST "$NEXT_PUBLIC_APP_URL/api/cron/run-jobs" \
  -H "Authorization: Bearer $CRON_SECRET"
```

Without a valid bearer token, the endpoint returns `401 Unauthorized`. If `CRON_SECRET` is missing in production, the endpoint returns a safe `500` error.

---

## Staging vs production

| Setting | Staging / demo | Production |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Staging URL (e.g. `https://bluewavecu-staging.onrender.com`) | `https://bluewavecu.com` |
| `ALLOW_DEMO_SEED` | `true` only if you want demo users/data | **`false`** always |
| `DATABASE_URL` | Separate staging database | Dedicated production database |
| `JWT_SECRET` / `CRON_SECRET` | Unique per environment | Unique per environment; never reuse staging secrets |

Use a **separate Render PostgreSQL instance** for staging and production. Do not point staging at production data.

---

## When to enable demo seed

Enable demo seed **only** on intentional demo or staging environments:

```bash
ALLOW_DEMO_SEED=true npm run db:seed
```

The seed script (`prisma/seed.ts`) **skips production** unless `ALLOW_DEMO_SEED=true` is explicitly set.

Demo credentials (after seed):

```text
Member: avery.morgan@bluewavecu.test / BluewaveDemo2026!
Admin:  admin@bluewavecu.test / BluewaveAdmin2026!
```

**Never** set `ALLOW_DEMO_SEED=true` on a production database with real member data.

---

## Database migration (after first deploy)

Once the web service can reach PostgreSQL, run migrations from a Render **Shell** or one-off job:

```bash
npx prisma migrate deploy
```

Local development uses:

```bash
npx prisma migrate dev
```

> **First deploy note:** If `prisma/migrations/` is not yet in the repo, create the initial migration locally when PostgreSQL is reachable (`npx prisma migrate dev --name init`), commit the files, redeploy, then run `npx prisma migrate deploy`.

Optional seed (staging/demo only):

```bash
ALLOW_DEMO_SEED=true npm run db:seed
```

Verify read-only database readiness locally or on staging:

```bash
npm run db:e2e-check
```

This confirms Prisma connectivity, demo admin/member users, accounts, and ledger/audit tables without mutating balances.

> **Migration blocked?** If PostgreSQL is not reachable locally, `prisma/migrations/` may still be empty. Create the initial migration when the database is available, commit the files, then run `migrate deploy` on Render.

---

## Email (Resend)

1. Verify your sending domain in Resend.
2. Set `RESEND_API_KEY`, `EMAIL_FROM`, and `ADMIN_ALERT_EMAIL` on Render.
3. In development, missing `RESEND_API_KEY` logs email payloads to the console instead of sending.

Production startup validation (`src/lib/env.ts`) requires `RESEND_API_KEY` when `NODE_ENV=production`.

---

## Quick verification after env setup

- [ ] `DATABASE_URL` uses Render **internal** hostname (not external URL from web service)
- [ ] `NEXT_PUBLIC_APP_URL` matches the URL users visit (HTTPS)
- [ ] `JWT_SECRET` is at least 32 characters
- [ ] `CRON_SECRET` is set and matches Render Cron Job header
- [ ] `ALLOW_DEMO_SEED=false`
- [ ] `npx prisma migrate deploy` completed successfully
- [ ] `npm run db:e2e-check` passes (staging/local after seed)
- [ ] Login works at `/login` with seeded or real credentials

See also: `DEPLOYMENT_CHECKLIST.md`, `POST_DEPLOY_QA.md`, and `README.md`.
