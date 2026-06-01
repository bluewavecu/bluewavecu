import { AccountNumberDisplay } from "@/components/shared/AccountNumberDisplay";
import { cn } from "@/lib/utils";

type AccountIdentifiersSummaryProps = {
  accountNumber: string;
  routingNumber: string;
  currency: string;
  className?: string;
  compact?: boolean;
};

export function AccountIdentifiersSummary({
  accountNumber,
  routingNumber,
  currency,
  className,
  compact = false,
}: AccountIdentifiersSummaryProps) {
  return (
    <dl
      className={cn(
        "grid gap-3 text-sm",
        compact ? "sm:grid-cols-3" : "sm:grid-cols-3",
        className,
      )}
    >
      <div>
        <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-bluewave-gray dark:text-white/[0.48]">
          Account number
        </dt>
        <dd className="mt-1 font-semibold text-primary-navy dark:text-white">
          <AccountNumberDisplay accountNumber={accountNumber} />
        </dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-bluewave-gray dark:text-white/[0.48]">
          Routing number
        </dt>
        <dd className="mt-1 font-semibold text-primary-navy dark:text-white">{routingNumber}</dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-bluewave-gray dark:text-white/[0.48]">
          Currency
        </dt>
        <dd className="mt-1 font-semibold text-primary-navy dark:text-white">{currency}</dd>
      </div>
    </dl>
  );
}
