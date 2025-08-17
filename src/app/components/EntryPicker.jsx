"use client";

import { useMemo, useState } from "react";

/**
 * Props:
 * - title: string
 * - icon?: ReactNode
 * - overlayColor: string
 * - bgImage?: string
 * - items: Array<{ id, slug, meta, loader }>
 * - isOpen: boolean
 * - onToggle: () => void
 * - onOpen: (entry) => void
 * - activeId?: string | null
 * - fadeMaskStyle: CSSProperties
 */
export default function EntryPicker({
  title,
  icon,
  overlayColor,
  bgImage,
  items,
  isOpen,
  onToggle,
  onOpen,
  activeId = null,
  fadeMaskStyle,
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((e) => {
      const t = e.meta?.title?.toLowerCase() || "";
      const d = e.meta?.description?.toLowerCase() || "";
      const tags = (e.meta?.tags || []).join(" ").toLowerCase();
      return (
        t.includes(q) ||
        d.includes(q) ||
        tags.includes(q) ||
        e.slug.toLowerCase().includes(q)
      );
    });
  }, [items, query]);

  return (
    <>
      <button
        onClick={onToggle}
        className="relative w-full text-left rounded-xl bg-[#595758] p-4 mb-3 overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
      >
        {/* Right-half overlay (image + tint + fade) */}
        <div
          className="absolute top-0 right-0 h-full w-1/2 z-0"
          style={{
            backgroundColor: overlayColor,
            backgroundImage: bgImage
              ? `linear-gradient(${overlayColor}, ${overlayColor}), url(${bgImage})`
              : undefined,
            backgroundBlendMode: bgImage ? "multiply" : undefined,
            backgroundSize: bgImage ? "cover, cover" : undefined,
            backgroundPosition: bgImage ? "center, center" : undefined,
            backgroundRepeat: bgImage ? "no-repeat, no-repeat" : undefined,
            ...fadeMaskStyle,
            borderTopRightRadius: "0.75rem",
            borderBottomRightRadius: "0.75rem",
          }}
          aria-hidden
        />
        <div className="relative z-10 flex items-center justify-between text-lg sm:text-xl font-semibold">
          <span className="flex items-center gap-2">
            {icon ? <span aria-hidden className="inline-flex">{icon}</span> : null}
            {title}
          </span>
          <span aria-hidden className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
        </div>
        <p className="relative z-10 mt-1 text-sm opacity-90">Browse, search, and open entries</p>
      </button>

      <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ${isOpen ? "max-h-[30rem] opacity-100" : "max-h-0 opacity-0"}`}>
        {/* Search */}
        <div className="pl-2 sm:pl-3 pr-2 mb-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search entries…"
            className="w-full rounded-lg bg-[#444] px-3 py-2 text-sm outline-none border border-white/10 focus:border-white/30"
          />
        </div>

        {/* List */}
        <div className="pl-2 sm:pl-3 pr-2 mb-3 space-y-2">
          {filtered.length === 0 && (
            <div className="text-sm opacity-80 px-2 py-2">No matches.</div>
          )}
          {filtered.map((it) => {
            const active = activeId === it.id;
            return (
              <button
                key={it.id}
                onClick={() => onOpen(it)}
                className={`w-full text-left rounded-lg px-3 py-2 transition ${
                  active
                    ? "bg-[#505050] ring-2 ring-white/40"
                    : "bg-[#444] hover:bg-[#4a4a4a]"
                }`}
              >
                <div className="font-semibold">{it.meta?.title || it.slug}</div>
                {it.meta?.description && (
                  <div className="text-xs opacity-80 mt-0.5 line-clamp-2">
                    {it.meta.description}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}