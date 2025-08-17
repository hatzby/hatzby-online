"use client";
import { useEffect, useState } from "react";

export function useSidePanel(
  // Default to 50% of viewport or provided width, whichever is larger
  initialWidth = typeof window !== 'undefined' ? Math.max(420, window.innerWidth * 0.5) : 420,
  // Keep at least 40% of viewport visible for main content
  minMainVisible = typeof window !== 'undefined' ? window.innerWidth * 0.4 : 360,
  // Minimum panel width is 35% of viewport or 300px, whichever is larger
  minW = typeof window !== 'undefined' ? Math.max(300, window.innerWidth * 0.35) : 300
) {
  // Calculate responsive initial width on mount
  const getInitialWidth = () => {
    if (typeof window === 'undefined') return initialWidth;
    return Math.max(window.innerWidth * 0.5, 420);
  };

  const [mounted, setMounted] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const [width, setWidth] = useState(initialWidth);
  const [resizing, setResizing] = useState(false);

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const clampWidthToViewport = (w) => {
    if (typeof window === 'undefined') return w;
    const viewportBasedMin = Math.max(300, window.innerWidth * 0.35);
    const maxW = Math.max(viewportBasedMin, window.innerWidth - window.innerWidth * 0.4);
    return clamp(w, minW, maxW);
  };

  useEffect(() => {
    const onResize = () => setWidth((w) => clampWidthToViewport(w));
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const open = () => {
    setMounted(true);
    setWidth(getInitialWidth());
    // Double rAF guarantees: 1) mount closed → paint, 2) flip to open → animate
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimIn(true));
    });
  };

  const close = () => setAnimIn(false);
  const onExited = () => setMounted(false);

  const startResize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    const onMove = (ev) => setWidth(clampWidthToViewport(window.innerWidth - ev.clientX));
    const onUp = () => {
      setResizing(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return { mounted, animIn, width, resizing, open, close, onExited, startResize };
}