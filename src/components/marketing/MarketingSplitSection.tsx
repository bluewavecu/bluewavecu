import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { MotionReveal } from "@/components/home/MotionReveal";
import { MarketingSectionHeader } from "@/components/marketing/MarketingSectionHeader";
import { cn } from "@/lib/utils";
import type { MarketingSplitBlock } from "@/types/marketing";

type MarketingSplitSectionProps = {
  block: MarketingSplitBlock;
};

export function MarketingSplitSection({ block }: MarketingSplitSectionProps) {
  return (
    <section className="classic-marble py-16 sm:py-20">
      <div className="section-shell">
        <div
          className={cn(
            "grid gap-10 lg:grid-cols-2 lg:items-center",
            block.reverse && "lg:[&>*:first-child]:order-2",
          )}
        >
          <MotionReveal>
            <MarketingSectionHeader
              eyebrow={block.eyebrow}
              title={block.title}
              description={block.description}
            />
            {block.bullets ? (
              <ul className="mt-8 space-y-3">
                {block.bullets.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-primary-navy">
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-classic-gold"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </MotionReveal>

          <MotionReveal delay={0.08}>
            <div className="overflow-hidden rounded-sm border border-primary-navy/10 shadow-[0_24px_80px_rgba(10,42,94,0.12)]">
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
