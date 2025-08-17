"use client";
import { useEffect, useState } from "react";

export function useSidePanel(initialWidth = 420, minMainVisible = 360, minW = 300) {
  const [mounted, setMounted] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const [width, setWidth] = useState(initialWidth);
  const [resizing, setResizing] = useState(false);

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const clampWidthToViewport = (w) => {
    const maxW = Math.max(minW, window.innerWidth - minMainVisible);
    return clamp(w, minW, maxW);
  };

  useEffect(() => {
    const onResize = () => setWidth((w) => clampWidthToViewport(w));
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const open = () => {
    setMounted(true);
    setWidth((w) => clampWidthToViewport(w));
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