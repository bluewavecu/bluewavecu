import { ArrowUpRight, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";

const footerLinks = [
  {
    title: "Banking",
    links: [
      { label: "Personal", href: "/personal" },
      { label: "Business", href: "/business" },
      { label: "Savings", href: "/savings" },
      { label: "Loans", href: "/loans" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Support", href: "/support" },
      { label: "Security", href: "/security" },
      { label: "Mobile App", href: "/mobile-app" },
      { label: "Rates", href: "/rates" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Newsroom", href: "/newsroom" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer id="support" className="bg-brand-navy text-white">
      <div className="section-shell py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1.45fr]">
          <div>
            <BrandLogo href="/" displayHeight={44} priority />
            <p className="mt-5 max-w-md text-sm leading-6 text-white/[0.68]">
              Your secure gateway to modern digital banking. Access your accounts,
              discover competitive products, and manage your financial future with
              Bluewave Credit Union.
            </p>

            <div className="mt-7 grid gap-3 text-sm text-white/[0.72]">
              <span className="flex items-center gap-3">
                <MapPin size={17} className="text-light-blue" aria-hidden="true" />
                2000 McKinney Ave, Dallas, TX 75201
              </span>
              <span className="flex items-center gap-3">
                <Phone size={17} className="text-light-blue" aria-hidden="true" />
                (646) 776-4480
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
                Bluewave Credit Union is federally insured by the NCUA. Membership
                eligibility applies. Equal Housing Opportunity.
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
