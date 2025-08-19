"use client";

import { useEffect, useMemo, useState } from "react";
import "../globals.css";

/**
 * Comments Test Page (App Router, JSX)
 * - Switch between Live and Local Worker from the UI.
 * - Local admin token is built-in and only sent when target === "local".
 * - Live admin token is typed manually (never stored or shipped).
 */

const DEFAULT_LOCAL_API = "http://127.0.0.1:8787";
const LIVE_API_FROM_ENV = "https://comments.not05nirvana.workers.dev/"
const LOCAL_ADMIN_TOKEN = "HADZIDAKIS_IS_GAY"; // <-- set your local Worker ADMIN_TOKEN to this

function readSavedTarget() {
  if (typeof window === "undefined") return "live";
  return localStorage.getItem("COMMENTS_API_TARGET") || "live";
}
function readSavedOverride() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("COMMENTS_API_OVERRIDE");
}

function readSavedTripPassword() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("COMMENTS_TRIPCODE_PASSWORD") || "";
}

function saveTripPassword(value) {
  if (typeof window === "undefined") return;
  localStorage.setItem("COMMENTS_TRIPCODE_PASSWORD", value);
}

function removeTripPassword() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("COMMENTS_TRIPCODE_PASSWORD");
}

// Helper function to convert URLs in text to clickable links
function parseLinksInText(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

// Helper function to render tripcode display with backwards compatibility
function renderTripcode(comment) {
  // Handle author role (highest priority)
  if (comment.role === "author") {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
        Author
      </span>
    );
  }

  // Handle tripcode display based on tripType (new system) or fallback (legacy)
  const tripType = comment.tripType || "legacy"; // Default to "legacy" for old comments without tripType
  
  if (comment.trip) {
    switch (tripType) {
      case "user":
        return (
          <span className="font-mono text-sm text-blue-600" title="User tripcode">
            !{comment.trip}
          </span>
        );
      case "legacy":
        return (
          <span className="font-mono text-sm text-gray-500 italic" title="Legacy tripcode">
            !{comment.trip} (legacy)
          </span>
        );
      case "author":
        // This case should be handled by role check above, but included for completeness
        return (
          <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
            Author
          </span>
        );
      default:
        // Fallback for unknown tripType - still show trip if it exists
        return (
          <span className="font-mono text-sm text-gray-600" title="Tripcode">
            !{comment.trip}
          </span>
        );
    }
  } else {
    // No tripcode present
    if (tripType === "none" || !comment.hasOwnProperty('tripType')) {
      // New comments without tripcode or old comments without tripType field
      if (!comment.hasOwnProperty('tripType')) {
        // Old comment without tripType field - mark as LEGACY
        return (
          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
            LEGACY
          </span>
        );
      } else {
        // New comment without tripcode - mark as "No tripcode"
        return (
          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-50 text-gray-500">
            No tripcode
          </span>
        );
      }
    }
  }

  // Fallback - no display
  return null;
}

