"use client";

import { useMemo, useState, useEffect } from "react";
import HubCard from "./HubCard";
import { useTheme } from "../hooks/useTheme";

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
  const { theme } = useTheme();

  const buttonBg = theme === 'dark' ? '#313131' : '#595758';

  useEffect(() => {
    document.documentElement.style.setProperty('--submenu-bg', buttonBg);
  }, [theme, buttonBg]);

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
      <HubCard
        title={title}
        icon={icon}
        description="Browse, search, and open entries"
        overlayColor={overlayColor}
        bgImage={bgImage}
        fadeMaskStyle={fadeMaskStyle}
        onClick={onToggle}
        isOpen={isOpen}
      />      <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ${isOpen ? "max-h-[30rem] opacity-100" : "max-h-0 opacity-0"}`}>
        {/* Search */}
        <div className="pl-2 sm:pl-3 pr-2 mb-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search entries…"
            className="w-full rounded-lg px-3 py-2 text-sm outline-none border border-white/10 focus:border-white/30"
            style={{ background: 'var(--submenu-bg)' }}
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
                className={`w-full text-left rounded-lg px-3 py-2 transition duration-150
                  hover:bg-[var(--submenu-bg)] hover:ring-1 hover:ring-white/20
                  ${active ? 'bg-[var(--submenu-bg)] ring-2 ring-white/40' : 'bg-[var(--submenu-bg)]/80'}`}
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