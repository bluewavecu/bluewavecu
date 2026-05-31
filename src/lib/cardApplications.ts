import { maskAccountNumber, getAccountDisplayName } from "@/lib/bankingSerialize";
import {
  formatCardExpiry,
  formatMaskedMastercardPan,
  generateMastercardPan,
  getDefaultCardExpiry,
  MASTERCARD_BIN_PREFIX,
} from "@/lib/cardNumbers";
import { getOrCreateCustomerProfile } from "@/lib/customerProfile";
import { sendAdminAlertEmail } from "@/lib/email";
import { writeAdminEvent, writeEventLog } from "@/lib/eventLog";
import { createAccountNotification } from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";
import { getTransactionBlockMessage } from "@/lib/userAccess";
import type {
  CardApplicationRecord,
  CardApplicationStatus,
  CardType,
  PageCard,
} from "@/types/banking";
import type { CardApplyInput } from "@/lib/validators";

function formatAddress(params: {
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}) {
  return [params.addressLine1, params.addressLine2, `${params.city}, ${params.state} ${params.postalCode}`, params.country]
    .filter(Boolean)
    .join("\n");
}

function assertProfileReadyForCardApplication(profile: {
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
}) {
  if (!profile.addressLine1?.trim() || !profile.city?.trim() || !profile.state?.trim() || !profile.postalCode?.trim()) {
    throw new Error("Complete your profile address before applying for a card.");
  }
}

export function serializeCardApplication(record: {
  id: string;
  accountId: string;
  cardType: CardType;
  cardholderName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  status: CardApplicationStatus;
  reviewNote: string | null;
  reviewedAt: Date | null;
  cardId: string | null;
  createdAt: Date;
  updatedAt: Date;
  account?: { accountType: string; accountNumber: string | null };
}): CardApplicationRecord {
  const masked = record.account ? maskAccountNumber(record.account.accountNumber) : null;

  return {
    id: record.id,
    accountId: record.accountId,
    cardType: record.cardType,
    cardholderName: record.cardholderName,
    email: record.email,
    phone: record.phone,
    addressLine1: record.addressLine1,
    addressLine2: record.addressLine2,
    city: record.city,
    state: record.state,
    postalCode: record.postalCode,
    country: record.country,
    formattedAddress: formatAddress(record),
    status: record.status,
    reviewNote: record.reviewNote,
    reviewedAt: record.reviewedAt?.toISOString() ?? null,
    cardId: record.cardId,
    linkedAccount: record.account
      ? {
          displayName: getAccountDisplayName(record.account.accountType as "CHECKING" | "SAVINGS" | "CREDIT"),
          maskedAccountNumber: masked!.masked,
        }
      : undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function serializePageCard(card: {
  id: string;
  accountId: string;
  cardType: CardType;
  last4: string;
  panPrefix: string;
  network: string;
  expiryMonth: number | null;
  expiryYear: number | null;
  cardholderName: string;
  status: PageCard["status"];
  spendingLimit: { toNumber: () => number };
  createdAt: Date;
  updatedAt: Date;
  account: { id: string; accountType: string; accountNumber: string | null };
}): PageCard {
  const masked = maskAccountNumber(card.account.accountNumber);

  return {
    id: card.id,
    accountId: card.accountId,
    cardType: card.cardType,
    last4: card.last4,
    panPrefix: card.panPrefix,
    network: card.network,
    maskedPan: formatMaskedMastercardPan({ panPrefix: card.panPrefix, last4: card.last4 }),
    expiryMonth: card.expiryMonth,
    expiryYear: card.expiryYear,
    expiryLabel:
      card.expiryMonth && card.expiryYear
        ? formatCardExpiry(card.expiryMonth, card.expiryYear)
        : null,
    cardholderName: card.cardholderName,
    status: card.status,
    spendingLimit: card.spendingLimit.toNumber(),
    linkedAccount: {
      id: card.account.id,
      accountType: card.account.accountType as PageCard["linkedAccount"]["accountType"],
      displayName: getAccountDisplayName(card.account.accountType as "CHECKING" | "SAVINGS" | "CREDIT"),
      maskedAccountNumber: masked.masked,
    },
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  };
}

export async function submitCardApplication(params: { userId: string; input: CardApplyInput }) {
  const prisma = getPrisma();

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      status: true,
      deletedAt: true,
    },
  });

  if (!user || user.deletedAt) {
    throw new Error("Account not found.");
  }

  const blockMessage = getTransactionBlockMessage({ status: user.status, deletedAt: user.deletedAt });

  if (blockMessage) {
    throw new Error(blockMessage);
  }

  const account = await prisma.account.findFirst({
    where: {
      id: params.input.accountId,
      userId: params.userId,
      status: "ACTIVE",
    },
  });

  if (!account) {
    throw new Error("Select a valid account for this card.");
  }

  const profile = await getOrCreateCustomerProfile(params.userId);
  assertProfileReadyForCardApplication(profile);

  const existingPending = await prisma.cardApplication.findFirst({
    where: {
      userId: params.userId,
      accountId: params.input.accountId,
      cardType: params.input.cardType,
      status: "PENDING",
    },
  });

  if (existingPending) {
    throw new Error("You already have a pending card application for this account.");
  }

  const existingActiveCard = await prisma.card.findFirst({
    where: {
      userId: params.userId,
      accountId: params.input.accountId,
      cardType: params.input.cardType,
      status: { in: ["ACTIVE", "LOCKED"] },
    },
  });

  if (existingActiveCard) {
    throw new Error("This account already has an active card of that type.");
  }

  const application = await prisma.cardApplication.create({
    data: {
      userId: params.userId,
      accountId: params.input.accountId,
      cardType: params.input.cardType,
      cardholderName: user.fullName,
      email: user.email,
      phone: user.phone,
      addressLine1: profile.addressLine1!,
      addressLine2: profile.addressLine2,
      city: profile.city!,
      state: profile.state!,
      postalCode: profile.postalCode!,
      country: profile.country ?? "US",
    },
    include: {
      account: {
        select: { accountType: true, accountNumber: true },
      },
    },
  });

  void sendAdminAlertEmail({
    subject: "New card application",
    message: [
      `${user.fullName} applied for a ${params.input.cardType.toLowerCase()} Mastercard.`,
      `Account: ${getAccountDisplayName(account.accountType)}`,
      `Email: ${user.email}`,
      `Phone: ${user.phone}`,
      `Address: ${formatAddress({
        addressLine1: profile.addressLine1!,
        addressLine2: profile.addressLine2,
        city: profile.city!,
        state: profile.state!,
        postalCode: profile.postalCode!,
        country: profile.country ?? "US",
      }).replaceAll("\n", ", ")}`,
      "Status: Pending review",
    ].join("\n"),
    idempotencyKey: `admin-alert/card-application/${application.id}`,
  });

  void writeAdminEvent({
    eventType: "CARD_APPLICATION_SUBMITTED",
    actorId: params.userId,
    entityId: application.id,
    message: `${user.fullName} submitted a ${params.input.cardType.toLowerCase()} card application.`,
    metadata: {
      accountId: params.input.accountId,
      cardType: params.input.cardType,
    },
  });

  return serializeCardApplication(application);
}

