import { randomInt } from "node:crypto";
import type { PrismaClient } from "@/generated/prisma/client";

const ACCOUNT_NUMBER_PREFIX = "33";
const ACCOUNT_NUMBER_LENGTH = 12;

function buildAccountNumberCandidate() {
  const suffix = randomInt(0, 10 ** (ACCOUNT_NUMBER_LENGTH - ACCOUNT_NUMBER_PREFIX.length))
    .toString()
    .padStart(ACCOUNT_NUMBER_LENGTH - ACCOUNT_NUMBER_PREFIX.length, "0");

  return `${ACCOUNT_NUMBER_PREFIX}${suffix}`;
}

export async function generateUniqueAccountNumber(
  prisma: Pick<PrismaClient, "account">,
  maxAttempts = 25,
) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const accountNumber = buildAccountNumberCandidate();
    const existing = await prisma.account.findUnique({
      where: { accountNumber },
      select: { id: true },
    });

    if (!existing) {
      return accountNumber;
    }
  }

  throw new Error("Unable to generate a unique account number. Please try again.");
}

export function isProvisionedAccountNumber(accountNumber: string | null | undefined) {
  return Boolean(
    accountNumber &&
      accountNumber.length === ACCOUNT_NUMBER_LENGTH &&
      accountNumber.startsWith(ACCOUNT_NUMBER_PREFIX),
  );
}
