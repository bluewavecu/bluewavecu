"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Quote } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { testimonials } from "@/data/home";

function getVisibleCount() {
  if (typeof window === "undefined") {
    return 1;
  }

  return window.matchMedia("(min-width: 1024px)").matches ? 3 : 1;
}

export function TestimonialsCarousel() {
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
    <section className="bg-background pb-16 sm:pb-20" aria-labelledby="member-stories">
      <div className="section-shell">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-ocean-blue">
              Member stories
            </p>
            <h2
              id="member-stories"
              className="mt-3 text-3xl font-semibold text-primary-navy sm:text-4xl"
            >
              Banking feedback from across the United States
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-bluewave-gray">
            Sample member feedback for the Bluewave digital banking experience.
          </p>
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
                <article
                  key={testimonial.id}
                  className="min-h-72 rounded-lg border border-primary-navy/[0.08] bg-white p-6 shadow-[0_20px_70px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue">
                      <Quote size={21} aria-hidden="true" />
                    </span>
                    <span className="rounded-full bg-primary-navy/[0.06] px-3 py-1 text-xs font-semibold text-primary-navy">
                      {testimonial.id.replace("testimonial-", "Story ")}
                    </span>
                  </div>
                  <p className="mt-6 text-base leading-7 text-primary-navy">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="mt-7 border-t border-primary-navy/[0.08] pt-5">
                    <h3 className="font-semibold text-primary-navy">
                      {testimonial.name}
                    </h3>
                    <p className="mt-2 flex items-center gap-2 text-sm text-bluewave-gray">
                      <MapPin size={15} className="text-ocean-blue" aria-hidden="true" />
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
