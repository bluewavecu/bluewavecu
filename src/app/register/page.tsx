import { ShieldCheck, Sparkles } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { BrandLogo } from "@/components/layout/BrandLogo";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#f7fbff] text-foreground dark:bg-[#061222] dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md">
            <BrandLogo displayHeight={48} priority tone="dark" className="mb-10" />

            <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-6 shadow-[0_24px_90px_rgba(10,42,94,0.12)] dark:border-white/[0.08] dark:bg-white/[0.06] sm:p-8">
              <div className="mb-7">
                <p className="text-sm font-semibold uppercase text-ocean-blue">Register</p>
                <h1 className="mt-3 text-3xl font-semibold text-primary-navy dark:text-white">
                  Create your access profile
                </h1>
                <p className="mt-2 text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
                  Create an API-backed profile record for the local banking foundation.
                  New profiles remain pending until admin approval flows are built.
                </p>
              </div>
              <RegisterForm />
            </div>
          </div>
        </section>

        <section className="relative hidden overflow-hidden bg-primary-navy p-10 text-white lg:block">
          <div className="banking-grid absolute inset-0 opacity-[0.34]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="max-w-xl justify-self-start">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/[0.16] bg-white/[0.08] px-3 py-2 text-sm font-semibold text-light-blue backdrop-blur-xl">
                <Sparkles size={16} aria-hidden="true" />
                Digital onboarding shell
              </p>
              <h2 className="mt-7 text-5xl font-semibold leading-tight">
                Start clean, then connect verified services later.
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/[0.70]">
                The registration flow now stores secure profile records while deeper
                verification and approval controls remain pending.
              </p>
            </div>

            <div className="grid max-w-xl gap-4 sm:grid-cols-2">
              {["Member profile fields", "Pending review state"].map((item) => (
                <div key={item} className="rounded-lg border border-white/[0.12] bg-white/[0.08] p-4 backdrop-blur-xl">
                  <ShieldCheck size={20} className="text-light-blue" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
