import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "light";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-ocean-blue text-primary-navy shadow-[0_18px_40px_rgba(0,168,232,0.28)] hover:bg-light-blue",
  secondary:
    "border border-white/20 bg-white/10 text-white shadow-[0_18px_50px_rgba(10,42,94,0.18)] backdrop-blur-xl hover:bg-white/[0.16]",
  ghost:
    "text-primary-navy hover:bg-primary-navy/[0.08] dark:text-white dark:hover:bg-white/10",
  light:
    "bg-white text-primary-navy shadow-[0_18px_40px_rgba(10,42,94,0.14)] hover:bg-light-blue/[0.22]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 gap-2 px-4 text-sm",
  md: "h-11 gap-2.5 px-5 text-sm",
  lg: "h-12 gap-3 px-6 text-base",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-full font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-blue disabled:pointer-events-none disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function ButtonLink({
  children,
  className,
  variant,
  size,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonVariants({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
