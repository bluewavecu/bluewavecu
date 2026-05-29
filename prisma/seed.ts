import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const DEMO_USER_EMAIL = "avery.morgan@bluewavecu.test";
const DEMO_ADMIN_EMAIL = "admin@bluewavecu.test";
const DEMO_PASSWORD = "BluewaveDemo2026!";

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
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  try {
    const demoUser = await prisma.user.upsert({
      where: { email: DEMO_USER_EMAIL },
      update: {
        fullName: "Avery Morgan",
        phone: "(555) 014-2084",
        passwordHash,
        role: "USER",
        status: "ACTIVE",
      },
      create: {
        fullName: "Avery Morgan",
        email: DEMO_USER_EMAIL,
        phone: "(555) 014-2084",
        passwordHash,
        role: "USER",
        status: "ACTIVE",
      },
    });

    const adminUser = await prisma.user.upsert({
      where: { email: DEMO_ADMIN_EMAIL },
      update: {
        fullName: "Jordan Parker",
        phone: "(555) 019-4402",
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
      create: {
        fullName: "Jordan Parker",
        email: DEMO_ADMIN_EMAIL,
        phone: "(555) 019-4402",
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    await prisma.supportTicket.deleteMany({ where: { userId: demoUser.id } });
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
      ],
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: adminUser.id,
        action: "SEED_DEMO_DATA",
        entityType: "User",
        entityId: demoUser.id,
        details: {
          email: DEMO_USER_EMAIL,
          purpose: "Local demo account bootstrap",
        },
      },
    });

    console.log("Seeded Bluewave demo banking data.");
    console.log(`Demo member: ${DEMO_USER_EMAIL} / ${DEMO_PASSWORD}`);
    console.log(`Demo admin: ${DEMO_ADMIN_EMAIL} / ${DEMO_PASSWORD}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
