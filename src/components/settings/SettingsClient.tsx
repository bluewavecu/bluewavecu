"use client";

import { InfoPanel } from "@/components/ui/InfoPanel";

const preferenceSections = [
  {
    title: "Email notifications",
    description:
      "Transfer alerts, login alerts, statement notices, and support updates delivered to your registered email.",
    status: "Managed via profile",
  },
  {
    title: "Communication preferences",
    description: "Marketing and product update opt-in controls for email and mail.",
    status: "Contact member services",
  },
  {
    title: "Theme preference",
    description: "Light and dark mode follows your device settings in online banking.",
    status: "Automatic",
  },
  {
    title: "Privacy & security",
    description: "Session timeout and security alerts are managed under Security in the sidebar.",
    status: "View Security",
  },
  {
    title: "Account nicknames",
    description: "Custom labels for checking, savings, and credit accounts.",
    status: "Contact member services",
  },
];

export function SettingsClient() {
  return (
    <section className="grid gap-5">
      <InfoPanel title="Member settings">
        Manage notification and communication preferences with Bluewave member services. Security
        controls such as sessions and multi-factor authentication are available under Security.
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
