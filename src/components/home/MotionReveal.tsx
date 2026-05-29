"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

type MotionRevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
};

export function MotionReveal({
  children,
  delay = 0,
  ...props
}: MotionRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.62, delay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
