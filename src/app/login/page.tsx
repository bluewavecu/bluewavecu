import { ShieldCheck } from "lucide-react";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { BrandLogo } from "@/components/layout/BrandLogo";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f7fbff] text-foreground dark:bg-[#061222] dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-primary-navy p-10 text-white lg:block">
          <div className="banking-grid absolute inset-0 opacity-[0.36]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <BrandLogo displayHeight={44} priority />

            <div className="max-w-xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/[0.16] bg-white/[0.08] px-3 py-2 text-sm font-semibold text-light-blue backdrop-blur-xl">
                <ShieldCheck size={16} aria-hidden="true" />
                Secure online banking
              </p>
              <h1 className="mt-7 text-5xl font-semibold leading-tight">
                Sign in to manage your accounts.
              </h1>
              <p className="mt-5 text-lg leading-8 text-white/[0.70]">
                Access balances, transfers, statements, and member services through encrypted
                online banking.
              </p>
            </div>

            <div className="grid max-w-xl gap-4 sm:grid-cols-2">
              {["Encrypted sign-in", "Account activity monitoring"].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-white/[0.12] bg-white/[0.08] p-4 backdrop-blur-xl"
                >
                  <ShieldCheck size={20} className="text-light-blue" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md">
            <BrandLogo displayHeight={44} priority tone="dark" className="mb-10 lg:hidden" />

            <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-6 shadow-[0_24px_90px_rgba(10,42,94,0.12)] dark:border-white/[0.08] dark:bg-white/[0.06] sm:p-8">
              <div className="mb-7">
                <p className="text-sm font-semibold uppercase text-ocean-blue">Sign in</p>
                <h2 className="mt-3 text-3xl font-semibold text-primary-navy dark:text-white">
                  Welcome back
                </h2>
                <p className="mt-2 text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
                  Enter your member credentials to access online banking.
                </p>
              </div>
              <Suspense
                fallback={
                  <p className="text-sm text-bluewave-gray dark:text-white/[0.62]">
                    Loading sign-in form...
                  </p>
                }
              >
                <LoginForm />
              </Suspense>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
