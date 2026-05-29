"use client";

import { Menu, UserPlus, X, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Personal", href: "#products" },
  { label: "Business", href: "#products" },
  { label: "Loans", href: "#products" },
  { label: "About", href: "#features" },
  { label: "Support", href: "#support" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.14] bg-primary-navy/[0.88] text-white shadow-[0_12px_40px_rgba(7,21,38,0.16)] backdrop-blur-2xl">
      <nav
        aria-label="Main navigation"
        className="section-shell flex h-20 items-center justify-between gap-6"
      >
        <Link
          href="/"
          aria-label="Bluewave Credit Union home"
          className="flex min-w-0 items-center"
          onClick={() => setOpen(false)}
        >
          <span className="relative block h-11 w-40 overflow-hidden sm:w-48">
            <Image
              src="/images/logo.webp"
              alt="Bluewave Credit Union"
              fill
              priority
              sizes="(min-width: 640px) 192px, 160px"
              className="object-contain object-left"
            />
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
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

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "border-white/[0.18] bg-white/[0.08]",
            )}
          >
            <LogIn size={16} aria-hidden="true" />
            Login
          </Link>
          <Link href="/register" className={buttonVariants({ size: "sm" })}>
            <UserPlus size={16} aria-hidden="true" />
            Open Account
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.16] bg-white/[0.08] text-white transition hover:bg-white/[0.14] lg:hidden"
        >
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </nav>

      <div
        className={cn(
          "overflow-hidden border-t border-white/[0.12] bg-primary-navy/[0.96] backdrop-blur-2xl transition-[max-height,opacity] duration-300 lg:hidden",
          open ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="section-shell flex flex-col gap-2 py-5">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-semibold text-white/[0.82] transition hover:bg-white/[0.08] hover:text-light-blue"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className={buttonVariants({
                variant: "secondary",
                className: "w-full border-white/[0.18] bg-white/[0.08]",
              })}
            >
              <LogIn size={16} aria-hidden="true" />
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className={buttonVariants({ className: "w-full" })}
            >
              <UserPlus size={16} aria-hidden="true" />
              Open Account
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
