import { useEffect, useState } from "react";

/** Preserve desktop navigation; narrow previews begin with a dismissible drawer. */
export function useResponsiveSidebar() {
  const [open, setOpen] = useState(() => typeof window === "undefined" || window.matchMedia("(min-width: 1024px)").matches);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setOpen(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const closeOnMobile = () => {
    if (!window.matchMedia("(min-width: 1024px)").matches) setOpen(false);
  };
  return [open, setOpen, closeOnMobile] as const;
}
