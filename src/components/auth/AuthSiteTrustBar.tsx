"use client";

import { LockKeyhole, Phone } from "lucide-react";
import Link from "next/link";
import { INSTITUTION } from "@/lib/institution";

export function AuthSiteTrustBar() {
  return (
    <div
      role="note"
      className="mb-5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-50"
    >
      <p className="inline-flex items-start gap-2 font-semibold">
        <LockKeyhole size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          Official site:{" "}
          <span className="font-mono text-[0.92em]">{INSTITUTION.officialDomain}</span>
        </span>
      </p>
      <p className="mt-2 pl-6 text-xs leading-5 text-emerald-900/85 dark:text-emerald-50/85">
        Sign in only at{" "}
        <Link href="/auth/login" className="font-semibold underline underline-offset-2">
          {INSTITUTION.website.replace(/^https:\/\//, "")}/auth/login
        </Link>
        . {INSTITUTION.shortName} will never ask for your password by email or phone. Questions?{" "}
        <Link
          href={`tel:${INSTITUTION.phone.tel}`}
          className="inline-flex items-center gap-1 font-semibold underline underline-offset-2"
        >
          <Phone size={12} aria-hidden="true" />
          {INSTITUTION.phone.display}
        </Link>
        .
      </p>
    </div>
  );
}
