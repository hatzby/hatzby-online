// lib/loadEntries.js
// Webpack-friendly loader (Next.js). No "use client" here.

function makeSlug(path, kind) {
  // Example key: "./vehicle-sim/index.tsx" or "./vehicle-sim.tsx"
  // We want "vehicle-sim"
  const withoutDots = path.replace(/^\.\//, "");         // "vehicle-sim/index.tsx"
  const parts = withoutDots.split("/");
  // pattern supports either folder/index or single file
  if (parts.length >= 2 && parts[1].startsWith("index.")) {
    return parts[0]; // folder name
  }
  const file = parts[parts.length - 1];                  // e.g. "vehicle-sim.tsx"
  return file.replace(/\.(tsx|jsx|mdx|ts|js)$/, "");
}

function indexFrom(ctx, kind) {
  // ctx is a Webpack require.context
  // We expect each module to optionally export `meta` and default component
  const items = ctx.keys().map((key) => {
    const mod = ctx(key);
    const meta = mod.meta || { title: makeSlug(key, kind) };
    const slug = makeSlug(key, kind);

    // Build a lazy "loader" to match the previous API
    // Note: require.context is sync, but we wrap in Promise to keep the same shape.
    const loader = async () => mod;

    return {
      id: `${kind}:${slug}`,
      slug,
      meta,
      loader,
    };
  });

  // sort by date desc if present, else by title
  items.sort((a, b) => {
    const da = a.meta?.date ? +new Date(a.meta.date) : 0;
    const db = b.meta?.date ? +new Date(b.meta.date) : 0;
    if (db !== da) return db - da;
    return (a.meta?.title || "").localeCompare(b.meta?.title || "");
  });

  return items;
}

// ---- Projects ----
// Accept either:
//
//   entries/projects/<slug>/index.(tsx|jsx|mdx)
//   entries/projects/<slug>.(tsx|jsx|mdx)
//
// Add/remove extensions as you need.
const projectsCtx = require.context(
  "../entries/projects",
  true,
  /(^\.\/[^/]+\.(tsx|jsx|mdx|ts|js)$)|(^\.\/[^/]+\/index\.(tsx|jsx|mdx|ts|js)$)/
);

// ---- Blog ----
const blogCtx = require.context(
  "../entries/blogs",
  true,
  /(^\.\/[^/]+\.(tsx|jsx|mdx|ts|js)$)|(^\.\/[^/]+\/index\.(tsx|jsx|mdx|ts|js)$)/
);

export const projectIndex = indexFrom(projectsCtx, "project");
export const blogIndex = indexFrom(blogCtx, "blog");