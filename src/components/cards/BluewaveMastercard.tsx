"use client";

import { cn } from "@/lib/utils";
import type { CardStatus, CardType } from "@/types/banking";

type BluewaveMastercardProps = {
  cardholderName: string;
  maskedPan: string;
  expiryLabel?: string | null;
  cardType?: CardType;
  status?: CardStatus;
  className?: string;
};

export function BluewaveMastercard({
  cardholderName,
  maskedPan,
  expiryLabel,
  cardType = "DEBIT",
  status = "ACTIVE",
  className,
}: BluewaveMastercardProps) {
  const isInactive = status === "LOCKED" || status === "CANCELLED" || status === "EXPIRED";

  return (
    <div
      className={cn(
        "relative aspect-[1.586/1] w-full max-w-[420px] overflow-hidden rounded-[22px] border border-white/[0.08] p-6 text-white shadow-[0_28px_90px_rgba(2,8,23,0.45)]",
        "bg-[radial-gradient(circle_at_top_right,rgba(0,168,232,0.22),transparent_42%),linear-gradient(145deg,#020617_0%,#0A2A5E_38%,#061222_100%)]",
        isInactive && "opacity-70 saturate-50",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.08)_45%,transparent_70%)]" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-ocean-blue/[0.16] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-8 h-44 w-44 rounded-full bg-royal-blue/[0.22] blur-3xl" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/[0.52]">
              Bluewave {cardType === "CREDIT" ? "Credit" : "Debit"}
            </p>
            <p className="mt-2 text-sm font-medium text-white/[0.72]">Mastercard</p>
          </div>

          <div className="flex items-center" aria-hidden="true">
            <span className="h-7 w-7 rounded-full bg-[#EB001B]" />
            <span className="-ml-3 h-7 w-7 rounded-full bg-[#F79E1B]" />
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <div className="h-10 w-14 rounded-md border border-amber-200/30 bg-[linear-gradient(135deg,#d4af37,#f5e6a8,#b8860b)] shadow-inner" />
          <div className="flex items-end gap-1 text-white/[0.42]" aria-hidden="true">
            <span className="h-3 w-3 rounded-full border border-current" />
            <span className="h-4 w-4 rounded-full border border-current" />
            <span className="h-5 w-5 rounded-full border border-current" />
          </div>
        </div>

        <div className="mt-8">
          <p className="font-mono text-[clamp(1.15rem,3vw,1.55rem)] font-semibold tracking-[0.18em] text-white">
            {maskedPan}
          </p>
        </div>

        <div className="mt-8 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/[0.42]">Cardholder</p>
            <p className="mt-1 truncate text-sm font-semibold uppercase tracking-[0.08em]">
              {cardholderName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/[0.42]">Valid thru</p>
            <p className="mt-1 font-mono text-sm font-semibold">{expiryLabel ?? "••/••"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
