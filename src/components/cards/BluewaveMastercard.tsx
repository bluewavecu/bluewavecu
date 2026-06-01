"use client";

import { cn } from "@/lib/utils";
import { BRAND_SHORT_NAME } from "@/lib/branding";
import type { CardStatus, CardType } from "@/types/banking";

type BluewaveMastercardProps = {
  cardholderName: string;
  maskedPan: string;
  expiryLabel?: string | null;
  cardType?: CardType;
  status?: CardStatus;
  className?: string;
};

function MastercardMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center", className)} aria-hidden="true">
      <span className="h-8 w-8 rounded-full bg-[#EB001B] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.18)]" />
      <span className="-ml-4 h-8 w-8 rounded-full bg-[#F79E1B] opacity-95 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.18)]" />
    </div>
  );
}

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
        "relative aspect-[1.586/1] w-full max-w-[380px] overflow-hidden rounded-[20px] border border-white/[0.10] p-5 text-white",
        "shadow-[0_24px_70px_rgba(2,8,23,0.38)]",
        "bg-[radial-gradient(circle_at_18%_12%,rgba(0,168,232,0.28),transparent_34%),radial-gradient(circle_at_88%_78%,rgba(26,86,219,0.22),transparent_38%),linear-gradient(135deg,#031022_0%,#0A2A5E_42%,#071526_100%)]",
        isInactive && "opacity-75 saturate-[0.65]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,transparent_10%,rgba(255,255,255,0.07)_48%,transparent_78%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgba(255,255,255,0.55)_0.6px,transparent_0.6px)] [background-size:14px_14px]" />
      <div className="pointer-events-none absolute -right-8 top-0 h-36 w-36 rounded-full bg-ocean-blue/[0.18] blur-3xl" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/[0.55]">
              {BRAND_SHORT_NAME}
            </p>
            <p className="mt-1 text-xs font-medium text-white/[0.78]">
              {cardType === "CREDIT" ? "Credit Mastercard" : "Debit Mastercard"}
            </p>
          </div>
          <MastercardMark />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div
            className="h-9 w-12 rounded-[6px] border border-amber-100/25 bg-[linear-gradient(145deg,#c9a227_0%,#f3e5ab_38%,#9a7618_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_8px_rgba(0,0,0,0.25)]"
            aria-hidden="true"
          />
          <div className="flex items-end gap-0.5 text-white/[0.35]" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full border border-current" />
            <span className="h-3.5 w-3.5 rounded-full border border-current" />
            <span className="h-5 w-5 rounded-full border border-current" />
          </div>
        </div>

        <p className="mt-auto pt-6 font-mono text-[clamp(1rem,2.8vw,1.35rem)] font-medium tracking-[0.16em] text-white">
          {maskedPan}
        </p>

        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/[0.42]">Cardholder</p>
            <p className="mt-0.5 truncate text-sm font-semibold uppercase tracking-[0.06em]">
              {cardholderName}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/[0.42]">Valid thru</p>
            <p className="mt-0.5 font-mono text-sm">{expiryLabel ?? "••/••"}</p>
          </div>
        </div>

        {isInactive ? (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
            <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
              {status.replace("_", " ")}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
