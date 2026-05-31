# Bluewave Credit Union — Deployment Checklist

Use this checklist before and after production deploys on **Vercel + Supabase**. Check items manually in staging or at `https://bluewavecu.com`.

## Pre-deploy requirements

- [ ] Supabase Postgres linked to Vercel (or `DATABASE_URL` / `POSTGRES_*` vars set)
- [ ] `POSTGRES_URL_NON_POOLING` available for build-time migrations
- [ ] `JWT_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY` set on Vercel Production
- [ ] `ALLOW_DEMO_SEED=false` in production
- [ ] Initial Prisma migration committed (`prisma/migrations/`) — build runs `prisma migrate deploy`
- [ ] Resend domain verified for production email

## Migration commands

**Production (Vercel build — automatic via `vercel.json`):**

```bash
npx prisma generate
export DATABASE_URL="$POSTGRES_URL_NON_POOLING"
npx prisma migrate deploy
npm run build
```

**Manual shell (if needed):**

```bash
npx prisma migrate deploy
```

**Local development:**

```bash
npx prisma migrate dev
```

**Seed (demo/staging only):**

```bash
ALLOW_DEMO_SEED=true npm run db:seed
```

> **Build hang fix:** Never run `migrate deploy` through the Supabase pooler (`6543`). Vercel build uses `POSTGRES_URL_NON_POOLING`.

---

## Public routes (expect HTTP 200)

| Route | Verified |
| --- | --- |
| `/` | [ ] |
| `/auth` (member online banking) | [ ] |
| `/register` | [ ] |
| `/login` (redirects to `/auth`) | [ ] |
| `/privacy` | [ ] |
| `/terms` | [ ] |
| `/mobile-app` | [ ] |

Additional public marketing pages:

| Route | Verified |
| --- | --- |
| `/personal` | [ ] |
| `/business` | [ ] |
| `/savings` | [ ] |
| `/loans` | [ ] |
| `/support` | [ ] |
| `/security` | [ ] |
| `/about` | [ ] |
| `/rates` | [ ] |
| `/careers` | [ ] |
| `/newsroom` | [ ] |
| `/contact` | [ ] |

---

## Member protected routes (unauthenticated → redirect to `/auth`)

| Route | Verified |
| --- | --- |
| `/dashboard` | [ ] |
| `/accounts` | [ ] |
| `/transactions` | [ ] |
| `/transfers` | [ ] |
| `/bill-pay` | [ ] |
| `/statements` | [ ] |
| `/payees` | [ ] |
| `/cards` | [ ] |
| `/member/loans` | [ ] |
| `/member/support` | [ ] |
| `/member/security` | [ ] |
| `/disputes` | [ ] |
| `/notifications` | [ ] |
| `/profile` | [ ] |
| `/settings` | [ ] |

> Public `/support` and `/security` are marketing pages. Signed-in member tools live under `/member/*` or banking routes above.

---

## Operations console (admin)

| Route | Unauthenticated | Member signed in | Admin signed in |
| --- | --- | --- | --- |
| `/lex/auth` | Sign-in page | Sign-in page | Redirect to `/admin` |
| `/admin` and `/admin/*` | Redirect to `/lex/auth` | **404** | Console loads |

| Route | Verified |
| --- | --- |
| `/admin` (command center) | [ ] |
| `/admin/users` | [ ] |
| `/admin/accounts` | [ ] |
| `/admin/transactions` | [ ] |
| `/admin/transfer-reviews` | [ ] |
| `/admin/bill-pay` | [ ] |
| `/admin/compliance` | [ ] |
| `/admin/reconciliation` | [ ] |
| `/admin/finance-reports` | [ ] |
| `/admin/adjustments` | [ ] |
| `/admin/disputes` | [ ] |
| `/admin/event-logs` | [ ] |
| `/admin/risk` | [ ] |
| `/admin/jobs` | [ ] |
| `/admin/support` | [ ] |

---

## API security smoke checks

```bash
BASE_URL=https://bluewavecu.com

curl -s -o /dev/null -w "dashboard: %{http_code}\n" "$BASE_URL/api/dashboard"
curl -s -o /dev/null -w "admin_users: %{http_code}\n" "$BASE_URL/api/admin/users"
curl -s -o /dev/null -w "cron: %{http_code}\n" -X POST "$BASE_URL/api/cron/run-jobs"
```

| Check | Expected | Verified |
| --- | --- | --- |
| `GET /api/dashboard` (no cookie) | `401` | [ ] |
| `GET /api/profile` (no cookie) | `401` | [ ] |
| `GET /api/admin/users` (no cookie) | `401` | [ ] |
| `GET /api/admin/users` (member cookie) | `403` | [ ] |
| `POST /api/cron/run-jobs` (no bearer) | `401` | [ ] |
| Member login at `/auth` with admin creds | Rejected | [ ] |
| Admin login at `/lex/auth` with member creds | Rejected | [ ] |

---

## Post-deploy functional QA

- [ ] `npm run db:e2e-check` passes on staging after seed
- [ ] Member sign-in at `/auth` loads dashboard
- [ ] Operations sign-in at `/lex/auth` loads `/admin`
- [ ] Transfer creates `PENDING` record (no automatic balance post)
- [ ] Operations approve transfer posts via ledger
- [ ] Statement CSV and PDF export download
- [ ] Profile update and verification submission
- [ ] Footer phone/email match `src/lib/institution.ts`
- [ ] Cron with valid `Authorization: Bearer $CRON_SECRET` (daily on Hobby)
- [ ] Email sends when `RESEND_API_KEY` configured

---

## Production safety reminders

- Never enable `ALLOW_DEMO_SEED=true` on real member data
- Never commit `.env` or secrets
- Cron/worker jobs do not post balances directly
- Ledger posting requires operations approval workflows
- No real external payment networks — simulation only

---

## Brand, accessibility, responsive QA

- [ ] Only `/images/logo.webp` via `BrandLogo`; auth pages use `AuthLogo`
- [ ] Contact info from `institution.ts` (not hardcoded)
- [ ] Privacy/Terms linked in footer
- [ ] Keyboard focus visible; drawers close with Escape
- [ ] Mobile member/admin bottom nav usable at 375px

See `POST_DEPLOY_QA.md` for live-domain sign-off.
