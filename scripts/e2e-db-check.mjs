/**
 * Read-only local database readiness check for Bluewave CU E2E flows.
 * Does not mutate balances or post ledger entries.
 *
 * Usage: npm run db:e2e-check
 * Requires: DATABASE_URL in .env and `npx prisma generate`
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const DEMO_MEMBER_EMAIL = "avery.morgan@bluewavecu.test";
const DEMO_ADMIN_EMAIL = "admin@bluewavecu.test";

/** Core ledger / audit tables that must exist after migration */
const PROTECTED_TABLES = [
  "LedgerEntry",
  "AdminAuditLog",
  "EventLog",
  "JobQueue",
  "AdjustmentRequest",
  "BillPayment",
];

function loadDotEnv() {
  const envPath = resolve(ROOT, ".env");

  if (!existsSync(envPath)) {
    return;
  }

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function printNextSteps(messages) {
  console.log("\nNext steps:");

  for (const message of messages) {
    console.log(`  • ${message}`);
  }
}

function ok(label, detail) {
  console.log(`✓ ${label}${detail ? `: ${detail}` : ""}`);
}

function warn(label, detail) {
  console.warn(`⚠ ${label}${detail ? `: ${detail}` : ""}`);
}

function fail(label, detail) {
  console.error(`✗ ${label}${detail ? `: ${detail}` : ""}`);
}

loadDotEnv();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  fail("DATABASE_URL is not set");
  printNextSteps([
    "Copy `.env.example` to `.env` and set DATABASE_URL to your PostgreSQL connection string.",
    "Start PostgreSQL locally or use a Render/staging database URL.",
    "Re-run: npm run db:e2e-check",
  ]);
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

let exitCode = 0;

try {
  console.log("Bluewave CU — database E2E readiness check (read-only)\n");

  await prisma.$queryRaw`SELECT 1`;
  ok("Prisma connection");

  const [userCount, accountCount, transactionCount] = await Promise.all([
    prisma.user.count(),
    prisma.account.count(),
    prisma.transaction.count(),
  ]);

  ok("Users", String(userCount));
  ok("Accounts", String(accountCount));
  ok("Transactions", String(transactionCount));

  const adminUser = await prisma.user.findFirst({
    where: { email: DEMO_ADMIN_EMAIL, role: "ADMIN" },
    select: { id: true, email: true, status: true },
  });

  if (adminUser) {
    ok("Admin user", `${adminUser.email} (${adminUser.status})`);
  } else {
    warn("Admin user missing", DEMO_ADMIN_EMAIL);
    exitCode = 1;
  }

  const memberUser = await prisma.user.findFirst({
    where: { email: DEMO_MEMBER_EMAIL, role: "USER" },
    select: { id: true, email: true, status: true },
  });

  if (memberUser) {
    ok("Member user", `${memberUser.email} (${memberUser.status})`);
  } else {
    warn("Member user missing", DEMO_MEMBER_EMAIL);
    exitCode = 1;
  }

  if (accountCount > 0) {
    ok("At least one account exists");
  } else {
    warn("No accounts found");
    exitCode = 1;
  }

  const ledgerCount = await prisma.ledgerEntry.count();
  ok("Ledger entries", String(ledgerCount));

  for (const table of PROTECTED_TABLES) {
    try {
      await prisma.$queryRawUnsafe(`SELECT 1 FROM "${table}" LIMIT 1`);
      ok(`Table ${table}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      fail(`Table ${table}`, message);
      exitCode = 1;
    }
  }

  const migrationDir = resolve(ROOT, "prisma/migrations");
  const migrationEntries = existsSync(migrationDir) ? readdirSync(migrationDir) : [];
  const hasMigrations = migrationEntries.some((entry) => !entry.startsWith("."));

  if (!hasMigrations) {
    warn("No committed Prisma migrations found", "run `npx prisma migrate dev --name init` when DB is reachable");
  } else {
    ok("Prisma migrations folder", `${migrationEntries.length} entries`);
  }

  console.log("");

  if (exitCode === 0) {
    console.log("Database looks ready for local E2E testing.");
    printNextSteps([
      "Run `npm run dev` and sign in with demo credentials from README.md.",
      "Exercise member flows (transfers, bill pay) and admin review queues.",
      "Before production deploy, run `npx prisma migrate deploy` when migrations exist.",
    ]);
  } else {
    console.log("Database is reachable but seed/migration data is incomplete.");
    printNextSteps([
      "If `prisma/migrations/` is empty, run `npx prisma migrate dev --name init` when PostgreSQL is reachable.",
      "Seed demo data: `ALLOW_DEMO_SEED=true npm run db:seed` (local/staging only).",
      "Re-run: npm run db:e2e-check",
    ]);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  fail("Database check failed", message);
  printNextSteps([
    "Ensure PostgreSQL is running and DATABASE_URL is correct.",
    "Run `npx prisma generate` then retry.",
    "If migrations were never applied, run `npx prisma migrate dev --name init`.",
  ]);
  exitCode = 1;
} finally {
  await prisma.$disconnect();
}

process.exit(exitCode);
