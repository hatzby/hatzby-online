"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

export default function CommentsWidget({ slug: slugOverride }) {
  const API = process.env.NEXT_PUBLIC_COMMENTS_API || "";
  const pathname = usePathname();

  // Make a per-page slug (safe for KV keys). You can also pass slug prop to override.
  const slug = useMemo(() => {
    if (slugOverride) return slugOverride;
    const p = (pathname || "/").replace(/[^a-zA-Z0-9/_-]/g, "_");
    const s = p === "/" ? "home" : p.replace(/\//g, "_").replace(/^_+|_+$/g, "");
    return s || "home";
  }, [pathname, slugOverride]);

  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState(null);

  async function load() {
    try {
      setErr(null);
      const res = await fetch(`${API}/?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
      setItems((await res.json()) || []);
    } catch {
      setErr("Could not load comments.");
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`${API}/?slug=${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, text }),
      });
      if (!res.ok) throw new Error();
      setText("");
      load();
    } catch {
      setErr("Failed to post comment.");
    } finally {
      setPosting(false);
    }
  }

  useEffect(() => { if (API) load(); }, [API, slug]);

  return (
    <section className="mt-10 space-y-4">
      <h2 className="text-xl font-semibold">Comments</h2>

      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 p-2"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 p-2 h-28"
          placeholder="Say something…"
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="rounded-xl bg-black text-white px-4 py-2 disabled:opacity-50"
          disabled={posting}
        >
          {posting ? "Posting…" : "Post comment"}
        </button>
        {err && <p className="text-red-600">{err}</p>}
      </form>

      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="text-gray-600">No comments yet.</li>
        ) : (
          items.map((c) => (
            <li key={c.id} className="rounded-xl border bg-white p-3">
              <div className="text-sm text-gray-600">
                <strong className="text-gray-900">{c.name || "Anonymous"}</strong>{" "}
                · {new Date(c.ts).toLocaleString()}
              </div>
              <div className="whitespace-pre-wrap break-words mt-1">{c.text}</div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}