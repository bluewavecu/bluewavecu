import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

import {
  BOOTSTRAP_ADMIN_EMAIL,
  BOOTSTRAP_ADMIN_PASSWORD,
  BOOTSTRAP_ADMIN_NAME,
  DEMO_MEMBER_PASSWORD,
  DEMO_PENDING_USER_EMAIL,
  DEMO_PENDING_USER_USERNAME,
  DEMO_USER_EMAIL,
  DEMO_USER_USERNAME,
  DEMO_MEMBER_ADDRESS,
  DEMO_MEMBER_FULL_NAME,
  DEMO_MEMBER_PHONE,
  DEMO_PENDING_MEMBER_ADDRESS,
  DEMO_PENDING_MEMBER_FULL_NAME,
  DEMO_PENDING_MEMBER_PHONE,
  DEMO_ADMIN_USERNAME,
} from "../src/lib/bootstrapAccounts";
import { INSTITUTION } from "../src/lib/institution";
import { assertDatabaseUrl, createPrismaPgAdapter } from "../src/lib/databaseUrl";

const DEMO_ADMIN_EMAIL = BOOTSTRAP_ADMIN_EMAIL;
const DEMO_ADMIN_PASSWORD = BOOTSTRAP_ADMIN_PASSWORD;

const DEMO_ACCOUNTS = [
  {
    accountNumber: "33331048225701",
    accountType: "CHECKING" as const,
    balance: "18420.72",
    availableBalance: "17890.21",
  },
  {
    accountNumber: "33331048225702",
    accountType: "SAVINGS" as const,
    balance: "42110.50",
    availableBalance: "42110.50",
  },
  {
    accountNumber: "33331048225703",
    accountType: "CREDIT" as const,
    balance: "-1284.16",
    availableBalance: "8715.84",
  },
];

const DEMO_TRANSACTIONS = [
  {
    reference: "DEMO-TXN-1001",
    accountNumber: "331048225701",
    type: "DEPOSIT" as const,
    amount: "4800.00",
    description: "Direct deposit",
    merchant: "Texas Instruments Payroll",
    status: "COMPLETED" as const,
  },
  {
    reference: "DEMO-TXN-1002",
    accountNumber: "331048225701",
    type: "PAYMENT" as const,
    amount: "-164.82",
    description: "Monthly electricity bill",
    merchant: "Oncor Electric Delivery",
    status: "COMPLETED" as const,
  },
  {
    reference: "DEMO-TXN-1003",
    accountNumber: "331048225702",
    type: "TRANSFER" as const,
    amount: "750.00",
    description: "Savings contribution",
    merchant: "Bluewave Transfer",
    status: "COMPLETED" as const,
  },
  {
    reference: "DEMO-TXN-1004",
    accountNumber: "331048225703",
    type: "CARD" as const,
    amount: "-89.43",
    description: "Card purchase",
    merchant: "Kroger",
    status: "COMPLETED" as const,
  },
  {
    reference: "DEMO-TXN-1005",
    accountNumber: "331048225703",
    type: "CARD" as const,
    amount: "-49.00",
    description: "Business subscription",
    merchant: "AT&T Billing",
    status: "COMPLETED" as const,
  },
  {
    reference: "DEMO-TXN-1006",
    accountNumber: "331048225701",
    type: "TRANSFER" as const,
    amount: "-250.00",
    description: "Transfer to Account ending 5799: Rent payment",
    merchant: "Member Transfer",
    status: "PENDING" as const,
    destinationAccountNumber: "1048225799",
  },
  {
    reference: "DEMO-TXN-1007",
    accountNumber: "331048225701",
    type: "TRANSFER" as const,
    amount: "-100.00",
    description: "Transfer to Share Savings: Monthly savings goal",
    merchant: "Bluewave Transfer",
    status: "COMPLETED" as const,
    destinationAccountNumber: "331048225702",
    seedPosted: true,
  },
];

function createPrismaClient() {
  const connectionString = assertDatabaseUrl("seed");

  const adapter = createPrismaPgAdapter(connectionString);
  return new PrismaClient({ adapter });
}

function logStep(message: string) {
  console.log(`[seed] ${message}`);
}

