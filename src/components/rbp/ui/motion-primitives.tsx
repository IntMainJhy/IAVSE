// Adapted from DavidHDev/rbp-portfolio, commit 1581b9b8e5876f60e5eb844970747506980c4412.
// See docs/licenses/RBP-Portfolio.txt. Layout and normal-motion parameters are retained from upstream.
"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function FadeIn({
  children,
  delay = 0,
  duration = 0.8,
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}): ReactNode {
  const quiet = useReducedMotion();
  return (
    <motion.div
      initial={quiet ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: quiet ? 0 : duration, delay: quiet ? 0 : delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleUnblur({
  children,
  delay = 0,
  duration = 1,
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}): ReactNode {
  const quiet = useReducedMotion();
  return (
    <motion.div
      initial={quiet ? false : { opacity: 0, scale: 0.7, filter: "blur(20px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: quiet ? 0 : duration, delay: quiet ? 0 : delay, ease: EASE }}
      style={{ transformOrigin: "center" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