export default function CommentsTestPage() {
  // Target: "live" or "local"
  const [target, setTarget] = useState(readSavedTarget());
  const [override, setOverride] = useState(readSavedOverride()); // manual URL override if you ever want it
  const API = useMemo(() => {
    if (override) return override;
    return target === "local" ? DEFAULT_LOCAL_API : (LIVE_API_FROM_ENV || DEFAULT_LOCAL_API);
  }, [target, override]);

  const slug = "test-page";

  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const [tripPassword, setTripPassword] = useState(""); // temp input for setting tripcode
  const [persistentTripPassword, setPersistentTripPassword] = useState(""); // saved tripcode
  const [showTripPassword, setShowTripPassword] = useState(false);
  const [showSetTripPassword, setShowSetTripPassword] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [postAsAuthor, setPostAsAuthor] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
    nextOffset: null
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingSorting, setLoadingSorting] = useState(false);

  // Search and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState(""); // The actual applied search
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"

  // Admin tokens
  const [liveAdminToken, setLiveAdminToken] = useState(""); // typed manually for live
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // API switching state
  const [switchingAPI, setSwitchingAPI] = useState(false);
  const [lastSwitchTime, setLastSwitchTime] = useState(0);
  const SWITCH_COOLDOWN = 1000; // 1 second cooldown

  // Filter and sort comments
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;

    // Apply search filter
    if (activeSearchQuery.trim()) {
      const query = activeSearchQuery.toLowerCase();
      filtered = items.filter(item =>
        (item.name || "").toLowerCase().includes(query) ||
        item.text.toLowerCase().includes(query)
      );
    }
    
    // Always apply sorting (both when searching and when not searching)
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.ts);
      const dateB = new Date(b.ts);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
    
    return sorted;
  }, [items, activeSearchQuery, sortOrder]);

  // Comments to display (limited by pagination when not searching)
  const displayedComments = useMemo(() => {
    if (activeSearchQuery.trim()) {
      // When searching, show all filtered results
      return filteredAndSortedItems;
    } else {
      // When not searching, limit to what should be shown based on pagination
      // Use the smaller of: current items length OR what pagination says we should show
      const shouldShow = Math.min(items.length, pagination.offset + pagination.limit);
      return filteredAndSortedItems.slice(0, shouldShow);
    }
  }, [filteredAndSortedItems, activeSearchQuery, pagination.limit, pagination.offset, items.length]);

  // Persist target & override
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("COMMENTS_API_TARGET", target);
    if (override) localStorage.setItem("COMMENTS_API_OVERRIDE", override);
    else localStorage.removeItem("COMMENTS_API_OVERRIDE");
  }, [target, override]);

  function handlePageSizeChange(newLimit) {
    setPagination(prev => ({ ...prev, limit: newLimit, offset: 0 }));
    // Use the new limit immediately without waiting for state update
    loadWithLimit(newLimit);
  }

  async function loadWithLimit(limit) {
    setErr(null);
    try {
      const res = await fetch(
        `${API}/?slug=${encodeURIComponent(slug)}&limit=${limit}&offset=0`, 
        { cache: "no-store" }
      );
      const json = await res.json();
      
      if (Array.isArray(json)) {
        setItems(json);
        setPagination(prev => ({
          ...prev,
          limit: limit,
          offset: 0,
          total: json.length,
          hasMore: false,
          nextOffset: null
        }));
      } else {
        setItems(json.comments || []);
        setPagination({
          total: json.pagination?.total || 0,
          limit: json.pagination?.limit || limit,
          offset: json.pagination?.offset || 0,
          hasMore: json.pagination?.hasMore || false,
          nextOffset: json.pagination?.nextOffset || null
        });
      }
    } catch {
      setErr("Failed to load comments");
    }
  }

  async function load(resetPagination = true) {
    return loadFromAPI(API, resetPagination);
  }

  async function loadAllComments() {
    // Load all comments for sorting/searching, but reset pagination to show only first page
    setErr(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({
        slug: slug,
        limit: "1000", // High limit to get all comments
        offset: "0"
      });
      
      if (sortOrder) {
        params.set('sort', sortOrder);
      }
      
      const res = await fetch(
        `${API}/?${params.toString()}`, 
        { cache: "no-store" }
      );
      const json = await res.json();
      
      if (Array.isArray(json)) {
        setItems(json);
        setPagination(prev => ({
          total: json.length,
          limit: prev.limit, // Keep original page size
          offset: 0, // Reset to first page
          hasMore: json.length > prev.limit, // More than one page worth?
          nextOffset: prev.limit
        }));
      } else {
        const allComments = json.comments || [];
        setItems(allComments);
        setPagination(prev => ({
          total: json.pagination?.total || allComments.length,
          limit: prev.limit, // Keep original page size
          offset: 0, // Reset to first page
          hasMore: (json.pagination?.total || allComments.length) > prev.limit, // More than one page worth?
          nextOffset: prev.limit
        }));
      }
    } catch {
      setErr("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!pagination.hasMore || loadingMore) return;
    
    setLoadingMore(true);
    setLoading(true); // Show main loading animation
    try {
      const res = await fetch(
        `${API}/?slug=${encodeURIComponent(slug)}&limit=${pagination.limit}&offset=${pagination.nextOffset}`,
        { cache: "no-store" }
      );
      const json = await res.json();
      
      if (Array.isArray(json)) {
        // Old format fallback - append new comments
        const newComments = json.filter(newComment => 
          !items.some(existingComment => existingComment.id === newComment.id)
        );
        setItems(prev => [...prev, ...newComments]);
        setPagination(prev => ({ ...prev, hasMore: false }));
      } else {
        // New format - append new comments, avoiding duplicates
        const newComments = (json.comments || []).filter(newComment => 
          !items.some(existingComment => existingComment.id === newComment.id)
        );
        setItems(prev => [...prev, ...newComments]);
        setPagination({
          total: json.pagination?.total || 0,
          limit: json.pagination?.limit || 10,
          offset: json.pagination?.offset || 0,
          hasMore: json.pagination?.hasMore || false,
          nextOffset: json.pagination?.nextOffset || null
        });
      }
      
      // Add a short delay for smooth UX
      setTimeout(() => {
        setLoading(false);
        setLoadingMore(false);
      }, 500);
    } catch {
      setErr("Failed to load more comments");
      setLoading(false);
      setLoadingMore(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      // Build headers
      const headers = { "content-type": "application/json" };
      // Only send an admin token if posting as author:
      if (postAsAuthor) {
        if (target === "local") {
          // Use built-in local token
          headers["Authorization"] = `${LOCAL_ADMIN_TOKEN}`;
        } else if (liveAdminToken) {
          // Use manually entered live token
          headers["Authorization"] = `${liveAdminToken}`;
        }
      }

      const res = await fetch(`${API}/?slug=${encodeURIComponent(slug)}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          name, 
          text, 
          hp,
          tripPassword: persistentTripPassword || undefined // Use persistent tripcode password
        })
      });
      if (!res.ok) throw new Error();
      setText("");
      // Don't clear tripcode password anymore - it's persistent
      await loadAllComments(); // Load all comments after posting
    } catch {
      setErr("Failed to post comment");
    } finally {
      setLoading(false);
    }
  }

  async function del(id) {
    try {
      const headers = {};
      // Deleting is always admin-only: use local token when target=local, else the live token you typed
      if (target === "local") {
        headers["Authorization"] = `${LOCAL_ADMIN_TOKEN}`;
      } else if (liveAdminToken) {
        headers["Authorization"] = `${liveAdminToken}`;
      } else {
        alert("Enter your live admin token to delete on Live, or switch to Local.");
        return;
      }
      const res = await fetch(`${API}/?slug=${encodeURIComponent(slug)}&id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers
      });
      if (!res.ok) throw new Error();
      await loadAllComments(); // Load all comments after deleting
    } catch {
      alert("Delete failed");
    }
  }

  async function handleSearch() {
    setActiveSearchQuery(searchQuery);
    // Load all comments to ensure search works across all data
    if (searchQuery.trim()) {
      await loadAllComments();
    }
  }

  function clearSearch() {
    setSearchQuery("");
    setActiveSearchQuery("");
  }

  async function switchTarget(newTarget) {
    const now = Date.now();
    if (now - lastSwitchTime < SWITCH_COOLDOWN || switchingAPI) {
      return; // Still in cooldown or already switching
    }

    setLastSwitchTime(now);
    setSwitchingAPI(true);
    
    try {
      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 300));
      setTarget(newTarget);
      // Reset pagination when switching APIs
      setPagination(prev => ({ ...prev, limit: 10, offset: 0 }));
      
      // Calculate the new API URL directly instead of relying on state
      const newAPI = override || (newTarget === "local" ? DEFAULT_LOCAL_API : (LIVE_API_FROM_ENV || DEFAULT_LOCAL_API));
      await loadFromAPI(newAPI, true);
    } finally {
      setSwitchingAPI(false);
    }
  }

  async function loadFromAPI(apiUrl, resetPagination = true) {
    setErr(null);
    setLoading(true);
    try {
      const currentPagination = resetPagination ? { limit: 10, offset: 0 } : pagination;
      const offset = currentPagination.offset;
      const limit = currentPagination.limit;
      
      // Build query parameters
      const params = new URLSearchParams({
        slug: slug,
        limit: limit.toString(),
        offset: offset.toString()
      });
      
      // Add sort parameter if the API supports it (for future compatibility)
      if (sortOrder) {
        params.set('sort', sortOrder);
      }
      
      const res = await fetch(
        `${apiUrl}/?${params.toString()}`, 
        { cache: "no-store" }
      );
      const json = await res.json();
      
      // Handle both old format (array) and new format (object with comments/pagination)
      if (Array.isArray(json)) {
        // Old format - fallback
        if (resetPagination) {
          setItems(json);
        } else {
          const newComments = json.filter(newComment => 
            !items.some(existingComment => existingComment.id === newComment.id)
          );
          setItems(prev => [...prev, ...newComments]);
        }
        setPagination(prev => ({
          ...prev,
          total: json.length,
          hasMore: false,
          nextOffset: null
        }));
      } else {
        // New format with pagination
        if (resetPagination) {
          setItems(json.comments || []);
        } else {
          const newComments = (json.comments || []).filter(newComment => 
            !items.some(existingComment => existingComment.id === newComment.id)
          );
          setItems(prev => [...prev, ...newComments]);
        }
        setPagination({
          total: json.pagination?.total || 0,
          limit: json.pagination?.limit || limit,
          offset: json.pagination?.offset || offset,
          hasMore: json.pagination?.hasMore || false,
          nextOffset: json.pagination?.nextOffset || null
        });
      }
    } catch {
      setErr("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Load all comments on initial mount to ensure proper sorting
    loadAllComments();
    // Load saved tripcode password
    setPersistentTripPassword(readSavedTripPassword());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Handle manual override changes (but not target changes)
  useEffect(() => {
    if (!switchingAPI && override !== readSavedOverride()) {
      loadAllComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [override]);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-2xl p-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">Comments Test</h1>

          {/* Target switch */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Target:</span>
            <button
              type="button"
              onClick={() => switchTarget("live")}
              disabled={switchingAPI}
              className={`px-3 py-1 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed ${
                target === "live" ? "bg-black text-white" : "bg-white"
              }`}
              title="Use Live Worker"
            >
              {switchingAPI && target !== "live" ? "Switching..." : "Live"}
            </button>
            <button
              type="button"
              onClick={() => switchTarget("local")}
              disabled={switchingAPI}
              className={`px-3 py-1 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed ${
                target === "local" ? "bg-black text-white" : "bg-white"
              }`}
              title="Use Local Worker"
            >
              {switchingAPI && target !== "local" ? "Switching..." : "Local"}
            </button>

            {switchingAPI && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                <span>Loading...</span>
              </div>
            )}

            <span className="ml-2 text-sm text-gray-600">
              API:&nbsp;<code className="text-gray-800">{API}</code>
            </span>
          </div>

          {/* Optional manual override URL */}
          <div className="flex items-center gap-2">
            <input
              className="flex-1 min-w-[220px] rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 p-2"
              placeholder="(Optional) Manual API override (paste full URL)"
              value={override || ""}
              onChange={(e) => setOverride(e.target.value || null)}
            />
            <button
              className="rounded-xl border px-3 py-2"
              type="button"
              onClick={load}
              title="Refresh"
            >
              Refresh
            </button>
          </div>

          {target === "live" ? (
            <p className="text-xs text-gray-500">
              Live admin token is not stored. Paste it below only when you need to post as Author/delete on Live.
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              Local uses built-in token <code>{LOCAL_ADMIN_TOKEN}</code>. Make sure your local Worker’s ADMIN_TOKEN matches.
            </p>
          )}
        </header>

        {/* Form */}
        <form onSubmit={submit} className="space-y-3">
          {/* Honeypot (hidden) */}
          <input
            className="hidden"
            autoComplete="off"
            tabIndex="-1"
            aria-hidden="true"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            placeholder="Leave this empty"
          />

          <input
            className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 p-2"
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="relative">
            <textarea
              className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 p-2 h-28"
              placeholder="Say something…"
              required
              value={text}
              maxLength={600}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="absolute bottom-2 right-3 text-xs text-gray-500 bg-white px-1">
              {text.length}/600
            </div>
          </div>
          <div className="relative">
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 p-2"
                type={showSetTripPassword ? "text" : "password"}
                placeholder="Set tripcode password (Generates optional unique hash)"
                value={tripPassword}
                onChange={(e) => setTripPassword(e.target.value)}
                title="Set a persistent tripcode password"
              />
              <button
                type="button"
                onClick={() => setShowSetTripPassword(!showSetTripPassword)}
                className="px-3 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                title={showSetTripPassword ? "Hide password" : "Show password"}
              >
                {showSetTripPassword ? "👁️‍🗨️" : "👁️"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (tripPassword.trim()) {
                    setPersistentTripPassword(tripPassword.trim());
                    saveTripPassword(tripPassword.trim());
                    setTripPassword("");
                    setShowSetTripPassword(false);
                  }
                }}
                disabled={!tripPassword.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Set tripcode password"
              >
                Set
              </button>
            </div>
            
            {/* Current tripcode status */}
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <span>Current tripcode:</span>
              <span className="font-mono">
                {persistentTripPassword ? (showTripPassword ? persistentTripPassword : "••••••••") : "none"}
              </span>
              {persistentTripPassword && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowTripPassword(!showTripPassword)}
                    className="text-blue-600 hover:underline"
                    title={showTripPassword ? "Hide password" : "Show password"}
                  >
                    {showTripPassword ? "👁️‍🗨️" : "👁️"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingRemove(true)}
                    className="text-red-600 hover:underline"
                    title="Remove tripcode password"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>

            {/* Confirmation dialog for removing tripcode */}
            {confirmingRemove && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-800 mb-2">Are you sure you want to remove your tripcode password?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPersistentTripPassword("");
                      removeTripPassword();
                      setConfirmingRemove(false);
                      setShowTripPassword(false);
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Yes, remove
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingRemove(false)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button className="rounded-xl bg-black text-white px-4 py-2 disabled:opacity-50" disabled={loading}>
              {loading ? "Posting…" : "Post comment"}
            </button>

            {/* Author toggles / tokens - only show for local or when live admin token is provided */}
            {(target === "local" || (target === "live" && liveAdminToken.trim())) && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={postAsAuthor}
                  onChange={(e) => setPostAsAuthor(e.target.checked)}
                />
                Post as Author
              </label>
            )}

            {target === "live" ? (
              <input
                className="flex-1 min-w-[220px] rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 p-2"
                type="password"
                placeholder="(Live only) Admin token"
                value={liveAdminToken}
                onChange={(e) => setLiveAdminToken(e.target.value)}
              />
            ) : null}
          </div>

          {err && <p className="text-red-600">{err}</p>}
        </form>

        {/* Comments */}
        <section className="space-y-3 relative min-h-[400px]">
          {/* Loading overlay when switching APIs */}
          {switchingAPI && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center z-20 rounded-xl">
              <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-lg">
                <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                <span className="text-gray-700 font-medium">Switching API...</span>
              </div>
            </div>
          )}

          {/* Loading overlay when sorting or loading more */}
          {(loadingSorting || (loading && loadingMore)) && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center z-20 rounded-xl">
              <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-lg">
                <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                <span className="text-gray-700 font-medium">
                  {loadingSorting ? "Sorting..." : "Loading more..."}
                </span>
              </div>
            </div>
          )}

          {/* Initial loading screen */}
          {loading && !loadingMore && !loadingSorting && items.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-lg">
                <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                <span className="text-gray-700 font-medium">Loading comments...</span>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl font-semibold">Comments</h2>

            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search */}
              <form onSubmit={async (e) => { e.preventDefault(); await handleSearch(); }} className="flex gap-1">
                <input
                  className="rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 px-3 py-2 text-sm flex-1 min-w-0"
                  placeholder="Search comments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm whitespace-nowrap"
                  title="Search"
                >
                  Search
                </button>
                {activeSearchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="px-2 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 text-sm"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </form>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Sort:</span>
                <button
                  type="button"
                  onClick={async () => {
                    setLoadingSorting(true);
                    setSortOrder("newest");
                    if (!activeSearchQuery.trim()) {
                      // Load all comments when changing sort order
                      await loadAllComments();
                    }
                    // Add a short delay for smooth UX
                    setTimeout(() => setLoadingSorting(false), 500);
                  }}
                  className={`px-3 py-1 rounded-lg border text-sm ${sortOrder === "newest" ? "bg-black text-white" : "bg-white"
                    }`}
                  title="Newest first"
                >
                  Newest
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setLoadingSorting(true);
                    setSortOrder("oldest");
                    if (!activeSearchQuery.trim()) {
                      // Load all comments when changing sort order
                      await loadAllComments();
                    }
                    // Add a short delay for smooth UX
                    setTimeout(() => setLoadingSorting(false), 500);
                  }}
                  className={`px-3 py-1 rounded-lg border text-sm ${sortOrder === "oldest" ? "bg-black text-white" : "bg-white"
                    }`}
                  title="Oldest first"
                >
                  Oldest
                </button>
              </div>
            </div>
          </div>

          {/* Results count and pagination info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-600">
            <div>
              {activeSearchQuery.trim() ? (
                <span>
                  Found {filteredAndSortedItems.length} of {items.length} comments for "{activeSearchQuery}"
                  <button
                    onClick={clearSearch}
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    Clear search
                  </button>
                </span>
              ) : (
                <span>
                  Showing {items.length} of {pagination.total} comments
                </span>
              )}
            </div>
            
            {!activeSearchQuery.trim() && pagination.total > 0 && (
              <div className="flex items-center gap-2">
                <span>Page size:</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                  className="rounded border px-2 py-1 text-sm"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
            )}
          </div>

          <ul className="space-y-3">
            {displayedComments.map((c) => (
              <li key={c.id} className={`rounded-xl border bg-white p-3 ${c.role !== "visitor" ? "" : "bg-" + c.role.toLowerCase()}`}
              >
                <div className="text-sm text-gray-600 flex items-center justify-between">
                  <span className="flex flex-wrap items-center gap-2">
                    <strong className="text-gray-900">{c.name || "Anonymous"}</strong>
                    {renderTripcode(c)}
                    <span>· {new Date(c.ts).toLocaleString()}</span>
                  </span>

                  {/* Delete button - only show for local or when live admin token is provided */}
                  {(target === "local" || (target === "live" && liveAdminToken.trim())) && (
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => del(c.id)}
                      title="Delete comment"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className="whitespace-pre-wrap break-words mt-1">
                  {parseLinksInText(c.text)}
                </div>
              </li>
            ))}
            {filteredAndSortedItems.length === 0 && items.length === 0 && (
              <li className="text-gray-600">No comments yet. Be the first.</li>
            )}
            {filteredAndSortedItems.length === 0 && items.length > 0 && (
              <li className="text-gray-600">No comments match your search.</li>
            )}
          </ul>
          
          {/* Load More button - only show when not searching, not sorting, and there are more comments */}
          {!activeSearchQuery.trim() && !loadingSorting && pagination.hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? "Loading..." : `Load More (${Math.max(0, pagination.total - displayedComments.length)} remaining)`}
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
