# Bluewave Credit Union — Deployment Checklist

Use this checklist before the first GitHub push and Render deployment. Check items off manually as you verify each route and API in staging or production.

## Pre-deploy requirements

- [ ] PostgreSQL database provisioned (Render PostgreSQL recommended)
- [ ] All required environment variables set (see `.env.example` and `README.md`)
- [ ] `CRON_SECRET` set for production cron jobs
- [ ] `ALLOW_DEMO_SEED=false` in production (only `true` for intentional demo/staging)
- [ ] Initial Prisma migrations created and applied (`npx prisma migrate deploy` on Render)
- [ ] Resend domain verified if production email is required

## Migration commands

**Production (Render shell or one-off job):**

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

> **Note:** If `prisma/migrations/` is empty, run `npx prisma migrate dev --name init` locally against a reachable database before the first production deploy. Commit the generated migration files to Git.

---

## Public routes (expect HTTP 200)

| Route | Verified |
| --- | --- |
| `/` | [ ] |
| `/login` | [ ] |
| `/register` | [ ] |
| `/mobile-app` | [ ] |

Additional public marketing pages (optional QA):

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

## Member protected routes (unauthenticated → redirect to `/login`)

| Route | Verified |
| --- | --- |
| `/dashboard` | [ ] |
| `/accounts` | [ ] |
| `/transactions` | [ ] |
| `/transfers` | [ ] |
| `/cards` | [ ] |
| `/member/loans` | [ ] |
| `/member/support` | [ ] |
| `/member/security` | [ ] |
| `/bill-pay` | [ ] |
| `/disputes` | [ ] |
| `/profile` | [ ] |

> Public marketing pages `/loans`, `/support`, and `/security` are **not** member app routes. Authenticated banking for those areas lives under `/member/*`.

---

## Admin protected routes (unauthenticated → redirect to `/login`; non-admin → `/dashboard`)

| Route | Verified |
| --- | --- |
| `/admin` | [ ] |
| `/admin/users` | [ ] |
| `/admin/accounts` | [ ] |
| `/admin/transactions` | [ ] |
| `/admin/support` | [ ] |
| `/admin/audit-logs` | [ ] |
| `/admin/risk` | [ ] |
| `/admin/bill-pay` | [ ] |
| `/admin/jobs` | [ ] |
| `/admin/reconciliation` | [ ] |
| `/admin/finance-reports` | [ ] |
| `/admin/adjustments` | [ ] |
| `/admin/disputes` | [ ] |
| `/admin/event-logs` | [ ] |
| `/admin/compliance` | [ ] |

---

## API security smoke checks

Run with dev server or staging URL. Replace `BASE_URL` as needed.

| Check | Expected | Verified |
| --- | --- | --- |
| `GET /api/dashboard` (no cookie) | `401` | [ ] |
| `GET /api/profile` (no cookie) | `401` | [ ] |
| `GET /api/statements?month=1&year=2026` (no cookie) | `401` | [ ] |
| `GET /api/admin/users` (no cookie) | `401` | [ ] |
| `GET /api/admin/users` (member cookie) | `403` | [ ] |
| `POST /api/cron/run-jobs` (no bearer secret) | `401` | [ ] |
| `POST /api/auth/logout` then `GET /api/auth/me` | cookie cleared / `401` | [ ] |

Example curl commands:

```bash
BASE_URL=http://localhost:3000

curl -s -o /dev/null -w "%{http_code}\n" "$BASE_URL/api/dashboard"
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$BASE_URL/api/cron/run-jobs"
curl -s -o /dev/null -w "%{http_code}\n" "$BASE_URL/api/admin/compliance"
```

---

## Post-deploy functional QA

- [ ] Run local/staging DB readiness: `npm run db:e2e-check` (read-only; requires PostgreSQL + seed)
- [ ] Member login with demo or real credentials
- [ ] Admin login and admin dashboard loads
- [ ] Transfer creates pending transaction (no automatic balance post)
- [ ] Admin approve transfer posts via ledger
- [ ] Statement CSV export downloads
- [ ] Statement PDF export downloads
- [ ] Profile update and KYC submission
- [ ] Admin compliance review updates KYC status
- [ ] Cron job runs with valid `Authorization: Bearer $CRON_SECRET`
- [ ] Email notifications send when `RESEND_API_KEY` is configured

---

## Production safety reminders

- Never enable `ALLOW_DEMO_SEED=true` on real member data
- Never commit `.env` or secrets to Git
- Cron and worker jobs process queue items only — they do not post balances directly
- Ledger posting requires admin approval workflows
- No real external payment processing is implemented

---

## Pending if database unavailable locally

- [ ] Create and commit initial Prisma migration files (`npx prisma migrate dev --name init` when PostgreSQL is reachable)
- [ ] Run `npm run db:e2e-check` after seed to confirm admin/member users and ledger tables
- [ ] Run `npx prisma migrate deploy` on Render after first deploy
- [ ] Run demo seed on staging only (`ALLOW_DEMO_SEED=true`)
- [ ] Full DB-backed E2E testing (transfers, ledger, KYC, cron worker)

---

## Step 20 — visual polish, accessibility, responsive QA

### Logo and brand

- [ ] Only `/images/logo.webp` is referenced site-wide (`BrandLogo` component)
- [ ] Logo is not stretched or pixelated at 44px header height
- [ ] Login/register light panels show logo via `tone="dark"` navy badge
- [ ] Navbar and footer use default logo on navy backgrounds

### Accessibility

- [ ] Icon-only buttons have `aria-label` (navbar menu, drawer close, etc.)
- [ ] Form inputs have visible labels
- [ ] Focus rings visible on keyboard navigation (`:focus-visible` in global styles)
- [ ] Loading states expose `role="status"` / screen-reader text where practical

### Responsive layouts

Test at ~375px (mobile), ~768px (tablet), and ~1280px (desktop):

- [ ] Public navbar mobile menu opens/closes without overlap
- [ ] Member sidebar hidden on mobile; bottom nav scrolls horizontally
- [ ] Admin sidebar hidden on mobile; bottom nav scrolls horizontally
- [ ] Wide tables scroll horizontally (`overflow-x-auto` on table wrappers)
- [ ] Detail drawers usable on mobile width
- [ ] Auth forms remain readable without horizontal scroll

See `POST_DEPLOY_QA.md` for live-domain checks after deploy.
