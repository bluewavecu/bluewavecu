import { ArrowUpRight, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  {
    title: "Banking",
    links: [
      { label: "Personal", href: "#products" },
      { label: "Business", href: "#products" },
      { label: "Savings", href: "#products" },
      { label: "Loans", href: "#products" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Support", href: "#support" },
      { label: "Security", href: "#security" },
      { label: "Mobile App", href: "#features" },
      { label: "Rates", href: "#products" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#features" },
      { label: "Careers", href: "#support" },
      { label: "Newsroom", href: "#support" },
      { label: "Contact", href: "#support" },
    ],
  },
];

export function Footer() {
  return (
    <footer id="support" className="bg-[#061222] text-white">
      <div className="section-shell py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1.45fr]">
          <div>
            <Link href="/" aria-label="Bluewave Credit Union home" className="inline-flex">
              <span className="relative block h-12 w-48 overflow-hidden">
                <Image
                  src="/images/logo.webp"
                  alt="Bluewave Credit Union"
                  fill
                  sizes="192px"
                  className="object-contain object-left"
                />
              </span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-6 text-white/[0.68]">
              A premium digital banking interface foundation for secure account access,
              product discovery, and modern financial management.
            </p>

            <div className="mt-7 grid gap-3 text-sm text-white/[0.72]">
              <span className="flex items-center gap-3">
                <MapPin size={17} className="text-light-blue" aria-hidden="true" />
                Headquarters placeholder
              </span>
              <span className="flex items-center gap-3">
                <Phone size={17} className="text-light-blue" aria-hidden="true" />
                Phone placeholder
              </span>
              <span className="flex items-center gap-3">
                <Mail size={17} className="text-light-blue" aria-hidden="true" />
                support@bluewavecu.com
              </span>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-white">{group.title}</h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center gap-1.5 text-sm text-white/[0.64] transition hover:text-light-blue"
                      >
                        {link.label}
                        <ArrowUpRight size={13} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-white/[0.58]">
              © {new Date().getFullYear()} Bluewave Credit Union. All rights reserved.
            </p>
            <p className="flex max-w-3xl gap-3 text-xs leading-5 text-white/[0.54]">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0 text-light-blue"
                aria-hidden="true"
              />
              <span>
                Bluewave Credit Union is a digital banking platform interface. Do not
                claim FDIC, NCUA, insured deposits, or licensed banking approval unless
                legally verified.
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
