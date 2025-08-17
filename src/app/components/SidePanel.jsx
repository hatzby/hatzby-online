"use client";
import { useEffect, useRef, useState } from "react";

export default function SidePanel({
  open,
  width,
  onResizeStart,
  onExited,
  title,
  children,
  grey = "#595758",
}) {
  // --- Snapshot last non-empty title/content to avoid fallback flicker
  const lastTitleRef = useRef(title);
  const lastChildrenRef = useRef(children);

  useEffect(() => {
    if (open) {
      lastTitleRef.current = title ?? lastTitleRef.current;
      if (children !== null && children !== undefined) {
        lastChildrenRef.current = children;
      }
    }
  }, [open, title, children]);

  const shownTitle = open ? title : (lastTitleRef.current ?? title);
  const shownChildren = open ? children : (lastChildrenRef.current ?? children);

  // --- One-time resize hint
  const [showHint, setShowHint] = useState(false);
  useEffect(() => {
    if (open) {
      setShowHint(true);
      const t = setTimeout(() => setShowHint(false), 1100);
      return () => clearTimeout(t);
    } else {
      setShowHint(false);
    }
  }, [open]);

  return (
    <aside 
      className="absolute inset-y-0 right-0 text-[#111] flex flex-col z-50"
      style={{
        width,
        background: "#f5f5f4",
        borderLeft: `2px solid ${grey}`,
        boxShadow: "-12px 0 28px rgba(0,0,0,0.18)", // softer shadow
        transition:
          "opacity 200ms ease-out, transform 200ms ease-out, box-shadow 200ms ease-out",
        opacity: open ? 1 : 0,
        transform: open ? "translateX(0)" : "translateX(8px)",
      }}
      role="dialog"
      aria-label="Side Panel"
      onTransitionEnd={() => !open && onExited?.()}
    >
      {/* Resize rail (interactive) */}
      <div
        onMouseDown={onResizeStart}
        className="absolute left-0 top-0 h-full w-1.5 cursor-col-resize z-50"
        title="Drag to resize"
        aria-label="Resize panel"
        style={{ background: "transparent" }}
      />

      {/* Flashing arrow hint (auto hides after ~1s) */}
      {showHint && (
        <div
          className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none select-none"
          aria-hidden
          style={{ opacity: 0.9 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" className="hint-arrow">
            <path
              d="M15 6l-6 6 6 6"
              fill="none"
              stroke={grey}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${grey}`, background: "#f5f5f4" }}
      >
        <h2 className="font-bold capitalize tracking-tight">{shownTitle}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-4 whitespace-normal break-words leading-relaxed space-y-3">
        {shownChildren}
      </div>

      {/* Local styles for the hint animation */}
      <style jsx>{`
        @keyframes nudge {
          0% { transform: translateX(0); opacity: 0; }
          20% { transform: translateX(-2px); opacity: 1; }
          60% { transform: translateX(-4px); opacity: 1; }
          100% { transform: translateX(0); opacity: 0; }
        }
        .hint-arrow {
          animation: nudge 1s ease-out forwards;
        }
      `}</style>
    </aside>
  );
}
