# Northium Credit Union — Post-Deploy QA

Run after a successful **Vercel** deploy and DNS propagation for `northiumcu.org`.

```bash
BASE_URL=https://northiumcu.org
```

---

## Local / staging database readiness

```bash
npx prisma generate
npm run db:e2e-check
```

Read-only check for Prisma connectivity, users, accounts, and ledger tables.

---

## Public pages

| Check | Pass |
| --- | --- |
| Homepage `/` | [ ] |
| Member sign-in `/auth` | [ ] |
| Register `/register` | [ ] |
| `/login` redirects to `/auth` | [ ] |
| Privacy `/privacy` | [ ] |
| Terms `/terms` | [ ] |
| Footer links: Privacy, Terms, Online banking | [ ] |
| Contact phone `(646) 776-4480` (from `institution.ts`) | [ ] |
| Mobile app `/mobile-app` | [ ] |

---

## Member flows

Sign in at **`/auth`** (staging bootstrap: `avery.morgan@northiumcu.org.test` / `NorthiumDemo2026!`).

| Check | Pass |
| --- | --- |
| Dashboard loads; no “demo” or “API” jargon in UI | [ ] |
| Accounts show **Share Draft / Share Savings** labels | [ ] |
| Transfer → `PENDING`; copy mentions member services review | [ ] |
| Bill pay → review queue | [ ] |
| Disputes empty state when none on file | [ ] |
| Profile & verification submission | [ ] |
| Statement CSV + PDF export | [ ] |
| Notifications: `ADMIN` type shows as **Account update** | [ ] |
| Sign out → returns to `/auth` | [ ] |

---

## Operations console flows

Sign in at **`/lex/auth`**.

| Environment | Email | Initial password |
| --- | --- | --- |
| Production | `support@northiumcu.org` | `MAKEmoney@36` (change under **Admin → System Settings**) |
| Staging (demo seed) | `support@northiumcu.org` or seeded admin | `MAKEmoney@36` or seed output |

| Check | Pass |
| --- | --- |
| Command center `/admin` loads | [ ] |
| Approve pending transfer → ledger posts | [ ] |
| Compliance / KYC review | [ ] |
| Reconciliation read-only | [ ] |
| Finance reports with date filters | [ ] |

**Security:** Signed-in member visiting `/admin` receives **404**, not dashboard redirect.

| Check | Pass |
| --- | --- |
| Member at `/admin` → 404 | [ ] |
| Member creds rejected at `/lex/auth` | [ ] |
| Admin creds rejected at `/auth` | [ ] |

---

## API security

```bash
curl -s -o /dev/null -w "dashboard: %{http_code}\n" "$BASE_URL/api/dashboard"
curl -s -o /dev/null -w "admin: %{http_code}\n" "$BASE_URL/api/admin/users"
curl -s -o /dev/null -w "cron: %{http_code}\n" -X POST "$BASE_URL/api/cron/run-jobs"
```

| Check | Expected | Pass |
| --- | --- | --- |
| `GET /api/dashboard` (no cookie) | `401` | [ ] |
| `GET /api/admin/users` (no cookie) | `401` | [ ] |
| `POST /api/cron/run-jobs` (no bearer) | `401` | [ ] |
| `POST /api/cron/run-jobs` (valid bearer) | `200` | [ ] |
| Responses exclude `passwordHash` | — | [ ] |

---

## Cron (Vercel daily)

- [ ] `CRON_SECRET` set on Vercel Production
- [ ] Manual curl succeeds (see `PRODUCTION_ENV_SETUP.md`)
- [ ] Event logs show cron start/complete

---

## Email (Resend)

- [ ] Welcome email on registration
- [ ] Transfer alert to operations inbox
- [ ] Verification status email after compliance review

---

## DNS / SSL

- [ ] `https://northiumcu.org` — valid certificate, HTTP 200
- [ ] `www` resolves or redirects correctly

---

## Responsive QA

| Check | Pass |
| --- | --- |
| Public navbar mobile menu | [ ] |
| Member bottom nav at 375px | [ ] |
| Admin bottom nav; tables scroll horizontally | [ ] |
| Auth forms readable on mobile | [ ] |

---

## Sign-off

| Item | Value |
| --- | --- |
| Deploy URL | |
| Deploy date | |
| Git commit | |
| Migrations via Vercel build | [ ] Yes / [ ] No |
| Demo seed on production | [ ] No |
| QA completed by | |
