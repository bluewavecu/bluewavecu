import { getPrisma } from "@/lib/prisma";

export class BillPayPausedError extends Error {
  constructor() {
    super("Bill Pay is paused on your account. Contact member services to restore access.");
    this.name = "BillPayPausedError";
  }
}

export async function isBillPayPausedForUser(userId: string) {
  const user = await getPrisma().user.findUnique({
    where: { id: userId },
    select: { billPayPaused: true },
  });

  return user?.billPayPaused ?? false;
}

export async function assertBillPayAllowed(userId: string) {
  if (await isBillPayPausedForUser(userId)) {
    throw new BillPayPausedError();
  }
}
