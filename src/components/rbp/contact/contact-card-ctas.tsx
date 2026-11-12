// From DavidHDev/rbp-portfolio @ 1581b9b8e5876f60e5eb844970747506980c4412.
// Original layout and motion retained; IAVSE content only. See docs/licenses/RBP-Portfolio.txt.
"use client";

import { ArrowRight } from "lucide-react";
import { LayoutGroup, motion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import {portfolioCopy} from "@/lib/portfolio-content";

import { ContactButton } from "./contact-button";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ContactCardCtas({locale="zh"}:{locale?:string}): ReactNode {
 const c=portfolioCopy(locale);
  return (
    <LayoutGroup>
      <motion.div
        layout
        transition={{ layout: { duration: 0.55, ease: EASE } }}
        className="mt-2 flex flex-wrap items-center gap-3 max-md:justify-center"
      >
        <ContactButton locale={locale} />

        <motion.div
          layout
          transition={{ layout: { duration: 0.55, ease: EASE } }}
        >
          <Link
            href="/resources"
            className="border border-foreground/5 focus-ring group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-background px-5 py-2.5 text-sm font-medium text-foreground shadow-md/2 transition-colors"
          >
            {c.explore}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
}
