"use client";

export const meta = {
  title: "",
  description: "",
  date: "2025-08-17",
  tags: ["portfolio", "work", "showcase"],
};

import { useMemo, useState, useCallback } from "react";
import PanelLightbox from "../../components/PanelLightbox"; // adjust if your path differs

/** Fixed-height, horizontally scrollable thumbnail row */
function GalleryRow({ images, height = 140, onOpen }) {
  // Sort by filename A→Z for predictability
  const sorted = useMemo(() => {
    return [...(images || [])].sort((a, b) => a.localeCompare(b));
  }, [images]);

  return (
    <div
      className="relative w-full overflow-x-auto"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="flex gap-2 items-stretch min-w-0">
        {sorted.map((src, i) => (
          <button
            key={src}
            onClick={() => onOpen(i, sorted)}
            className="relative flex-shrink-0 rounded overflow-hidden bg-[#2b2b2b]"
            style={{
              height,
              width: Math.round((height * 20) / 14), // aspect ~20:14 like your samples
            }}
            title="Open image"
          >
            {/* Plain img is fine in the panel; avoids layout thrash on resize */}
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              draggable={false}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Simple section with consistent divider that matches the panel grey */
function Section({ title, children }) {
  return (
    <section className="pb-6 border-b border-[#595758] last:border-b-0">
      {title && <h2 className="text-xl font-semibold mb-2">{title}</h2>}
      <div className="text-sm leading-relaxed">{children}</div>
    </section>
  );
}

export default function PortfolioPanel() {
  const skills = useMemo(
    () => [
      "Hardsurface Modelling","Texturing","Character Art",
      "Asset Optimization","Rendering","Retopology",
      "Highpoly Mesh Creation (Subd & Remesh)"
    ],
    []
  );

  const toolsMain = ["Blender","Adobe Substance 3D Painter","Paint.NET","Adobe Photoshop"];
  const toolsLess = ["Adobe Substance Sampler","Adobe Illustrator","GAEA","Marvelous Designer 10","ZBrush 2021","Marmoset Toolbag 4","Plasticity3D"];

  const experience = [
    {
      title: "8NEC, Naramo Nuclear Power Plant / The Noobic Stratocracy | Senior Developer/Artist | Jul 2025 – Present",
      body:
        "Work mostly focuses on low-poly untextured assets, optimization/recreation. Some of my work currently implemented includes DOE morphs in Naramo Nuclear Power Plant (UGC-ready), and formal UGC items uploaded under 6NLA.",
      images: [], // ensure these exist under /public
    },
    {
      title: "ConX Studios, CL Facility Roleplay | Contract Artist | Dec 2024 – Present",
      body:
        "Introduced texturing and remodeling techniques that helped in remaking legacy assets and raised visual quality for remade and newly made assets. (Work still confidential.)",
      images: [], // Add paths here when you can share
    },
  ];

  // Lightbox state (shared across all rows)
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const [lbSlides, setLbSlides] = useState([]);

  const openLightbox = useCallback((index, sources) => {
    setLbSlides(sources.map((src) => ({ src })));
    setLbIndex(index);
    setLbOpen(true);
  }, []);

  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="mb-1">{meta.title}</h1>
      <p className="mt-0 opacity-80">{meta.description}</p>

      <div className="mt-4 grid gap-6">
        {/* About */}
        <Section title="About Me">
          <p>
            I am a Game Artist who has worked in and out of Studios on Roblox primarily for 4 years.
            I primarily do hardsurface modelling and character art (organics excluded) and mostly
            jump from gig to gig as a freelancer.
          </p>
        </Section>

        {/* Skills / Tools */}
        <Section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-base font-semibold mb-2">Skills</h3>
              <ul className="list-disc list-inside space-y-1">
                {skills.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-2">Main Tools</h3>
              <ul className="list-disc list-inside space-y-1">
                {toolsMain.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-2">Less Frequent Tools</h3>
              <ul className="list-disc list-inside space-y-1">
                {toolsLess.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
          </div>
        </Section>

        {/* Experience */}
        <Section title="Experience">
          <div className="space-y-6">
            {experience.map((e) => (
              <div key={e.title}>
                <h4 className="text-base font-semibold mb-1">{e.title}</h4>
                <p className="text-sm">{e.body}</p>

                {!!e.images?.length && (
                  <div className="mt-3">
                    {/* Horizontal, fixed-height strip with its own scrollbar */}
                    <GalleryRow images={e.images} height={140} onOpen={openLightbox} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* Closing note */}
        <Section>
          <p>
            Most of my work is under NDA or cannot be shown for privacy reasons, please reach out
            in private for more of my work, thanks.
          </p>
        </Section>
      </div>

      {/* Lightbox overlay */}
      <PanelLightbox
        slides={lbSlides}
        open={lbOpen}
        index={lbIndex}
        onClose={() => setLbOpen(false)}
      />
    </div>
  );
}