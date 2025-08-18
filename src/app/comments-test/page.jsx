"use client";

import { useEffect, useState } from "react";

export default function CommentsTestPage() {
  const API = process.env.NEXT_PUBLIC_COMMENTS_API || "http://127.0.0.1:8787";
  const slug = "test-page";

  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function load() {
    setErr(null);
    try {
      const res = await fetch(`${API}/?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
      const json = await res.json();
      setItems(Array.isArray(json) ? json : []);
    } catch {
      setErr("Failed to load comments");
    }
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${API}/?slug=${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, text })
      });
      if (!res.ok) throw new Error();
      setText("");
      await load();
    } catch {
      setErr("Failed to post comment");
    } finally {
      setLoading(false);
    }
  }

  async function del(id) {
    if (!adminToken) {
      alert("Enter admin token first (local-only test).");
      return;
    }
    try {
      const res = await fetch(`${API}/?slug=${encodeURIComponent(slug)}&id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      alert("Delete failed");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-2xl p-6 space-y-6">
        <h1 className="text-2xl font-bold">Comments Test (Local Only)</h1>

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
            disabled={loading}
          >
            {loading ? "Posting…" : "Post comment"}
          </button>
          {err && <p className="text-red-600">{err}</p>}
        </form>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              className="flex-1 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 p-2"
              type="password"
              placeholder="(Optional) Admin token for Delete"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
            />
            <button
              className="rounded-xl border px-3 py-2"
              type="button"
              onClick={load}
              title="Refresh comments"
            >
              Refresh
            </button>
          </div>

          <h2 className="text-xl font-semibold">Comments</h2>
          <ul className="space-y-3">
            {items.map((c) => (
              <li key={c.id} className="rounded-xl border bg-white p-3">
                <div className="text-sm text-gray-600 flex items-center justify-between">
                  <span>
                    <strong className="text-gray-900">{c.name || "Anonymous"}</strong> ·{" "}
                    {new Date(c.ts).toLocaleString()}
                  </span>
                  {adminToken ? (
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => del(c.id)}
                      title="Delete comment"
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
                <div className="whitespace-pre-wrap break-words mt-1">{c.text}</div>
              </li>
            ))}
            {items.length === 0 && (
              <li className="text-gray-600">No comments yet. Be the first.</li>
            )}
          </ul>
        </section>
      </div>
    </main>
  );
}