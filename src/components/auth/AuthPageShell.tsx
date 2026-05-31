import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthLogo } from "@/components/layout/AuthLogo";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { cn } from "@/lib/utils";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  marketing: {
    badge: string;
    headline: string;
    body: string;
    highlights: [string, string];
  };
  alternateAction?: {
    prompt: string;
    label: string;
    href: string;
  };
  wide?: boolean;
  children: ReactNode;
};

export function AuthPageShell({
  eyebrow,
  title,
  description,
  marketing,
  alternateAction,
  wide = false,
  children,
}: AuthPageShellProps) {
  return (
    <main className="min-h-screen bg-[#eef5fb] dark:bg-[#061222]">
      <div className="grid lg:min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <section className="relative hidden overflow-hidden bg-primary-navy p-10 text-white lg:flex lg:flex-col">
          <div className="banking-grid absolute inset-0 opacity-[0.32]" />
          <div className="relative z-10 flex h-full flex-col">
            <BrandLogo displayHeight={40} priority />

            <div className="my-auto max-w-lg py-10">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/[0.16] bg-white/[0.08] px-3 py-2 text-sm font-semibold text-light-blue">
                <ShieldCheck size={16} aria-hidden="true" />
                {marketing.badge}
              </p>
              <h1 className="mt-6 text-4xl font-semibold leading-tight xl:text-5xl">
                {marketing.headline}
              </h1>
              <p className="mt-4 text-base leading-7 text-white/[0.72]">{marketing.body}</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {marketing.highlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-white/[0.12] bg-white/[0.08] p-4 backdrop-blur-sm"
                  >
                    <ShieldCheck size={18} className="text-light-blue" aria-hidden="true" />
                    <p className="mt-2 text-sm font-semibold">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col px-4 py-6 sm:px-6 sm:py-8 lg:min-h-screen lg:py-10">
          <div
            className={cn(
              "mx-auto w-full lg:flex lg:flex-1 lg:flex-col",
              wide ? "max-w-5xl" : "max-w-md",
            )}
          >
            <AuthLogo priority className="mb-4 sm:mb-6 lg:mb-8" />

            <div
              className={cn(
                "rounded-xl border border-primary-navy/[0.08] bg-white shadow-[0_24px_80px_rgba(10,42,94,0.10)] dark:border-white/[0.08] dark:bg-[#0a1a2e]",
                wide && "lg:flex lg:min-h-0 lg:flex-1 lg:flex-col",
              )}
            >
              <div className="border-b border-primary-navy/[0.06] px-5 py-4 dark:border-white/[0.06] sm:px-8 sm:py-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-ocean-blue sm:text-sm">
                  {eyebrow}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-primary-navy dark:text-white sm:mt-2 sm:text-2xl lg:text-3xl">
                  {title}
                </h2>
                <p className="mt-1 text-sm leading-5 text-bluewave-gray dark:text-white/[0.62] sm:mt-2 sm:leading-6">
                  {description}
                </p>
              </div>

              <div
                className={cn(
                  "px-5 py-5 sm:px-8 sm:py-7",
                  wide && "lg:flex-1 lg:overflow-y-auto lg:overscroll-contain",
                )}
              >
                {children}
              </div>

              {alternateAction ? (
                <div className="border-t border-primary-navy/[0.06] px-6 py-4 text-center text-sm text-bluewave-gray dark:border-white/[0.06] dark:text-white/[0.62] sm:px-8">
                  {alternateAction.prompt}{" "}
                  <Link
                    href={alternateAction.href}
                    className="font-semibold text-royal-blue hover:text-ocean-blue dark:text-light-blue"
                  >
                    {alternateAction.label}
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
