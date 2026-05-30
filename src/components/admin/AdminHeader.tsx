import { ShieldCheck } from "lucide-react";
import { AppUserBadge } from "@/components/layout/AppUserBadge";

type AdminHeaderProps = {
  title: string;
  subtitle?: string;
};

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-primary-navy/[0.08] bg-[#f7fbff]/86 px-4 py-4 backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#061222]/88 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-primary-navy/[0.08] px-3 py-1 text-xs font-semibold text-primary-navy dark:bg-white/[0.08] dark:text-light-blue">
            <ShieldCheck size={14} aria-hidden="true" />
            Admin access
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-primary-navy dark:text-white sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
              {subtitle}
            </p>
          ) : null}
        </div>

        <AppUserBadge />
      </div>
    </header>
  );
}
