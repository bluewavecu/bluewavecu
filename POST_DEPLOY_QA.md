# Bluewave Credit Union — Post-Deploy QA

Run this checklist after the first successful Render deploy and DNS propagation for `bluewavecu.com`. Replace `BASE_URL` with your live URL (e.g. `https://bluewavecu.com`).

---

## Local database readiness (before E2E)

After PostgreSQL is running, migrations are applied, and development seed is loaded (local/staging only):

```bash
npx prisma generate
npm run db:e2e-check
```

The script is **read-only** — it verifies Prisma connectivity, user/account counts, bootstrap admin/member presence, and core ledger/audit tables. It prints next steps if data is missing.

> **Migration note:** If `prisma/migrations/` is still empty, initial migration remains blocked until PostgreSQL is reachable locally. Run `npx prisma migrate dev --name init` then commit migration files before production deploy.

---

## Public pages

| Check | Pass |
| --- | --- |
| Homepage loads (`/`) | [ ] |
| Login page loads (`/login`) | [ ] |
| Register page loads (`/register`) | [ ] |
| Mobile app page loads (`/mobile-app`) | [ ] |
| Marketing footer links resolve (no 404) | [ ] |

---

## Member flows

Sign in with a development bootstrap member (if seeded on staging) or a registered account:

`avery.morgan@bluewavecu.test` / `BluewaveDemo2026!` (staging bootstrap only)

| Check | Pass |
| --- | --- |
| Member login succeeds | [ ] |
| Dashboard loads with accounts summary | [ ] |
| `/accounts` shows masked account numbers | [ ] |
| Create transfer → status `PENDING` (no automatic balance post) | [ ] |
| `/bill-pay` — create payment → review queue | [ ] |
| `/disputes` — submit dispute on owned transaction | [ ] |
| `/profile` — update profile fields | [ ] |
| `/profile` — submit KYC → status `SUBMITTED` | [ ] |
| Statement CSV export downloads | [ ] |
| Statement PDF export downloads (`format=pdf`) | [ ] |
| Logout clears session | [ ] |

---

## Admin flows

Sign in as admin:

`admin@bluewavecu.test` / `BluewaveAdmin2026!` (staging bootstrap only)

| Check | Pass |
| --- | --- |
| Admin login → `/admin` overview | [ ] |
| `/admin/transactions` — approve pending transfer posts via ledger | [ ] |
| `/admin/risk` — risk events visible | [ ] |
| `/admin/compliance` — KYC review (verify / reject with note) | [ ] |
| `/admin/reconciliation` — read-only reconciliation data | [ ] |
| `/admin/finance-reports` — reports load with date filters | [ ] |
| Non-admin member cannot access `/admin` (redirect to dashboard) | [ ] |

---

## Security checks

Run from terminal (no auth cookie):

```bash
BASE_URL=https://bluewavecu.com

curl -s -o /dev/null -w "dashboard: %{http_code}\n" "$BASE_URL/api/dashboard"
curl -s -o /dev/null -w "profile: %{http_code}\n" "$BASE_URL/api/profile"
curl -s -o /dev/null -w "admin_users: %{http_code}\n" "$BASE_URL/api/admin/users"
curl -s -o /dev/null -w "cron: %{http_code}\n" -X POST "$BASE_URL/api/cron/run-jobs"
```

| Check | Expected | Pass |
| --- | --- | --- |
| `GET /api/dashboard` (no cookie) | `401` | [ ] |
| `GET /api/profile` (no cookie) | `401` | [ ] |
| `GET /api/admin/users` (no cookie) | `401` | [ ] |
| `GET /api/admin/users` (member cookie) | `403` | [ ] |
| `POST /api/cron/run-jobs` (no bearer) | `401` | [ ] |
| `POST /api/cron/run-jobs` (valid bearer) | `200` + job summary | [ ] |
| `POST /api/auth/logout` then `GET /api/auth/me` | cookie cleared / `401` | [ ] |
| API responses never include `passwordHash` | — | [ ] |
| Account/card numbers masked in member UI | — | [ ] |

---

## Cron job (Render)

- [ ] Render Cron Job configured: `POST /api/cron/run-jobs`
- [ ] Header: `Authorization: Bearer <CRON_SECRET>`
- [ ] Event logs show `CRON_RUN_STARTED` / `CRON_RUN_COMPLETED` after run
- [ ] Due queue jobs move to review-ready state only (no direct balance posting)

---

## Email (if Resend configured)

- [ ] Registration welcome email sends
- [ ] Transfer created admin alert sends
- [ ] KYC status update email sends after admin review

---

## DNS / SSL

- [ ] `https://bluewavecu.com` loads with valid certificate
- [ ] `www` redirects or resolves correctly
- [ ] Cloudflare SSL mode: **Full (strict)**

---

## Responsive QA (mobile / tablet / desktop)

| Check | Pass |
| --- | --- |
| Public navbar mobile menu usable | [ ] |
| Member bottom nav scrolls; no sidebar overlap | [ ] |
| Admin bottom nav scrolls; tables scroll horizontally | [ ] |
| Login/register forms readable at 375px width | [ ] |
| Detail drawers close with Escape / overlay tap | [ ] |

---

## Sign-off

| Item | Value |
| --- | --- |
| Deploy URL | |
| Deploy date | |
| Migration applied (`migrate deploy`) | [ ] Yes / [ ] No |
| Development seed used | [ ] No (production) / [ ] Yes (staging) |
| QA completed by | |
