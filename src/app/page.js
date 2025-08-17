"use client";

import { useEffect, useMemo, useState, Suspense } from "react";

import HubCard from "./components/HubCard";
import SidePanel from "./components/SidePanel";
import EntryPicker from "./components/EntryPicker";
import { useMarquee } from "./hooks/useMarquee";
import { useSidePanel } from "./hooks/useSidePanel";
import { projectIndex, blogIndex } from "./lib/loadEntries";

// --- Hollow-stroke icons ---
const IconBriefcase = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-2" aria-hidden>
    <rect x="3" y="7" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 7V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const IconWrench = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-2" aria-hidden>
    <path d="M21 7a6 6 0 0 1-8.9 5.3L6 18.4a2 2 0 0 1-2.8-2.8l6.1-6.1A6 6 0 0 1 21 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="0.5" fill="currentColor" />
  </svg>
);

const IconPaper = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-2" aria-hidden>
    <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M15 3v5h5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 13h8M8 17h8M8 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default function Hub() {
  const GREY = "#595758";

  // Header marquee
  const phrases = ["What is a react?", "I wrote this website with ChatGPT", "Get off my lawn","8NEC was here","f6ac78b8-fb2f-48e3-9703-b11f2365f1e3"];
  const [text, setText] = useState(phrases[0]);
  useEffect(() => setText(phrases[Math.floor(Math.random() * phrases.length)]), []);
  const { ref: bandRef, bandW, containerW } = useMarquee(text, 48, 24);
  const dur = Math.max(6, Math.round((bandW || 0) / 90));

  // Side panel controller & selection state
  const side = useSidePanel(520, 360, 320);
  const [panelKey, setPanelKey] = useState(null);        // 'portfolio' | 'project' | 'blog' | null
  const [activeEntry, setActiveEntry] = useState(null);  // { id, slug, meta, loader } | null
  const [EntryComp, setEntryComp] = useState(null);

  // Collapsibles
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [blogOpen, setBlogOpen] = useState(false);

  const fadeMask = useMemo(
    () => ({
      WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
      maskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
    }),
    []
  );

const openPortfolio = async () => {
  if (side.mounted && panelKey === "portfolio") {
    side.close();
    setPanelKey(null);
    setActiveEntry(null);
    setEntryComp(null);
    return;
  }
  setPanelKey("portfolio");
  setActiveEntry({ id: "portfolio-current" });
  setEntryComp(null);
  side.open();

  try {
    const mod = await import("./entries/portfolio-current/index.jsx");
    setEntryComp(() => mod.default || null);
  } catch (e) {
    console.error("Failed to load Portfolio:", e);
    setEntryComp(() => () => <div className="p-4">Failed to load portfolio.</div>);
  }
};


  // Toggle behavior for entries (Projects/Blog/Portfolio)
  const openEntryInPanel = async (kind, entry) => {
    if (!entry) return;

    // Toggle off if clicking the same open entry
    if (side.mounted && panelKey === kind && activeEntry?.id === entry.id) {
      side.close();
      setActiveEntry(null);
      setEntryComp(null);
      return;
    }

    setPanelKey(kind);
    setActiveEntry(entry);
    setEntryComp(null);
    side.open();
    try {
      const mod = await entry.loader();
      setEntryComp(() => mod.default || null);
    } catch (e) {
      console.error("Failed to load entry:", e);
      setEntryComp(() => () => <div className="p-4">Failed to load entry.</div>);
    }
  };

  // Click handler for the Portfolio card
  const handlePortfolioClick = (e) => {
    e.preventDefault();
    if (!portfolioEntry) return;
    openEntryInPanel("portfolio", portfolioEntry);
  };

  // Title: prefer the active entry meta title if available
  const panelTitle =
    activeEntry?.meta?.title ||
    (panelKey === "blog" ? "Blog" : panelKey === "project" ? "Project" : panelKey);

  // Whether the content area should render the entry component
  const showEntry =
    panelKey === "project" || panelKey === "blog" || panelKey === "portfolio";

  return (
    <main className={`min-h-screen flex flex-col text-white ${side.resizing ? "cursor-col-resize select-none" : ""}`}>
      {/* HEADER */}
      <header className="relative overflow-hidden shadow-md py-3 sm:py-4">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg,
              #bf5b5b 0%, #bf5b5b 20%,
              #c6b955 20%, #c6b955 40%,
              #86b460 40%, #86b460 60%,
              #3c8d88 60%, #3c8d88 80%,
              ${GREY} 80%, ${GREY} 100%)`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
          aria-hidden
        />
        <div className="relative z-10">
          <div className="inline-flex max-w-full items-center gap-3 sm:gap-4 rounded-xl bg-black/60 px-3 sm:px-4 py-2 ml-2 mt-1 mb-2">
            <h1 className="whitespace-nowrap text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight">My Hub</h1>
            <div className="overflow-hidden rounded-md h-7 sm:h-8" style={{ width: containerW ? `${containerW}px` : undefined }}>
              <div
                className="marquee-track flex items-center will-change-transform text-base sm:text-lg font-extrabold tracking-tight"
                style={{ width: "max-content", animation: bandW ? `marquee ${dur}s linear infinite` : "none", ["--bandW"]: `${bandW}px` }}
              >
                <div className="flex items-center">
                  <span ref={bandRef} className="inline-block">{text}</span>
                  <span aria-hidden className="inline-block" style={{ width: "48px" }} />
                </div>
                <div className="flex items-center" aria-hidden>
                  <span className="inline-block">{text}</span>
                  <span className="inline-block" style={{ width: "48px" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <section className="relative flex-1 pl-6 pr-6 sm:pl-8 sm:pr-8 py-6 overflow-x-clip">
        <div className="w-full max-w-xl">
          {/* this fucking sucks */}
          <div
  role="button"
  tabIndex={0}
  onClick={openPortfolio}                // <-- call the loader above
  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openPortfolio()}
  className="relative rounded-xl p-4 mb-3 bg-[#595758] overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(0,0,0,0.18)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
>
  <div
    className="absolute top-0 right-0 h-full w-1/2 z-0"
    style={{
      backgroundColor: "#ffc2c2ff",
      backgroundImage: `linear-gradient(#ffc2c2ff, #ffc2c2ff), url(/HubCardImages/Portfolio.png)`, // add leading slash
      backgroundBlendMode: "multiply",
      backgroundSize: "cover, cover",
      backgroundPosition: "center, center",
      backgroundRepeat: "no-repeat, no-repeat",
      ...fadeMask,
      borderTopRightRadius: "0.75rem",
      borderBottomRightRadius: "0.75rem",
    }}
    aria-hidden
  />
  <div className="relative z-10">
    <div className="flex items-center justify-between text-lg sm:text-xl font-semibold">
      <span className="flex items-center gap-2">
        {IconBriefcase}
        Portfolio
      </span>
    </div>
    <p className="mt-1 text-sm opacity-90">I / Me / Myself</p>
  </div>
