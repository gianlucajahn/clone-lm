"use client";

import { useEffect, useState } from "react";

/**
 * Current viewport width, updated on resize. SSR-safe (starts at a desktop
 * default, then corrects on mount). Used to switch between the desktop
 * three-column layout and the compact tabbed layout on tablets/phones.
 */
export function useViewport(): number {
  const [width, setWidth] = useState(1440);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}
