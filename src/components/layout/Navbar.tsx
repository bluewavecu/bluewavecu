"use client";

import { LogIn, Menu, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { buttonVariants } from "@/components/ui/Button";
import { MEMBER_LOGIN_PATH, MEMBER_REGISTER_PATH } from "@/lib/authRoutes";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Personal", href: "/personal" },
  { label: "Business", href: "/business" },
  { label: "Loans", href: "/loans" },
  { label: "About", href: "/about" },
  { label: "Support", href: "/support" },
];

const loginButtonClassName = buttonVariants({
  variant: "primary",
  size: "sm",
  className:
    "h-9 gap-1.5 px-3.5 text-xs shadow-[0_10px_28px_rgba(0,168,232,0.32)] sm:h-10 sm:gap-2 sm:px-4 sm:text-sm",
});

const registerButtonClassName = buttonVariants({
  variant: "secondary",
  size: "sm",
  className:
    "hidden h-9 border-white/[0.18] bg-white/[0.08] px-3.5 text-xs sm:inline-flex sm:h-10 sm:px-4 sm:text-sm",
});

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-navy text-white shadow-[0_12px_40px_rgba(20,35,60,0.18)]">
      <nav
        aria-label="Main navigation"
        className="section-shell flex h-[4.5rem] items-center justify-between gap-3 sm:gap-4 lg:h-20 lg:gap-6"
      >
        <BrandLogo priority displayHeight={44} onClick={() => setOpen(false)} />

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-6 xl:gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-white/[0.78] transition hover:text-light-blue"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <Link href={MEMBER_LOGIN_PATH} className={loginButtonClassName}>
            <LogIn size={16} aria-hidden="true" />
            Log in
          </Link>

          <Link href={MEMBER_REGISTER_PATH} className={registerButtonClassName}>
            <UserPlus size={16} aria-hidden="true" />
            Open account
          </Link>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.16] bg-white/[0.08] text-white transition hover:bg-white/[0.14] sm:h-10 sm:w-10 lg:hidden"
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <div
        className={cn(
          "overflow-hidden border-t border-white/10 bg-brand-navy transition-[max-height,opacity] duration-300 lg:hidden",
          open ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="section-shell flex flex-col gap-1 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-white/[0.82] transition hover:bg-white/[0.08] hover:text-light-blue"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={MEMBER_REGISTER_PATH}
            onClick={() => setOpen(false)}
            className={buttonVariants({
              size: "sm",
              className: "mt-3 w-full sm:hidden",
            })}
          >
            <UserPlus size={16} aria-hidden="true" />
            Open account
          </Link>
        </div>
      </div>
    </header>
  );
}
