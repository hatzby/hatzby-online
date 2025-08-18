"use client";

import { useEffect, useMemo, useState, Suspense, useRef } from "react";

import SidePanel from "./components/SidePanel";
import EntryPicker from "./components/EntryPicker";
import HubCard from "./components/HubCard";
import ThemeToggle from "./components/ThemeToggle";
import ThemeTransition from "./components/ThemeTransition";
import { useTheme } from "./hooks/useTheme";

// Mobile detection hook
function useMobileDetector() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice && isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

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
    <path d="M21 7a6 6 0 0 1-8.9 5.3L6 18.4a2 2 0 0 1-2.8-2.8l6.1-6.1A6 6 0 0 1 21 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="7" r="0.5" fill="currentColor" />
  </svg>
);

const IconPaper = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-2" aria-hidden>
    <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M15 3v5h5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 13h8M8 17h8M8 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function Hub() {
  const { theme, isTransitioning } = useTheme();
  const GREY = theme === 'dark' ? "#1D2E2F" : "#595758";
  const isMobile = useMobileDetector();

  // Header marquee
  const phrases = ["What is a react?", "I wrote this website with ChatGPT", "Get off my lawn", "8NEC was here", "f6ac78b8-fb2f-48e3-9703-b11f2365f1e3"];
  const [text, setText] = useState(phrases[0]);
  const [availableWidth, setAvailableWidth] = useState(0);
  const headerRef = useRef(null);
  const themeToggleRef = useRef(null);

  useEffect(() => setText(phrases[Math.floor(Math.random() * phrases.length)]), []);
  
  // Minimum width where marquee is still viable (absolute minimum with safety margin)
  const MIN_MARQUEE_WIDTH = 80; // Minimum width for readable marquee text
  const [showMarquee, setShowMarquee] = useState(true);

  // Calculate available space for marquee
  useEffect(() => {
    const updateAvailableWidth = () => {
      if (headerRef.current && themeToggleRef.current) {
        const headerBounds = headerRef.current.getBoundingClientRect();
        const toggleBounds = themeToggleRef.current.getBoundingClientRect();
        const titleWidth = 82; // Measured minimum width for "My Hub"
        const padding = 16; // Minimum safe padding
        const available = toggleBounds.left - (headerBounds.left + titleWidth) - padding;
        
        // Update available width and visibility
        setAvailableWidth(available);
        setShowMarquee(available >= MIN_MARQUEE_WIDTH);
      }
    };

    updateAvailableWidth();
    window.addEventListener('resize', updateAvailableWidth);
    return () => window.removeEventListener('resize', updateAvailableWidth);
  }, []);

  const { ref: bandRef, bandW, containerW } = useMarquee(text, 48, 24);
  // Adjust speed based on available width to maintain smooth animation
  const dur = Math.max(4, Math.min(8, Math.round((bandW || 0) / Math.max(90, availableWidth / 4))));

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
      <ThemeTransition isChanging={isTransitioning} />
      {/* HEADER */}
      <header className="relative overflow-hidden shadow-md">
        <div className="absolute inset-0 header-gradient" aria-hidden />
        <div className="relative z-10 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center max-w-full" ref={headerRef}>
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <div className={`inline-flex items-center rounded-xl bg-black/60 transition-all duration-200 ${
                  showMarquee 
                    ? 'gap-1.5 sm:gap-4 p-1.5 sm:p-3' 
                    : 'py-1.5 px-2 sm:py-3 sm:px-3'
                }`}>
                <h1 className="whitespace-nowrap text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight leading-none">My Hub</h1>
                {showMarquee && (
                  <div 
                    className="overflow-hidden rounded-md h-7 sm:h-8 transition-all duration-200"
                    style={{ 
                      width: Math.min(containerW || 0, availableWidth) + 'px',
                      maxWidth: '100%',
                      opacity: availableWidth < MIN_MARQUEE_WIDTH * 1.05 ? 0 : 1 // Fade out with smaller buffer
                    }}
                  >
                    <div
                      className="marquee-track flex items-center will-change-transform text-base sm:text-lg font-extrabold tracking-tight"
                      style={{ 
                        width: "max-content", 
                        animation: bandW ? `marquee ${dur}s linear infinite` : "none",
                        ["--bandW"]: `${bandW}px`
                      }}
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
                )}
              </div>
            </div>
            <div className="ml-4 shrink-0" ref={themeToggleRef}>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <section className="relative flex-1 pl-6 pr-6 sm:pl-8 sm:pr-8 py-6 overflow-x-clip">
        <div className="w-full max-w-xl">
          <HubCard
            title="Portfolio"
            description="I / Me / Myself"
            icon={IconBriefcase}
            overlayColor={theme === 'dark' ? "#9E2A2B" : "#ffc2c2ff"}
            bgImage="/HubCardImages/Portfolio.png"
            onClick={openPortfolio}
            fadeMaskStyle={fadeMask}
          />

          {/* Projects picker */}
          <EntryPicker
            title="Projects"
            icon={IconWrench}
            overlayColor={theme === 'dark' ? "#D9843F" : "#e6dea7ff"}
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
            overlayColor={theme === 'dark' ? "#D0CA92" : "#6fe1fdff"}
            bgImage="HubCardImages/Blog.png"
            items={blogIndex || []}
            isOpen={blogOpen}
            onToggle={() => setBlogOpen((v) => !v)}
            onOpen={(entry) => openEntryInPanel("blog", entry)}
            activeId={panelKey === "blog" ? activeEntry?.id : null}
            fadeMaskStyle={fadeMask}
          />
        </div>

        {/* Right-side panel: render while mounted so exit animation can run */}
        {side.mounted && (
          <SidePanel
            open={side.animIn}
            width={`${side.width}px`}
            onResizeStart={side.startResize}
            onExited={() => {
              side.close();  // Close the panel first
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
          <p>Updated: Aug.18.2025</p>
        </div>
      </footer>


    </main>
  );
}
