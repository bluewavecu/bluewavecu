import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const DEMO_USER_EMAIL = "avery.morgan@bluewavecu.test";
const DEMO_PENDING_USER_EMAIL = "casey.reed@bluewavecu.test";
const DEMO_ADMIN_EMAIL = "admin@bluewavecu.test";
const DEMO_MEMBER_PASSWORD = "BluewaveDemo2026!";
const DEMO_ADMIN_PASSWORD = "BluewaveAdmin2026!";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to seed demo banking data.");
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

async function main() {
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

    await prisma.supportTicket.deleteMany({
      where: { userId: { in: [demoUser.id, pendingUser.id] } },
    });
    await prisma.loan.deleteMany({ where: { userId: demoUser.id } });
    await prisma.card.deleteMany({ where: { userId: demoUser.id } });
    await prisma.transaction.deleteMany({ where: { userId: demoUser.id } });
    await prisma.account.deleteMany({ where: { userId: demoUser.id } });
    await prisma.adminAuditLog.deleteMany({ where: { adminId: adminUser.id } });

    const checking = await prisma.account.create({
      data: {
        userId: demoUser.id,
        accountType: "CHECKING",
        accountNumber: "1048225701",
        routingNumber: "000000000",
        balance: "18420.72",
        availableBalance: "17890.21",
        currency: "USD",
        status: "ACTIVE",
      },
    });

    const savings = await prisma.account.create({
      data: {
        userId: demoUser.id,
        accountType: "SAVINGS",
        accountNumber: "1048225702",
        routingNumber: "000000000",
        balance: "42110.50",
        availableBalance: "42110.50",
        currency: "USD",
        status: "ACTIVE",
      },
    });

    const credit = await prisma.account.create({
      data: {
        userId: demoUser.id,
        accountType: "CREDIT",
        accountNumber: "1048225703",
        routingNumber: "000000000",
        balance: "-1284.16",
        availableBalance: "8715.84",
        currency: "USD",
        status: "ACTIVE",
      },
    });

    await prisma.transaction.createMany({
      data: [
        {
          userId: demoUser.id,
          accountId: checking.id,
          type: "DEPOSIT",
          amount: "4800.00",
          description: "Direct deposit",
          merchant: "Northline Payroll",
          reference: "DEMO-TXN-1001",
          status: "COMPLETED",
        },
        {
          userId: demoUser.id,
          accountId: checking.id,
          type: "PAYMENT",
          amount: "-164.82",
          description: "Monthly electricity bill",
          merchant: "Apex Utilities",
          reference: "DEMO-TXN-1002",
          status: "COMPLETED",
        },
        {
          userId: demoUser.id,
          accountId: savings.id,
          type: "TRANSFER",
          amount: "750.00",
          description: "Savings contribution",
          merchant: "Bluewave Transfer",
          reference: "DEMO-TXN-1003",
          status: "COMPLETED",
        },
        {
          userId: demoUser.id,
          accountId: credit.id,
          type: "CARD",
          amount: "-89.43",
          description: "Card purchase",
          merchant: "Harbor Market",
          reference: "DEMO-TXN-1004",
          status: "COMPLETED",
        },
        {
          userId: demoUser.id,
          accountId: credit.id,
          type: "CARD",
          amount: "-49.00",
          description: "Business subscription",
          merchant: "CloudDesk Software",
          reference: "DEMO-TXN-1005",
          status: "COMPLETED",
        },
        {
          userId: demoUser.id,
          accountId: checking.id,
          type: "TRANSFER",
          amount: "-250.00",
          description: "Transfer to Account ending 5799: Rent payment",
          merchant: "Jordan Parker",
          reference: "DEMO-TXN-1006",
          status: "PENDING",
        },
      ],
    });

    await prisma.card.createMany({
      data: [
        {
          userId: demoUser.id,
          accountId: checking.id,
          cardType: "DEBIT",
          last4: "2841",
          cardholderName: "Avery Morgan",
          status: "ACTIVE",
          spendingLimit: "2500.00",
        },
        {
          userId: demoUser.id,
          accountId: credit.id,
          cardType: "CREDIT",
          last4: "9256",
          cardholderName: "Avery Morgan",
          status: "ACTIVE",
          spendingLimit: "10000.00",
        },
      ],
    });

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
          message: "Profile change review queue placeholder for future verification.",
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

    await prisma.adminAuditLog.createMany({
      data: [
        {
          adminId: adminUser.id,
          action: "SEED_DEMO_DATA",
          entityType: "User",
          entityId: demoUser.id,
          details: {
            email: DEMO_USER_EMAIL,
            purpose: "Local demo account bootstrap",
          },
        },
        {
          adminId: adminUser.id,
          action: "REVIEW_PENDING_MEMBER",
          entityType: "User",
          entityId: pendingUser.id,
          details: {
            email: DEMO_PENDING_USER_EMAIL,
            status: "PENDING",
          },
        },
        {
          adminId: adminUser.id,
          action: "QUEUE_TRANSFER_REVIEW",
          entityType: "Transaction",
          entityId: "DEMO-TXN-1006",
          details: {
            reference: "DEMO-TXN-1006",
            status: "PENDING",
          },
        },
      ],
    });

    console.log("Seeded Bluewave demo banking data.");
    console.log(`Demo member: ${DEMO_USER_EMAIL} / ${DEMO_MEMBER_PASSWORD}`);
    console.log(`Demo pending member: ${DEMO_PENDING_USER_EMAIL} / ${DEMO_MEMBER_PASSWORD}`);
    console.log(`Demo admin: ${DEMO_ADMIN_EMAIL} / ${DEMO_ADMIN_PASSWORD}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
