"use client";

export default function HubCard({
  title,
  description, // renamed from desc to match other components
  href,              // optional
  onClick,           // optional
  color = "#bf5b5b",
  overlayColor,
  bgImage,
  icon,
  fadeMaskStyle,
  isOpen,  // for EntryPicker dropdown arrow
}) {
  const baseClass =
    // block + w-full keeps identical width/flow across tags
    "relative block w-full rounded-xl p-4 mb-3 overflow-hidden " +
    "bg-[var(--card-bg)] text-white " +  // force white text for all cards
    "transition hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(0,0,0,0.18)] " +
    "text-left";

  const interactiveFocus =
    // consistent focus look (works for both <a> and <button>)
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

  const clickable =
    // consistent pointer cursor for interactive variants
    "cursor-pointer";

  const inner = (
    <>
      {/* Right-half background (image + tint + fade) */}
      <div
        className="absolute top-0 right-0 h-full w-1/2 z-0"
        style={{
          backgroundColor: overlayColor || color, // fallback if image missing
          backgroundImage: bgImage
            ? `linear-gradient(${overlayColor || color}, ${overlayColor || color}), url(${bgImage})`
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
      <div className="relative z-10">
        <div className="flex items-center justify-between text-lg sm:text-xl font-semibold">
          <span className="flex items-center gap-2">
            {icon ? <span aria-hidden className="inline-flex">{icon}</span> : null}
            {title}
          </span>
          {typeof isOpen === 'boolean' && (
            <span aria-hidden className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
          )}
        </div>
        <p className="mt-1 text-sm opacity-90">{description}</p>
      </div>
    </>
  );

  // Prefer button when onClick is provided
  if (typeof onClick === "function") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClass} ${clickable} ${interactiveFocus} appearance-none border-0`}
        aria-label={title}
      >
        {inner}
      </button>
    );
  }

  // Otherwise render a link if href is provided
  if (href) {
    return (
      <a
        href={href}
        className={`${baseClass} ${clickable} ${interactiveFocus}`}
        aria-label={title}
      >
        {inner}
      </a>
    );
  }

  // Fallback: plain div (non-clickable, same sizing)
  return (
    <div className={baseClass} aria-label={title}>
      {inner}
    </div>
  );
}