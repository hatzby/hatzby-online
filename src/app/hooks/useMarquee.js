"use client";
import { useLayoutEffect, useRef, useState } from "react";

export function useMarquee(text, gap = 48, viewportMargin = 24) {
  const ref = useRef(null);
  const [bandW, setBandW] = useState(0);
  const [containerW, setContainerW] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (!ref.current) return;
      const w = Math.ceil(ref.current.getBoundingClientRect().width);
      const exactBand = w + gap;
      const maxWidth = Math.max(220, Math.floor(window.innerWidth - viewportMargin * 2));
      setBandW(exactBand);
      setContainerW(Math.min(exactBand, maxWidth));
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, [text, gap, viewportMargin]);

  return { ref, bandW, containerW };
}