</div>

          {/* Projects picker */}
          <EntryPicker
            title="Projects"
            icon={IconWrench}
            overlayColor="#e6dea7ff"
            bgImage="HubCardImages/Projects.png"
            items={projectIndex || []}
            isOpen={projectsOpen}
            onToggle={() => setProjectsOpen((v) => !v)}
            onOpen={(entry) => openEntryInPanel("project", entry)}
            activeId={panelKey === "project" ? activeEntry?.id : null}
            fadeMaskStyle={fadeMask}
          />

          {/* Blog picker */}
          <EntryPicker
            title="Blog"
            icon={IconPaper}
            overlayColor="#6fe1fdff"
            bgImage="HubCardImages/Blog.png"
            items={blogIndex || []}
            isOpen={blogOpen}
            onToggle={() => setBlogOpen((v) => !v)}
            onOpen={(entry) => openEntryInPanel("blog", entry)}
            activeId={panelKey === "blog" ? activeEntry?.id : null}
            fadeMaskStyle={fadeMask}
          />
        </div>

        {/* Right-side panel */}
        {side.mounted && (
          <SidePanel
            open={side.animIn}
            width={`${side.width}px`}
            onResizeStart={side.startResize}
            onExited={() => {
              setActiveEntry(null);
              setEntryComp(null);
            }}
            title={panelTitle}
          >
            <div className="h-full flex flex-col min-w-0">
      {panelKey && (
      <div className="flex-1 min-h-0 overflow-auto p-4">
        {!EntryComp && <div className="opacity-80">Loading…</div>}
        {EntryComp && (
          // Key on kind + entry id so the animation runs on each swap
          <div key={`${panelKey}:${activeEntry?.id || "none"}`} className="panel-swap-in">
            <Suspense fallback={<div className="opacity-80">Loading…</div>}>
              <EntryComp />
            </Suspense>
          </div>
        )}
      </div>
    )}
  </div>
          </SidePanel>
        )}
      </section>

      {/* FOOTER */}
      <footer className="py-5 px-6" style={{ background: GREY }}>
        <div className="max-w-xl text-sm text-white opacity-90">
          <p>hatzby.online - Work In Progress</p>
          <p>Special Thanks: PupNetx</p>
          <p>Updated: Aug.08.2025</p>
        </div>
      </footer>

      {/* Local styles */}
      <style jsx>{`
      @keyframes panelIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  :global(.panel-swap-in) {
    animation: panelIn 160ms ease-out;
  }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-1 * var(--bandW))); }
        }
        :global(html), :global(body) { background: #fffff3ff; }
        :global(.prose.prose-invert) a { text-decoration: underline; }
      `}</style>
    </main>
  );
}
