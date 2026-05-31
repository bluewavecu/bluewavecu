import { ArrowRight, Fingerprint } from "lucide-react";
import { MotionReveal } from "@/components/home/MotionReveal";
import { ButtonLink } from "@/components/ui/Button";

export function MarketingCtaBand() {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="section-shell">
        <MotionReveal className="overflow-hidden rounded-lg bg-[linear-gradient(120deg,#0A2A5E,#0D47A1_56%,#00A8E8)] p-6 text-white shadow-[0_28px_90px_rgba(10,42,94,0.22)] sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase text-light-blue">Get started</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">
                Ready to bank with Bluewave?
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/[0.72]">
                Open an account in minutes or sign in to manage your existing membership online.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <ButtonLink href="/register" variant="light" size="lg">
                Open Account
                <ArrowRight size={18} aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/auth" variant="secondary" size="lg">
                Sign in to online banking
                <Fingerprint size={18} aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
