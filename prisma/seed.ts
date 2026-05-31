import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const DEMO_USER_EMAIL = "avery.morgan@bluewavecu.test";
const DEMO_PENDING_USER_EMAIL = "casey.reed@bluewavecu.test";
const DEMO_ADMIN_EMAIL = "admin@bluewavecu.test";
const DEMO_MEMBER_PASSWORD = "BluewaveDemo2026!";
const DEMO_ADMIN_PASSWORD = "BluewaveAdmin2026!";

const DEMO_ACCOUNTS = [
  {
    accountNumber: "1048225701",
    accountType: "CHECKING" as const,
    balance: "18420.72",
    availableBalance: "17890.21",
  },
  {
    accountNumber: "1048225702",
    accountType: "SAVINGS" as const,
    balance: "42110.50",
    availableBalance: "42110.50",
  },
  {
    accountNumber: "1048225703",
    accountType: "CREDIT" as const,
    balance: "-1284.16",
    availableBalance: "8715.84",
  },
];

const DEMO_TRANSACTIONS = [
  {
    reference: "DEMO-TXN-1001",
    accountNumber: "1048225701",
    type: "DEPOSIT" as const,
    amount: "4800.00",
    description: "Direct deposit",
    merchant: "Northline Payroll",
    status: "COMPLETED" as const,
  },
  {
    reference: "DEMO-TXN-1002",
    accountNumber: "1048225701",
    type: "PAYMENT" as const,
    amount: "-164.82",
    description: "Monthly electricity bill",
    merchant: "Apex Utilities",
    status: "COMPLETED" as const,
  },
  {
    reference: "DEMO-TXN-1003",
    accountNumber: "1048225702",
    type: "TRANSFER" as const,
    amount: "750.00",
    description: "Savings contribution",
    merchant: "Bluewave Transfer",
    status: "COMPLETED" as const,
  },
  {
    reference: "DEMO-TXN-1004",
    accountNumber: "1048225703",
    type: "CARD" as const,
    amount: "-89.43",
    description: "Card purchase",
    merchant: "Harbor Market",
    status: "COMPLETED" as const,
  },
  {
    reference: "DEMO-TXN-1005",
    accountNumber: "1048225703",
    type: "CARD" as const,
    amount: "-49.00",
    description: "Business subscription",
    merchant: "CloudDesk Software",
    status: "COMPLETED" as const,
  },
  {
    reference: "DEMO-TXN-1006",
    accountNumber: "1048225701",
    type: "TRANSFER" as const,
    amount: "-250.00",
    description: "Transfer to Account ending 5799: Rent payment",
    merchant: "Member Transfer",
    status: "PENDING" as const,
    destinationAccountNumber: "1048225799",
  },
  {
    reference: "DEMO-TXN-1007",
    accountNumber: "1048225701",
    type: "TRANSFER" as const,
    amount: "-100.00",
    description: "Transfer to Savings: Posted sample transfer",
    merchant: "Bluewave Transfer",
    status: "COMPLETED" as const,
    destinationAccountNumber: "1048225702",
    seedPosted: true,
  },
];

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to seed development banking data.");
  }

  const adapter = new PrismaPg({ connectionString });
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
        fullName: "Avery Morgan",
        phone: "(555) 014-2084",
        passwordHash: memberPasswordHash,
        role: "USER",
        status: "ACTIVE",
      },
      create: {
        fullName: "Avery Morgan",
        email: DEMO_USER_EMAIL,
        phone: "(555) 014-2084",
        passwordHash: memberPasswordHash,
        role: "USER",
        status: "ACTIVE",
      },
    });

    const pendingUser = await prisma.user.upsert({
      where: { email: DEMO_PENDING_USER_EMAIL },
      update: {
        fullName: "Casey Reed",
        phone: "(555) 014-7712",
        passwordHash: memberPasswordHash,
        role: "USER",
        status: "PENDING",
      },
      create: {
        fullName: "Casey Reed",
        email: DEMO_PENDING_USER_EMAIL,
        phone: "(555) 014-7712",
        passwordHash: memberPasswordHash,
        role: "USER",
        status: "PENDING",
      },
    });

    const adminUser = await prisma.user.upsert({
      where: { email: DEMO_ADMIN_EMAIL },
      update: {
        fullName: "Jordan Parker",
        phone: "(555) 019-4402",
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
      create: {
        fullName: "Jordan Parker",
        email: DEMO_ADMIN_EMAIL,
        phone: "(555) 019-4402",
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    logStep("Ensured development users (member, pending member, admin).");

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

    logStep(`Ensured ${DEMO_TRANSACTIONS.length} sample transactions.`);

    const postedDemoReference = "DEMO-TXN-1007";
    const postedDemoTransaction = await prisma.transaction.findUnique({
      where: { reference: postedDemoReference },
    });

    if (postedDemoTransaction) {
      const existingLedgerCount = await prisma.ledgerEntry.count({
        where: { transactionId: postedDemoTransaction.id },
      });

      if (existingLedgerCount === 0) {
        const sourceAccountId = accountIds.get("1048225701")!;
        const destinationAccountId = accountIds.get("1048225702")!;
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

        logStep("Seeded posted sample transfer ledger entries.");
      }
    }

    await prisma.card.deleteMany({ where: { userId: demoUser.id } });
    await prisma.card.createMany({
      data: [
        {
          userId: demoUser.id,
          accountId: accountIds.get("1048225701")!,
          cardType: "DEBIT",
          last4: "2841",
          cardholderName: "Avery Morgan",
          status: "ACTIVE",
          spendingLimit: "2500.00",
        },
        {
          userId: demoUser.id,
          accountId: accountIds.get("1048225703")!,
          cardType: "CREDIT",
          last4: "9256",
          cardholderName: "Avery Morgan",
          status: "ACTIVE",
          spendingLimit: "10000.00",
        },
      ],
    });

    logStep("Refreshed sample cards.");

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

    logStep("Refreshed sample loan preview.");

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

    logStep("Refreshed sample support tickets.");

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
          metadata: { href: "/transactions", reference: "DEMO-TXN-1006" },
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

    logStep("Refreshed sample notifications.");

    const checkingAccountId = accountIds.get("1048225701");

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
          recipientName: "External Payee",
          destinationAccountNumber: "1048225799",
          amount: "350.00",
          memo: "Monthly rent schedule",
          frequency: "MONTHLY",
          scheduledFor,
          nextRunAt: scheduledFor,
          status: "ACTIVE",
        },
      });

      logStep("Refreshed sample scheduled transfer.");
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

    logStep("Refreshed sample risk events.");

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

    logStep("Refreshed sample user session.");

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

    logStep("Ensured sample MFA setting.");

    if (checkingAccountId) {
      await prisma.payee.deleteMany({ where: { userId: demoUser.id } });
      const utilityPayee = await prisma.payee.create({
        data: {
          userId: demoUser.id,
          name: "Apex Utilities",
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

      logStep("Refreshed sample payees and bill payment.");
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