function defaultSpendingLimit(cardType: CardType) {
  return cardType === "CREDIT" ? 10_000 : 2_500;
}

export async function reviewCardApplication(params: {
  applicationId: string;
  adminId: string;
  action: "APPROVE" | "DECLINE";
  reviewNote?: string;
  spendingLimit?: number;
}) {
  const prisma = getPrisma();

  const application = await prisma.cardApplication.findUnique({
    where: { id: params.applicationId },
    include: {
      account: true,
      user: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });

  if (!application) {
    throw new Error("Card application not found.");
  }

  if (application.status !== "PENDING") {
    throw new Error("Only pending card applications can be reviewed.");
  }

  if (params.action === "DECLINE") {
    const declined = await prisma.cardApplication.update({
      where: { id: application.id },
      data: {
        status: "DECLINED",
        reviewNote: params.reviewNote?.trim() || null,
        reviewedAt: new Date(),
        reviewedBy: params.adminId,
      },
      include: {
        account: { select: { accountType: true, accountNumber: true } },
      },
    });

    void createAccountNotification({
      userId: application.userId,
      title: "Card application update",
      message: `Your ${application.cardType.toLowerCase()} card application was not approved.${params.reviewNote ? ` Note: ${params.reviewNote}` : ""}`,
      metadata: { href: "/auth/cards" },
    });

    void writeEventLog({
      eventType: "CARD_APPLICATION_DECLINED",
      actorId: params.adminId,
      entityType: "CardApplication",
      entityId: application.id,
      message: `Card application declined for ${application.user.fullName}.`,
      severity: "INFO",
    });

    return serializeCardApplication(declined);
  }

  const { pan: _pan, last4, panPrefix } = generateMastercardPan(MASTERCARD_BIN_PREFIX);
  const { expiryMonth, expiryYear } = getDefaultCardExpiry();
  const spendingLimit = params.spendingLimit ?? defaultSpendingLimit(application.cardType);

  const result = await prisma.$transaction(async (tx) => {
    const card = await tx.card.create({
      data: {
        userId: application.userId,
        accountId: application.accountId,
        cardType: application.cardType,
        last4,
        panPrefix,
        network: "MASTERCARD",
        expiryMonth,
        expiryYear,
        cardholderName: application.cardholderName,
        status: "ACTIVE",
        spendingLimit,
      },
    });

    const updatedApplication = await tx.cardApplication.update({
      where: { id: application.id },
      data: {
        status: "APPROVED",
        reviewNote: params.reviewNote?.trim() || null,
        reviewedAt: new Date(),
        reviewedBy: params.adminId,
        cardId: card.id,
      },
      include: {
        account: { select: { accountType: true, accountNumber: true } },
      },
    });

    return { card, updatedApplication };
  });

  void createAccountNotification({
    userId: application.userId,
    title: "Your Mastercard is ready",
    message: `Your ${application.cardType.toLowerCase()} Mastercard ending ${last4} was approved and is now active in online banking.`,
    metadata: { href: "/auth/cards" },
  });

  void writeEventLog({
    eventType: "CARD_APPLICATION_APPROVED",
    actorId: params.adminId,
    entityType: "CardApplication",
    entityId: application.id,
    message: `Card application approved for ${application.user.fullName}. Mastercard ending ${last4} issued.`,
    severity: "INFO",
    metadata: { cardId: result.card.id, panPrefix, last4 },
  });

  void writeAdminEvent({
    eventType: "CARD_ISSUED",
    actorId: params.adminId,
    entityId: result.card.id,
    message: `Issued Mastercard ending ${last4} to ${application.user.fullName}.`,
    metadata: {
      applicationId: application.id,
      cardType: application.cardType,
      panPrefix,
    },
  });

  return serializeCardApplication(result.updatedApplication);
}

export async function issueMemberCard(params: {
  userId: string;
  adminId: string;
  accountId: string;
  cardType: CardType;
  spendingLimit?: number;
}) {
  const prisma = getPrisma();

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      status: true,
      deletedAt: true,
      role: true,
    },
  });

  if (!user || user.deletedAt || user.role !== "USER") {
    throw new Error("Member not found.");
  }

  const account = await prisma.account.findFirst({
    where: {
      id: params.accountId,
      userId: params.userId,
      status: "ACTIVE",
    },
  });

  if (!account) {
    throw new Error("Select a valid active account for this member.");
  }

  const existingActiveCard = await prisma.card.findFirst({
    where: {
      userId: params.userId,
      accountId: params.accountId,
      cardType: params.cardType,
      status: { in: ["ACTIVE", "LOCKED"] },
    },
  });

  if (existingActiveCard) {
    throw new Error("This account already has an active card of that type.");
  }

  const { pan: _pan, last4, panPrefix } = generateMastercardPan(MASTERCARD_BIN_PREFIX);
  const { expiryMonth, expiryYear } = getDefaultCardExpiry();
  const spendingLimit = params.spendingLimit ?? defaultSpendingLimit(params.cardType);

  const card = await prisma.card.create({
    data: {
      userId: params.userId,
      accountId: params.accountId,
      cardType: params.cardType,
      last4,
      panPrefix,
      network: "MASTERCARD",
      expiryMonth,
      expiryYear,
      cardholderName: user.fullName,
      status: "ACTIVE",
      spendingLimit,
    },
    include: {
      account: {
        select: {
          id: true,
          accountType: true,
          accountNumber: true,
        },
      },
    },
  });

  void createAccountNotification({
    userId: params.userId,
    title: "Your Mastercard is ready",
    message: `Your ${params.cardType.toLowerCase()} Mastercard ending ${last4} was issued and is now active in online banking.`,
    metadata: { href: "/auth/cards" },
  });

  void writeEventLog({
    eventType: "CARD_ISSUED_BY_ADMIN",
    actorId: params.adminId,
    entityType: "Card",
    entityId: card.id,
    message: `Operations issued a ${params.cardType.toLowerCase()} Mastercard ending ${last4} to ${user.fullName}.`,
    severity: "INFO",
    metadata: { accountId: params.accountId, panPrefix, last4 },
  });

  void writeAdminEvent({
    eventType: "CARD_ISSUED",
    actorId: params.adminId,
    entityId: card.id,
    message: `Issued Mastercard ending ${last4} to ${user.fullName}.`,
    metadata: {
      userId: params.userId,
      cardType: params.cardType,
      panPrefix,
    },
  });

  return serializePageCard(card);
}

export async function getCardTransactions(cardId: string, userId: string) {
  const prisma = getPrisma();

  const card = await prisma.card.findFirst({
    where: { id: cardId, userId },
    select: { id: true },
  });

  if (!card) {
    return [];
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      cardId,
      type: "CARD",
    },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return transactions.map((transaction) => ({
    id: transaction.id,
    amount: transaction.amount.toNumber(),
    description: transaction.description,
    merchant: transaction.merchant,
    reference: transaction.reference,
    status: transaction.status,
    createdAt: transaction.createdAt.toISOString(),
    postedAt: transaction.postedAt?.toISOString() ?? null,
  }));
}
