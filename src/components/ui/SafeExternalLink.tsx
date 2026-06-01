import type { ComponentProps } from "react";
import { getAllowedExternalUrl } from "@/lib/externalLinks";
import { cn } from "@/lib/utils";

type SafeExternalLinkProps = Omit<ComponentProps<"a">, "href"> & {
  href: string;
};

export function SafeExternalLink({
  href,
  className,
  children,
  ...props
}: SafeExternalLinkProps) {
  const allowedHref = getAllowedExternalUrl(href);

  if (!allowedHref) {
    return <span className={cn(className)}>{children}</span>;
  }

  return (
    <a
      href={allowedHref}
      className={className}
      rel="noopener noreferrer"
      target="_blank"
      {...props}
    >
      {children}
    </a>
  );
}
