import { ArrowRight, Clock3, Smartphone, Wrench } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function MobileAppPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="relative isolate overflow-hidden bg-[#061222] py-20 text-white sm:py-24">
        <div className="banking-grid absolute inset-0 -z-10 opacity-[0.42]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="section-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/[0.16] bg-white/[0.08] px-3 py-2 text-sm font-semibold text-light-blue backdrop-blur-xl">
              <Smartphone size={16} aria-hidden="true" />
              Mobile app
            </p>
            <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl">
              Coming Soon
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/[0.74]">
              The Bluewave Credit Union mobile app page is currently undergoing
              maintenance. We are improving the app experience and it will be back soon
              enough with a smoother way to manage your accounts on the go.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-ocean-blue px-6 text-base font-semibold text-primary-navy shadow-[0_18px_40px_rgba(0,168,232,0.28)] transition hover:bg-light-blue"
              >
                Use Online Banking
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href="/support"
                className="inline-flex h-12 items-center justify-center gap-3 rounded-full border border-white/[0.20] bg-white/[0.10] px-6 text-base font-semibold text-white shadow-[0_18px_50px_rgba(10,42,94,0.18)] backdrop-blur-xl transition hover:bg-white/[0.16]"
              >
                Contact Support
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.16] bg-white/[0.08] p-6 shadow-[0_22px_80px_rgba(10,42,94,0.20)] backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-light-blue/[0.16] text-light-blue">
                <Wrench size={23} aria-hidden="true" />
              </span>
              <span className="rounded-full bg-white/[0.10] px-3 py-1 text-xs font-semibold text-light-blue">
                Maintenance mode
              </span>
            </div>
            <h2 className="mt-8 text-2xl font-semibold">What to expect</h2>
            <div className="mt-6 grid gap-4">
              {[
                "A cleaner mobile account dashboard",
                "Faster access to cards, transfers, and support",
                "Better maintenance notices and member updates",
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-lg bg-white/[0.08] p-4">
                  <Clock3 size={18} className="mt-0.5 shrink-0 text-light-blue" aria-hidden="true" />
                  <p className="text-sm leading-6 text-white/[0.72]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
