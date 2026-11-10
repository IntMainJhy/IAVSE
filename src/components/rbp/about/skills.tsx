// Source: DavidHDev/rbp-portfolio @ 1581b9b8e5876f60e5eb844970747506980c4412.
// IAVSE content adaptation; upstream layout and normal-motion values retained. See docs/licenses/RBP-Portfolio.txt.
import type { ReactNode } from "react";
import { aboutLabels, featureLabels } from "./copy";


export function Skills({ locale = "zh" }: { locale?: string }): ReactNode {
  const SKILLS = featureLabels(locale);
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
        {aboutLabels(locale).skills}
      </h3>
      <div className="rounded-4xl border border-foreground/5 bg-foreground/2 p-2 sm:p-4 dark:bg-foreground/5">
        <div className="flex flex-wrap gap-3">
          {SKILLS.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-foreground/8 bg-background px-4 py-2 text-[14px] tracking-tight text-foreground/85 sm:text-[15px]"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
