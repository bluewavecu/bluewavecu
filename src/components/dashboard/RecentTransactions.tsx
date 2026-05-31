import { ArrowDownLeft, ArrowUpRight, Repeat2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import type { DashboardTransaction, TransactionType } from "@/types/banking";

const transactionIcons = {
  credit: ArrowDownLeft,
  debit: ArrowUpRight,
  transfer: Repeat2,
};

type RecentTransactionsProps = {
  transactions?: DashboardTransaction[];
  description?: string;
};

type DisplayTransaction = {
  id: string;
  date: string;
  merchant: string;
  description: string;
  amount: number;
  type: keyof typeof transactionIcons;
  status: string;
};

function formatTransactionDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getTransactionKind(type: TransactionType, amount: number): keyof typeof transactionIcons {
  if (type === "TRANSFER") {
    return "transfer";
  }

  if (amount > 0 || type === "DEPOSIT" || type === "REFUND") {
    return "credit";
  }

  return "debit";
}

function getStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function mapDashboardTransaction(transaction: DashboardTransaction): DisplayTransaction {
  return {
    id: transaction.id,
    date: formatTransactionDate(transaction.createdAt),
    merchant: transaction.merchant ?? transaction.description,
    description: transaction.description,
    amount: transaction.amount,
    type: getTransactionKind(transaction.type, transaction.amount),
    status: getStatusLabel(transaction.status),
  };
}

export function RecentTransactions({
  transactions,
  description = "Your most recent account activity.",
}: RecentTransactionsProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState
        title="No recent transactions"
        message="Account activity will appear here as transactions post to your accounts."
      />
    );
  }

  const displayTransactions = transactions.map(mapDashboardTransaction);

  return (
    <section
      aria-labelledby="recent-transactions"
      className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2
            id="recent-transactions"
            className="text-lg font-semibold text-primary-navy dark:text-white"
          >
            Recent transactions
          </h2>
          <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-5 divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
        {displayTransactions.map((transaction) => {
          const Icon = transactionIcons[transaction.type];
          const positive = transaction.amount > 0;

          return (
            <article key={transaction.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
                  positive
                    ? "bg-ocean-blue/[0.12] text-royal-blue"
                    : "bg-primary-navy/[0.06] text-primary-navy dark:bg-white/[0.08] dark:text-light-blue",
                )}
              >
                <Icon size={19} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="truncate text-sm font-semibold text-primary-navy dark:text-white">
                    {transaction.merchant}
                  </h3>
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      positive ? "text-royal-blue dark:text-light-blue" : "text-primary-navy dark:text-white",
                    )}
                  >
                    {positive ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
                <p className="mt-1 truncate text-sm text-bluewave-gray dark:text-white/[0.58]">
                  {transaction.date} | {transaction.description} | {transaction.status}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
