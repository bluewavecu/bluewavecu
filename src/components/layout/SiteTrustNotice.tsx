import { LockKeyhole, Phone } from "lucide-react";
import Link from "next/link";
import { INSTITUTION } from "@/lib/institution";
import { cn } from "@/lib/utils";

type SiteTrustNoticeProps = {
  variant?: "auth" | "marketing";
  className?: string;
};

export function SiteTrustNotice({ variant = "auth", className }: SiteTrustNoticeProps) {
  const loginPath = `${INSTITUTION.website.replace(/^https:\/\//, "")}/auth/login`;

  return (
    <div
      role="note"
      aria-label="Demonstration site notice"
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        variant === "auth"
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-950 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-50"
          : "border-white/20 bg-black/25 text-white/[0.92] backdrop-blur-sm",
        className,
      )}
    >
      <p className="inline-flex items-start gap-2 font-semibold">
        <LockKeyhole size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          Demo site:{" "}
          <span className="font-mono text-[0.92em]">{INSTITUTION.officialDomain}</span>
        </span>
      </p>
      <p
        className={cn(
          "mt-2 pl-6 text-xs leading-5",
          variant === "auth"
            ? "text-emerald-900/85 dark:text-emerald-50/85"
            : "text-white/[0.78]",
        )}
      >
        {INSTITUTION.publicDisclaimer} Demo sign-in lives at{" "}
        <Link
          href="/auth/login"
          className={cn(
            "font-semibold underline underline-offset-2",
            variant === "marketing" && "text-light-blue hover:text-white",
          )}
        >
          {loginPath}
        </Link>
        . Questions about this demonstration?{" "}
        <Link
          href={`mailto:${INSTITUTION.email}`}
          className={cn(
            "inline-flex items-center gap-1 font-semibold underline underline-offset-2",
            variant === "marketing" && "text-light-blue hover:text-white",
          )}
        >
          {INSTITUTION.email}
        </Link>
        {" · "}
        <Link
          href={`tel:${INSTITUTION.phone.tel}`}
          className={cn(
            "inline-flex items-center gap-1 font-semibold underline underline-offset-2",
            variant === "marketing" && "text-light-blue hover:text-white",
          )}
        >
          <Phone size={12} aria-hidden="true" />
          {INSTITUTION.phone.display}
        </Link>
        .
      </p>
    </div>
  );
}
