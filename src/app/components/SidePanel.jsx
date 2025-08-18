"use client";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../hooks/useTheme";

export default function SidePanel({
  open,
  width,
  onResizeStart,
  onExited,
  title,
  children,
  grey = "#595758",
}) {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
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

  // --- Ensure we always call onExited once when the panel finishes closing.
  // Some browsers or environments can miss the transitionend event; provide a
  // timed fallback and guard against double-calls.
  const exitedCalledRef = useRef(false);
  useEffect(() => {
    if (open) {
      exitedCalledRef.current = false;
      return;
    }
    // If panel is closed, schedule a fallback to call onExited after the
    // expected transition duration (200ms) plus a small buffer.
    const t = setTimeout(() => {
      if (!exitedCalledRef.current) {
        exitedCalledRef.current = true;
        onExited?.();
      }
    }, 260);
    return () => clearTimeout(t);
  }, [open, onExited]);

  return (
    <aside 
      className="absolute inset-y-0 right-0 flex flex-col z-50 max-w-full"
      style={{
        width: isMobile ? '100%' : width,
        background: theme === 'dark' ? '#313131' : '#ffffff',
        color: theme === 'dark' ? '#e1e1e1' : '#1a1a1a',
        borderLeft: `2px solid ${theme === 'dark' ? '#414141' : '#e5e5e5'}`,
        boxShadow: "-12px 0 28px rgba(0,0,0,0.18)", // softer shadow
        transition:
          "opacity 200ms ease-out, transform 200ms ease-out, box-shadow 200ms ease-out",
        opacity: open ? 1 : 0,
        transform: open ? "translateX(0)" : "translateX(8px)",
        // Prevent the hidden panel from intercepting pointer events while it
        // finishes its exit animation. This lets the page remain interactive
        // (scroll/tap) on mobile/desktop.
        pointerEvents: open ? "auto" : "none",
      }}
      role="dialog"
      aria-label="Side Panel"
      aria-hidden={!open}
      onTransitionEnd={(e) => {
        // Only consider the transitionend from the panel element's opacity
        // to avoid multiple calls from transform/box-shadow transitions.
        if (e.target === e.currentTarget && e.propertyName === "opacity" && !open && !exitedCalledRef.current) {
          exitedCalledRef.current = true;
          onExited?.();
        }
      }}
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
        style={{ 
          borderBottom: `1px solid ${theme === 'dark' ? '#414141' : '#e5e5e5'}`,
          background: theme === 'dark' ? '#313131' : '#ffffff'
        }}
      >
        <h2 className="font-bold capitalize tracking-tight">{shownTitle}</h2>
        <button
          onClick={() => open && onExited?.()} // Only trigger on close if panel is open
          className="p-2 rounded-lg hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-black/20 transition-colors"
          aria-label="Close panel"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
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
