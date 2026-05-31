# Bluewave Credit Union — Production Environment Setup

Configure **Vercel Production** for `bluewavecu.com` with **Supabase Postgres** (Vercel Marketplace integration). Copy variable names from `env.vercel.template`.

## Required Vercel environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `POSTGRES_URL_NON_POOLING` | Yes (build + migrations) | Direct Supabase connection — used in `vercel.json` build |
| `POSTGRES_PRISMA_URL` | Yes (runtime) | Pooled connection for Prisma at runtime |
| `POSTGRES_URL` | Yes | Supabase integration injects this |
| `DATABASE_URL` | Optional | Falls back to `POSTGRES_PRISMA_URL` / `POSTGRES_URL` in app code |
| `JWT_SECRET` | Yes | `openssl rand -base64 48` |
| `NEXT_PUBLIC_APP_URL` | Yes | `https://bluewavecu.com` |
| `CRON_SECRET` | Yes | `openssl rand -hex 32` |
| `RESEND_API_KEY` | Yes (production) | Required by `src/lib/env.ts` in production |
| `EMAIL_FROM` | Recommended | `Bluewave Credit Union <no-reply@bluewavecu.com>` |
| `ADMIN_ALERT_EMAIL` | Recommended | Operations inbox for alerts |
| `ALLOW_DEMO_SEED` | Yes | **`false`** on production |
| `NODE_ENV` | Yes | `production` on Production deploys |

Never commit real values to Git.

---

## Generate secrets

```bash
openssl rand -base64 48   # JWT_SECRET
openssl rand -hex 32      # CRON_SECRET
```

Changing `JWT_SECRET` after deploy invalidates existing sessions.

---

## Database migrations on Vercel

`vercel.json` build command:

```bash
npx prisma generate && \
export DATABASE_URL="${POSTGRES_URL_NON_POOLING:-${DATABASE_URL:-$POSTGRES_URL}}" && \
npx prisma migrate deploy && \
npm run build
```

**Why non-pooling:** `prisma migrate deploy` against the Supabase pooler (`6543`) can hang until the build times out (~45 minutes). Always migrate on the direct URL.

If a deployment is stuck in **Building**, remove it in the Vercel dashboard or via `vercel remove <deployment-id>`, then redeploy.

Manual migration (Render shell, local, or one-off):

```bash
npx prisma migrate deploy
```

Local development:

```bash
npx prisma migrate dev
```

---

## Staging vs production

| Setting | Staging / preview | Production |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Preview URL | `https://bluewavecu.com` |
| `ALLOW_DEMO_SEED` | `true` only for demo data | **`false`** |
| Database | Separate Supabase project or branch | Dedicated production DB |
| Secrets | Unique per environment | Unique per environment |

---

## Operations admin (production)

Created automatically during Vercel build (`npm run bootstrap:admin` after migrations):

```text
Email:    support@bluewavecu.com
Password: MAKEmoney@36
Sign in:  /lex/auth
```

Change the password under **Admin → System Settings**. To force-reset the bootstrap password:

```bash
BOOTSTRAP_ADMIN_RESET_PASSWORD=true npm run bootstrap:admin
```

---

## Demo seed (staging only)

```bash
ALLOW_DEMO_SEED=true npm run db:seed
```

Demo member credentials (after seed):

```text
Member:  avery.morgan@bluewavecu.test / BluewaveDemo2026!
```

**Never** set `ALLOW_DEMO_SEED=true` on production member data.

Verify read-only readiness:

```bash
npm run db:e2e-check
```

---

## Cron (Vercel Hobby)

Configured in `vercel.json`:

- **Schedule:** daily at midnight UTC (`0 0 * * *`)
- **Path:** `/api/cron/run-jobs`
- **Auth:** `Authorization: Bearer $CRON_SECRET`

```bash
curl -X POST "https://bluewavecu.com/api/cron/run-jobs" \
  -H "Authorization: Bearer $CRON_SECRET"
```

Hourly cron is not available on Vercel Hobby.

---

## Email (Resend)

1. Verify sending domain in Resend.
2. Set `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_ALERT_EMAIL` on Vercel.
3. In development, missing `RESEND_API_KEY` logs payloads to the console.

---

## Institution contact (code source of truth)

Public contact info lives in `src/lib/institution.ts`:

- Address: 2000 McKinney Ave, Dallas, TX 75201
- Phone: (214) 555-0147
- Email: support@bluewavecu.com
- Routing: 311978875 (seed + display)

Update `institution.ts` once — Footer, Contact, and Support pages import from it.

---

## Auth URLs

| Portal | URL |
| --- | --- |
| Member online banking | `/auth` |
| Operations console | `/lex/auth` (keep private) |
| Register | `/register` |
| Legacy login | `/login` → redirects to `/auth` |

---

## Quick verification after env setup

- [ ] `POSTGRES_URL_NON_POOLING` set (build migrations succeed in ~1–2 min)
- [ ] `NEXT_PUBLIC_APP_URL` matches live HTTPS URL
- [ ] `ALLOW_DEMO_SEED=false`
- [ ] Member login at `/auth` works
- [ ] Operations login at `/lex/auth` works
- [ ] `https://bluewavecu.com/privacy` and `/terms` load

See also: `DEPLOYMENT_CHECKLIST.md`, `POST_DEPLOY_QA.md`, `README.md`.

## Alternate: Render deployment

Render remains supported via `render.yaml`. Run `npx prisma migrate deploy` from a Render shell after deploy. Prefer Vercel for current production (`bluewavecu.com`).
