import { CircleHelp, Mail, MessageSquareText, Phone } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { supportMessages } from "@/data/mockBanking";

export default function SupportPage() {
  return (
    <AppShell
      title="Support"
      subtitle="Support inbox, contact paths, and secure message placeholders for future service workflows."
    >
      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
            Support messages
          </h2>
          <div className="mt-5 divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
            {supportMessages.map((message) => (
              <article key={message.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-primary-navy dark:text-white">
                      {message.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-bluewave-gray dark:text-white/[0.58]">
                      {message.preview}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-ocean-blue/[0.10] px-3 py-1 text-xs font-semibold text-royal-blue dark:text-light-blue">
                    {message.status}
                  </span>
                </div>
                <p className="mt-3 text-xs font-medium text-bluewave-gray dark:text-white/[0.48]">
                  {message.date} | Priority: {message.priority}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-lg border border-primary-navy/[0.08] bg-primary-navy p-6 text-white shadow-[0_18px_60px_rgba(10,42,94,0.12)]">
            <CircleHelp size={26} className="text-light-blue" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-semibold">Contact placeholders</h2>
            <p className="mt-3 text-sm leading-6 text-white/[0.68]">
              Replace these placeholders when verified service channels are available.
            </p>
          </div>

          {[
            { label: "support@bluewavecu.com", icon: Mail },
            { label: "Phone placeholder", icon: Phone },
            { label: "Secure message center pending", icon: MessageSquareText },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-center gap-4 rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue dark:text-light-blue">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <p className="text-sm font-semibold text-primary-navy dark:text-white">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