async function main() {
  const isProduction = process.env.NODE_ENV === "production";
  const allowDemoSeed = process.env.ALLOW_DEMO_SEED === "true";

  if (isProduction && !allowDemoSeed) {
    logStep(
      "Skipping development seed in production. Set ALLOW_DEMO_SEED=true only for intentional staging bootstrap.",
    );
    return;
  }

  logStep("Starting Bluewave development seed...");
  const prisma = createPrismaClient();
  const memberPasswordHash = await bcrypt.hash(DEMO_MEMBER_PASSWORD, 12);
  const adminPasswordHash = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 12);

  try {
    const demoUser = await prisma.user.upsert({
      where: { email: DEMO_USER_EMAIL },
      update: {
        fullName: DEMO_MEMBER_FULL_NAME,
        username: DEMO_USER_USERNAME,
        phone: DEMO_MEMBER_PHONE,
        passwordHash: memberPasswordHash,
        role: "USER",
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
      create: {
        fullName: DEMO_MEMBER_FULL_NAME,
        username: DEMO_USER_USERNAME,
        email: DEMO_USER_EMAIL,
        phone: DEMO_MEMBER_PHONE,
        passwordHash: memberPasswordHash,
        role: "USER",
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
    });

    const pendingUser = await prisma.user.upsert({
      where: { email: DEMO_PENDING_USER_EMAIL },
      update: {
        fullName: DEMO_PENDING_MEMBER_FULL_NAME,
        username: DEMO_PENDING_USER_USERNAME,
        phone: DEMO_PENDING_MEMBER_PHONE,
        passwordHash: memberPasswordHash,
        role: "USER",
        status: "PENDING",
        emailVerifiedAt: new Date(),
      },
      create: {
        fullName: DEMO_PENDING_MEMBER_FULL_NAME,
        username: DEMO_PENDING_USER_USERNAME,
        email: DEMO_PENDING_USER_EMAIL,
        phone: DEMO_PENDING_MEMBER_PHONE,
        passwordHash: memberPasswordHash,
        role: "USER",
        status: "PENDING",
        emailVerifiedAt: new Date(),
      },
    });

    const adminUser = await prisma.user.upsert({
      where: { email: DEMO_ADMIN_EMAIL },
      update: {
        fullName: BOOTSTRAP_ADMIN_NAME,
        username: DEMO_ADMIN_USERNAME,
        phone: INSTITUTION.phone.display,
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
      create: {
        fullName: BOOTSTRAP_ADMIN_NAME,
        username: DEMO_ADMIN_USERNAME,
        email: DEMO_ADMIN_EMAIL,
        phone: INSTITUTION.phone.display,
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
    });

    logStep("Ensured development users (member, pending member, admin).");

    await prisma.customerProfile.upsert({
      where: { userId: demoUser.id },
      update: {
        dateOfBirth: new Date("1990-04-12"),
        addressLine1: DEMO_MEMBER_ADDRESS.addressLine1,
        addressLine2: DEMO_MEMBER_ADDRESS.addressLine2,
        city: DEMO_MEMBER_ADDRESS.city,
        state: DEMO_MEMBER_ADDRESS.state,
        postalCode: DEMO_MEMBER_ADDRESS.postalCode,
        country: DEMO_MEMBER_ADDRESS.country,
        employmentStatus: "Software engineer",
        kycStatus: "VERIFIED",
        kycReviewedAt: new Date(),
      },
      create: {
        userId: demoUser.id,
        dateOfBirth: new Date("1990-04-12"),
        addressLine1: DEMO_MEMBER_ADDRESS.addressLine1,
        addressLine2: DEMO_MEMBER_ADDRESS.addressLine2,
        city: DEMO_MEMBER_ADDRESS.city,
        state: DEMO_MEMBER_ADDRESS.state,
        postalCode: DEMO_MEMBER_ADDRESS.postalCode,
        country: DEMO_MEMBER_ADDRESS.country,
        employmentStatus: "Software engineer",
        kycStatus: "VERIFIED",
        kycReviewedAt: new Date(),
      },
    });

    await prisma.customerProfile.upsert({
      where: { userId: pendingUser.id },
      update: {
        dateOfBirth: new Date("1995-08-22"),
        addressLine1: DEMO_PENDING_MEMBER_ADDRESS.addressLine1,
        addressLine2: DEMO_PENDING_MEMBER_ADDRESS.addressLine2,
        city: DEMO_PENDING_MEMBER_ADDRESS.city,
        state: DEMO_PENDING_MEMBER_ADDRESS.state,
        postalCode: DEMO_PENDING_MEMBER_ADDRESS.postalCode,
        country: DEMO_PENDING_MEMBER_ADDRESS.country,
        employmentStatus: "Registered nurse",
        kycStatus: "SUBMITTED",
        kycSubmittedAt: new Date(),
      },
      create: {
        userId: pendingUser.id,
        dateOfBirth: new Date("1995-08-22"),
        addressLine1: DEMO_PENDING_MEMBER_ADDRESS.addressLine1,
        addressLine2: DEMO_PENDING_MEMBER_ADDRESS.addressLine2,
        city: DEMO_PENDING_MEMBER_ADDRESS.city,
        state: DEMO_PENDING_MEMBER_ADDRESS.state,
        postalCode: DEMO_PENDING_MEMBER_ADDRESS.postalCode,
        country: DEMO_PENDING_MEMBER_ADDRESS.country,
        employmentStatus: "Registered nurse",
        kycStatus: "SUBMITTED",
        kycSubmittedAt: new Date(),
      },
    });

    logStep("Ensured development member profiles.");

    const accountIds = new Map<string, string>();

    for (const account of DEMO_ACCOUNTS) {
      const savedAccount = await prisma.account.upsert({
        where: { accountNumber: account.accountNumber },
        update: {
          userId: demoUser.id,
          accountType: account.accountType,
          routingNumber: "311978875",
          balance: account.balance,
          availableBalance: account.availableBalance,
          currency: "USD",
          status: "ACTIVE",
        },
        create: {
          userId: demoUser.id,
          accountType: account.accountType,
          accountNumber: account.accountNumber,
          routingNumber: "311978875",
          balance: account.balance,
          availableBalance: account.availableBalance,
          currency: "USD",
          status: "ACTIVE",
        },
      });

      accountIds.set(account.accountNumber, savedAccount.id);
    }

    logStep(`Ensured ${DEMO_ACCOUNTS.length} development accounts.`);

    for (const transaction of DEMO_TRANSACTIONS) {
      const accountId = accountIds.get(transaction.accountNumber);

      if (!accountId) {
        throw new Error(`Missing account for transaction ${transaction.reference}.`);
      }

      await prisma.transaction.upsert({
        where: { reference: transaction.reference },
        update: {
          userId: demoUser.id,
          accountId,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          merchant: transaction.merchant,
          status: transaction.status,
          destinationAccountNumber:
            "destinationAccountNumber" in transaction
              ? transaction.destinationAccountNumber
              : null,
        },
        create: {
          userId: demoUser.id,
          accountId,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          merchant: transaction.merchant,
          reference: transaction.reference,
          status: transaction.status,
          destinationAccountNumber:
            "destinationAccountNumber" in transaction
              ? transaction.destinationAccountNumber
              : null,
        },
      });
    }

    logStep(`Ensured ${DEMO_TRANSACTIONS.length} development transactions.`);

    const postedDemoReference = "DEMO-TXN-1007";
    const postedDemoTransaction = await prisma.transaction.findUnique({
      where: { reference: postedDemoReference },
    });

    if (postedDemoTransaction) {
      const existingLedgerCount = await prisma.ledgerEntry.count({
        where: { transactionId: postedDemoTransaction.id },
      });

      if (existingLedgerCount === 0) {
        const sourceAccountId = accountIds.get("331048225701")!;
        const destinationAccountId = accountIds.get("331048225702")!;
        const transferAmount = "100.00";
        const reviewedAt = new Date("2026-05-01T12:00:00.000Z");

        await prisma.transaction.update({
          where: { id: postedDemoTransaction.id },
          data: {
            postedAt: reviewedAt,
            reviewedAt,
            reviewedBy: adminUser.id,
            reviewNote: "Internal transfer approved",
          },
        });

        await prisma.ledgerEntry.createMany({
          data: [
            {
              transactionId: postedDemoTransaction.id,
              accountId: sourceAccountId,
              userId: demoUser.id,
              direction: "DEBIT",
              amount: transferAmount,
              currency: "USD",
              balanceBefore: "18520.72",
              balanceAfter: "18420.72",
              description: postedDemoTransaction.description,
            },
            {
              transactionId: postedDemoTransaction.id,
              accountId: destinationAccountId,
              userId: demoUser.id,
              direction: "CREDIT",
              amount: transferAmount,
              currency: "USD",
              balanceBefore: "42010.50",
              balanceAfter: "42110.50",
              description: `Transfer credit from ${postedDemoReference}`,
            },
          ],
        });

        logStep("Seeded posted internal transfer ledger entries.");
      }
    }

    await prisma.cardApplication.deleteMany({ where: { userId: demoUser.id } });
    await prisma.card.deleteMany({ where: { userId: demoUser.id } });
    await prisma.card.createMany({
      data: [
        {
          userId: demoUser.id,
          accountId: accountIds.get("331048225701")!,
          cardType: "DEBIT",
          last4: "2841",
          panPrefix: "552901",
          network: "MASTERCARD",
          expiryMonth: 5,
          expiryYear: 2029,
          cardholderName: DEMO_MEMBER_FULL_NAME,
          status: "ACTIVE",
          spendingLimit: "2500.00",
        },
        {
          userId: demoUser.id,
          accountId: accountIds.get("331048225703")!,
          cardType: "CREDIT",
          last4: "9256",
          panPrefix: "552901",
          network: "MASTERCARD",
          expiryMonth: 5,
          expiryYear: 2029,
          cardholderName: DEMO_MEMBER_FULL_NAME,
          status: "ACTIVE",
          spendingLimit: "10000.00",
        },
      ],
    });

    const creditCard = await prisma.card.findFirst({
      where: { userId: demoUser.id, last4: "9256" },
      select: { id: true },
    });

    if (creditCard) {
      await prisma.transaction.updateMany({
        where: {
          userId: demoUser.id,
          reference: { in: ["DEMO-TXN-1004", "DEMO-TXN-1005"] },
        },
        data: { cardId: creditCard.id },
      });
    }

    logStep("Refreshed development cards.");

    await prisma.loan.deleteMany({ where: { userId: demoUser.id } });
    await prisma.loan.create({
      data: {
        userId: demoUser.id,
        loanType: "Personal Loan",
        principal: "25000.00",
        balance: "25000.00",
        interestRate: "0.00",
        termMonths: 48,
        monthlyPayment: "0.00",
        status: "PENDING",
      },
    });

    logStep("Refreshed development loan preview.");

    await prisma.supportTicket.deleteMany({
      where: { userId: { in: [demoUser.id, pendingUser.id] } },
    });
    await prisma.supportTicket.createMany({
      data: [
        {
          userId: demoUser.id,
          subject: "Card travel notice template",
          message: "Prepare travel dates, destination, and preferred contact method.",
          status: "OPEN",
          priority: "NORMAL",
        },
        {
          userId: demoUser.id,
          subject: "Address update request",
          message: "Profile change review queue  submitted for member services review.",
          status: "PENDING",
          priority: "HIGH",
        },
        {
          userId: pendingUser.id,
          subject: "New membership onboarding",
          message: "Pending member account awaiting admin activation review.",
          status: "OPEN",
          priority: "URGENT",
        },
      ],
    });

    logStep("Refreshed development support tickets.");

    await prisma.notification.deleteMany({
      where: { userId: demoUser.id },
    });
    await prisma.notification.createMany({
      data: [
        {
          userId: demoUser.id,
          type: "SYSTEM",
          title: "Welcome to Bluewave",
          message: "Welcome to Bluewave online banking. Explore accounts, transfers, and support.",
          isRead: true,
        },
        {
          userId: demoUser.id,
          type: "TRANSFER",
          title: "Transfer submitted for review",
          message: "Your $250.00 transfer is pending admin approval.",
          isRead: false,
          metadata: { href: "/auth/transactions", reference: "DEMO-TXN-1006" },
        },
        {
          userId: demoUser.id,
          type: "SUPPORT",
          title: "Support ticket received",
          message: "We received your card travel notice request.",
          isRead: false,
          metadata: { href: "/support" },
        },
        {
          userId: demoUser.id,
          type: "SECURITY",
          title: "New sign-in detected",
          message: "A successful sign-in was recorded on your account.",
          isRead: false,
        },
      ],
    });

    logStep("Refreshed development notifications.");

    const checkingAccountId = accountIds.get("331048225701");

    if (checkingAccountId) {
      await prisma.scheduledTransfer.deleteMany({
        where: { userId: demoUser.id },
      });

      const scheduledFor = new Date();
      scheduledFor.setDate(scheduledFor.getDate() + 7);

      await prisma.scheduledTransfer.create({
        data: {
          userId: demoUser.id,
          fromAccountId: checkingAccountId,
          recipientName: "Oak Lawn Properties",
          destinationAccountNumber: "1048225799",
          amount: "350.00",
          memo: "Monthly rent schedule",
          frequency: "MONTHLY",
          scheduledFor,
          nextRunAt: scheduledFor,
          status: "ACTIVE",
        },
      });

      logStep("Refreshed development scheduled transfer.");
    }

    await prisma.riskEvent.deleteMany({
      where: { userId: demoUser.id },
    });
    await prisma.riskEvent.createMany({
      data: [
        {
          userId: demoUser.id,
          eventType: "LOGIN",
          riskScore: 45,
          severity: "MEDIUM",
          reason: "Sign-in from an unfamiliar device during account review.",
          metadata: { ipAddress: "127.0.0.1" },
        },
        {
          userId: demoUser.id,
          eventType: "TRANSFER",
          riskScore: 70,
          severity: "HIGH",
          reason: "Transfer amount exceeds $5,000 during account review.",
          metadata: { amount: 5200 },
        },
      ],
    });

    logStep("Refreshed development risk events.");

    await prisma.userSession.deleteMany({
      where: { userId: demoUser.id },
    });
    await prisma.userSession.create({
      data: {
        userId: demoUser.id,
        tokenId: "demo-session-token",
        deviceName: "Mac",
        ipAddress: "127.0.0.1",
        userAgent: "BluewaveSeed/1.0",
        location: "Online banking",
        isActive: true,
        lastSeenAt: new Date(),
      },
    });

    logStep("Refreshed development user session.");

    await prisma.mfaSetting.upsert({
      where: {
        userId_method: {
          userId: demoUser.id,
          method: "EMAIL",
        },
      },
      create: {
        userId: demoUser.id,
        method: "EMAIL",
        isEnabled: false,
      },
      update: {
        isEnabled: false,
      },
    });

    logStep("Ensured development MFA setting.");

    if (checkingAccountId) {
      await prisma.payee.deleteMany({ where: { userId: demoUser.id } });
      const utilityPayee = await prisma.payee.create({
        data: {
          userId: demoUser.id,
          name: "Oncor Electric Delivery",
          nickname: "Electric bill",
          category: "Utilities",
          accountNumber: "9988776655",
          status: "ACTIVE",
        },
      });

      await prisma.billPayment.deleteMany({ where: { userId: demoUser.id } });
      await prisma.billPayment.create({
        data: {
          userId: demoUser.id,
          fromAccountId: checkingAccountId,
          payeeId: utilityPayee.id,
          amount: "164.82",
          memo: "Monthly electricity bill",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: "DRAFT",
          riskScore: 35,
        },
      });

      logStep("Refreshed development payees and bill payment.");
    }

    const auditSeedActions = [
      {
        action: "SEED_DEVELOPMENT_DATA",
        entityType: "User",
        entityId: demoUser.id,
        details: {
          email: DEMO_USER_EMAIL,
          purpose: "Online banking account bootstrap",
        },
      },
      {
        action: "REVIEW_PENDING_MEMBER",
        entityType: "User",
        entityId: pendingUser.id,
        details: {
          email: DEMO_PENDING_USER_EMAIL,
          status: "PENDING",
        },
      },
      {
        action: "QUEUE_TRANSFER_REVIEW",
        entityType: "Transaction",
        entityId: "DEMO-TXN-1006",
        details: {
          reference: "DEMO-TXN-1006",
          status: "PENDING",
        },
      },
    ] as const;

    for (const auditEntry of auditSeedActions) {
      const existing = await prisma.adminAuditLog.findFirst({
        where: {
          adminId: adminUser.id,
          action: auditEntry.action,
          entityId: auditEntry.entityId,
        },
      });

      if (!existing) {
        await prisma.adminAuditLog.create({
          data: {
            adminId: adminUser.id,
            ...auditEntry,
          },
        });
      }
    }

    logStep("Ensured admin audit log entries.");
    logStep("Bluewave development seed completed successfully.");
    console.log(`Development member: ${DEMO_USER_EMAIL} / ${DEMO_MEMBER_PASSWORD}`);
    console.log(`Development pending member: ${DEMO_PENDING_USER_EMAIL} / ${DEMO_MEMBER_PASSWORD}`);
    console.log(`Development admin: ${DEMO_ADMIN_EMAIL} / ${DEMO_ADMIN_PASSWORD}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("[seed] Failed:", error);
  process.exit(1);
});
