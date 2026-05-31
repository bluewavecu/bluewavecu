"use client";

import { useEffect, useRef, useState } from "react";

type UseAutoHideOnScrollOptions = {
  threshold?: number;
  offset?: number;
};

export function useAutoHideOnScroll(options: UseAutoHideOnScrollOptions = {}) {
  const { threshold = 48, offset = 12 } = options;
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function handleScroll() {
      const currentY = window.scrollY;

      if (currentY <= offset) {
        setVisible(true);
        lastScrollY.current = currentY;
        return;
      }

      if (Math.abs(currentY - lastScrollY.current) < threshold) {
        return;
      }

      setVisible(currentY < lastScrollY.current);
      lastScrollY.current = currentY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [offset, threshold]);

  return visible;
}
