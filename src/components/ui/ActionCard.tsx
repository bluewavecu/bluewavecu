import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ActionCardProps = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  className?: string;
};

export function ActionCard({ label, href, icon: Icon, description, className }: ActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-24 flex-col justify-between rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] p-4 text-primary-navy transition hover:-translate-y-0.5 hover:border-ocean-blue/[0.40] hover:bg-ocean-blue/[0.08] dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white",
        className,
      )}
    >
      <Icon size={22} className="text-royal-blue dark:text-light-blue" aria-hidden="true" />
      <div>
        <span className="text-sm font-semibold">{label}</span>
        {description ? (
          <p className="mt-1 text-xs text-bluewave-gray dark:text-white/[0.48]">{description}</p>
        ) : null}
      </div>
    </Link>
  );
}
