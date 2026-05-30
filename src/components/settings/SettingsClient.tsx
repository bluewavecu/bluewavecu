"use client";

import { InfoPanel } from "@/components/ui/InfoPanel";

const preferenceSections = [
  {
    title: "Email notifications",
    description: "Transfer alerts, login alerts, and support updates — managed via Resend when configured.",
    status: "Coming soon",
  },
  {
    title: "Communication preferences",
    description: "Marketing and product update opt-in controls.",
    status: "Coming soon",
  },
  {
    title: "Theme preference",
    description: "Light and dark mode persistence across devices.",
    status: "Coming soon",
  },
  {
    title: "Privacy & security",
    description: "Data sharing and session timeout preferences.",
    status: "Coming soon",
  },
  {
    title: "Account nicknames",
    description: "Custom labels for checking, savings, and credit accounts.",
    status: "Coming soon",
  },
];

export function SettingsClient() {
  return (
    <section className="grid gap-5">
      <InfoPanel title="Member settings">
        Preferences below are placeholders for future releases. Banking security settings are
        available under Security in the sidebar.
      </InfoPanel>

      {preferenceSections.map((section) => (
        <article
          key={section.title}
          className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
                {section.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-bluewave-gray dark:text-white/[0.58]">
                {section.description}
              </p>
            </div>
            <span className="w-fit rounded-full bg-primary-navy/[0.06] px-3 py-1 text-xs font-semibold text-primary-navy dark:bg-white/[0.08] dark:text-white">
              {section.status}
            </span>
          </div>
        </article>
      ))}
    </section>
  );
}
