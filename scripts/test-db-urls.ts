import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.production.local" });

function pick(name: string) {
  const value = process.env[name];
  return value?.trim() ? value.trim() : undefined;
}

async function test(label: string, url?: string) {
  if (!url) {
    console.log(`${label}: MISSING`);
    return;
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

  try {
    await prisma.user.count();
    console.log(`${label}: OK`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`${label}: FAIL ${message.split("\n")[0]}`);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await test("NON_POOLING", pick("POSTGRES_URL_NON_POOLING"));
  await test("PRISMA_URL", pick("POSTGRES_PRISMA_URL"));
  await test("POSTGRES_URL", pick("POSTGRES_URL"));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
