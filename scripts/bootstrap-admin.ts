import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  BOOTSTRAP_ADMIN_EMAIL,
  BOOTSTRAP_ADMIN_NAME,
  BOOTSTRAP_ADMIN_PASSWORD,
  DEMO_ADMIN_USERNAME,
} from "../src/lib/bootstrapAccounts";
import { INSTITUTION } from "../src/lib/institution";
import { assertDatabaseUrl, createPrismaPgAdapter } from "../src/lib/databaseUrl";

function loadDotEnv() {
  const root = resolve(__dirname, "..");
  const candidates = [".env.local", ".env.production.local", ".env"];

  for (const fileName of candidates) {
    const envPath = resolve(root, fileName);

    if (!existsSync(envPath)) {
      continue;
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
}

function createPrismaClient() {
  const connectionString = assertDatabaseUrl("bootstrap-admin");

  return new PrismaClient({
    adapter: createPrismaPgAdapter(connectionString),
  });
}

async function main() {
  loadDotEnv();

  const prisma = createPrismaClient();
  const resetPassword = process.env.BOOTSTRAP_ADMIN_RESET_PASSWORD === "true";
  const passwordHash = await bcrypt.hash(BOOTSTRAP_ADMIN_PASSWORD, 12);

  try {
    const existing = await prisma.user.findUnique({
      where: { email: BOOTSTRAP_ADMIN_EMAIL },
      select: { id: true },
    });

    const admin = await prisma.user.upsert({
      where: { email: BOOTSTRAP_ADMIN_EMAIL },
      update: {
        fullName: BOOTSTRAP_ADMIN_NAME,
        username: DEMO_ADMIN_USERNAME,
        role: "ADMIN",
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
        ...(resetPassword ? { passwordHash } : {}),
      },
      create: {
        fullName: BOOTSTRAP_ADMIN_NAME,
        username: DEMO_ADMIN_USERNAME,
        email: BOOTSTRAP_ADMIN_EMAIL,
        phone: INSTITUTION.phone.display,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
    });

    console.log("[bootstrap-admin] Operations admin ready.");
    console.log(`  Email: ${admin.email}`);
    console.log(`  Sign in: /lex/auth`);
    if (existing && !resetPassword) {
      console.log("  Existing password preserved (set BOOTSTRAP_ADMIN_RESET_PASSWORD=true to reset).");
    } else {
      console.log(`  Initial password: ${BOOTSTRAP_ADMIN_PASSWORD}`);
      console.log("  Change the password under Settings after your first login.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("[bootstrap-admin] Failed:", error);
  console.warn("[bootstrap-admin] Continuing deploy without blocking the build.");
  process.exit(0);
});
