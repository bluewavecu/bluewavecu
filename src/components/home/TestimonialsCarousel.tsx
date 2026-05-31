"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Quote } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { testimonials } from "@/data/home";
import { useTranslation } from "@/i18n/LocaleProvider";

function getVisibleCount() {
  if (typeof window === "undefined") {
    return 1;
  }

  return window.matchMedia("(min-width: 1024px)").matches ? 3 : 1;
}

export function TestimonialsCarousel() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    function syncVisibleCount() {
      setVisibleCount(getVisibleCount());
    }

    syncVisibleCount();
    window.addEventListener("resize", syncVisibleCount);

    return () => window.removeEventListener("resize", syncVisibleCount);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + visibleCount) % testimonials.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [visibleCount]);

  const visibleTestimonials = useMemo(
    () =>
      Array.from({ length: visibleCount }, (_, offset) => {
        const nextIndex = (activeIndex + offset) % testimonials.length;
        return testimonials[nextIndex];
      }),
    [activeIndex, visibleCount],
  );

  return (
    <section
      className="classic-marble border-t border-classic-gold/20 pb-16 sm:pb-20"
      aria-label="Demo feedback"
    >
      <div className="section-shell">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ocean-blue">
            {t("marketing.home.memberStoriesEyebrow")}
          </p>
          <div className="gold-rule mt-4 max-w-xs" aria-hidden="true" />
        </div>

        <div className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeIndex}-${visibleCount}`}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="grid gap-5 lg:grid-cols-3"
            >
              {visibleTestimonials.map((testimonial) => (
                <article key={testimonial.id} className="marketing-card min-h-72">
                  <span className="marketing-icon-wrap">
                    <Quote size={21} aria-hidden="true" />
                  </span>
                  <p className="mt-6 text-base leading-7 text-primary-navy">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="mt-7 border-t border-classic-gold/20 pt-5">
                    <h3 className="font-display font-semibold text-primary-navy">{testimonial.name}</h3>
                    <p className="mt-2 flex items-center gap-2 text-sm text-bluewave-gray">
                      <MapPin size={15} className="text-classic-gold" aria-hidden="true" />
                      {testimonial.location}
                    </p>
                  </div>
                </article>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
