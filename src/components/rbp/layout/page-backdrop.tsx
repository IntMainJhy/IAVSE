// Adapted from DavidHDev/rbp-portfolio, commit 1581b9b8e5876f60e5eb844970747506980c4412.
// See docs/licenses/RBP-Portfolio.txt. Layout and normal-motion parameters are retained from upstream.
import type { ReactNode } from "react";

import { ShaderFlow } from "../../portfolio/ShaderFlow";

export function PageBackdrop(): ReactNode {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-225 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-50 md:opacity-100">
        <ShaderFlow brightness={3} iterations={10} flowSpeed={[0, 0.1]} />
      </div>
    </div>
  );
}
