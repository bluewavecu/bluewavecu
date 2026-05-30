import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { MotionReveal } from "@/components/home/MotionReveal";
import { cn } from "@/lib/utils";
import type { MarketingSplitBlock } from "@/types/marketing";

type MarketingSplitSectionProps = {
  block: MarketingSplitBlock;
};

export function MarketingSplitSection({ block }: MarketingSplitSectionProps) {
  return (
    <section className="bg-[linear-gradient(180deg,#f7fbff_0%,#edf7fd_100%)] py-16 sm:py-20">
      <div className="section-shell">
        <div
          className={cn(
            "grid gap-10 lg:grid-cols-2 lg:items-center",
            block.reverse && "lg:[&>*:first-child]:order-2",
          )}
        >
          <MotionReveal>
            <p className="text-sm font-semibold uppercase text-ocean-blue">{block.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold text-primary-navy sm:text-4xl">
              {block.title}
            </h2>
            <p className="mt-5 text-base leading-7 text-bluewave-gray">{block.description}</p>
            {block.bullets ? (
              <ul className="mt-6 space-y-3">
                {block.bullets.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-primary-navy">
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-ocean-blue"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </MotionReveal>

          <MotionReveal delay={0.08}>
            <div className="overflow-hidden rounded-lg border border-primary-navy/[0.08] shadow-[0_24px_80px_rgba(10,42,94,0.12)]">
              <Image
                src={block.image}
                alt={block.imageAlt}
                width={1200}
                height={800}
                className="h-[280px] w-full object-cover sm:h-[340px]"
              />
            </div>
          </MotionReveal>
        </div>
      </div>
    </section>
  );
}
