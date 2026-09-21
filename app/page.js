"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { slugify } from "./lib/slug";

const STORAGE_KEY = "mc_my_calendar_v1";
const DEFAULT_FILTERS = { type: "All", category: "All" };

const UPCOMING_FEATURES = [
  { icon: "🎟️", title: "Ticketing & payments", desc: "Sell tickets right on the event page, with promo codes and door pricing." },
  { icon: "🔗", title: "Referral tracking", desc: "Give organizers and partners their own link and see who they bring in." },
  { icon: "📰", title: "Newsletter engine", desc: "Send a weekly digest of what's happening, straight from your calendar." },
  { icon: "📇", title: "QR check-in", desc: "Scan attendees in at the door instead of a paper sign-in sheet." },
];

function SuperCalendarInner() {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") || "").toLowerCase();

  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState({});
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    fetch("/api/events").then((r) => r.json()).then(setEvents);
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    setSelected(saved);
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(events.map((e) => e.category))],
    [events]
  );

  const filtered = events.filter((e) => {
    if (filters.type !== "All" && e.type !== filters.type) return false;
    if (filters.category !== "All" && e.category !== filters.category) return false;
    if (q && !e.title.toLowerCase().includes(q)) return false;
    return true;
  });

  const activeFilters = [];
  if (filters.type !== "All") activeFilters.push({ key: "type", label: `Type: ${filters.type}` });
  if (filters.category !== "All") activeFilters.push({ key: "category", label: `Category: ${filters.category}` });
  if (q) activeFilters.push({ key: "q", label: `Search: "${q}"` });

  function clearFilter(key) {
    if (key === "q") {
      window.history.replaceState({}, "", "/");
      window.location.reload();
      return;
    }
    setFilters((f) => ({ ...f, [key]: "All" }));
  }

  function clearAllFilters() {
    setFilters(DEFAULT_FILTERS);
    if (q) {
      window.history.replaceState({}, "", "/");
      window.location.reload();
    }
  }

  function toggle(id) {
    const next = { ...selected, [id]: !selected[id] };
    setSelected(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <span className="hero-eyebrow">Bay Area · Networking &amp; Events</span>
          <h1>Every event worth going to, in one calendar.</h1>
          <p>
            Browse what's happening around the Bay, save the ones you care
            about to your own calendar, and list your own event in under a
            minute — free.
          </p>
          <div className="hero-actions">
            <a href="/submit" className="btn-primary">+ Create Your First Event</a>
            <a href="#browse" className="btn-ghost">Browse Events ↓</a>
          </div>
        </div>
      </section>

      <div className="page" id="browse">
        <div className="hint">
          Prototype: no accounts yet — "My Calendar" selections are saved to this
          browser only, to demonstrate the flow described in the spec.
        </div>

        {activeFilters.length > 0 && (
          <div className="active-filters">
            <span className="active-filters-label">Filtering by:</span>
            {activeFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                className="filter-chip"
                onClick={() => clearFilter(f.key)}
                title="Click to remove this filter"
              >
                {f.label} ✕
              </button>
            ))}
            <button type="button" className="clear-filters-btn" onClick={clearAllFilters}>
              Clear filters
            </button>
          </div>
        )}

        <div className="layout-with-sidebar">
          <aside className="sidebar">
            <h4>Type</h4>
            {["All", "In Person", "Online"].map((t) => (
              <label key={t}>
                <input
                  type="radio"
                  name="type"
                  checked={filters.type === t}
                  onChange={() => setFilters((f) => ({ ...f, type: t }))}
                />{" "}
                {t}
              </label>
            ))}
            <h4 style={{ marginTop: 16 }}>Category</h4>
            {categories.map((c) => (
              <label key={c}>
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === c}
                  onChange={() => setFilters((f) => ({ ...f, category: c }))}
                />{" "}
                {c}
              </label>
            ))}
          </aside>

          <div className="event-list">
            {filtered.length === 0 && (
              <div className="empty-state">
                No events match these filters.
                {activeFilters.length > 0 && (
                  <>
                    {" "}
                    <button type="button" className="clear-filters-link" onClick={clearAllFilters}>
                      Clear filters
                    </button>{" "}
                    to see everything.
                  </>
                )}
              </div>
            )}
            {filtered.map((e) => (
              <div
                key={e.id}
                className={`event-card ${e.premier ? "premier" : ""} ${
                  selected[e.id] ? "selected" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!selected[e.id]}
                  onChange={() => toggle(e.id)}
                />
                <div className="meta">
                  <div className="title">
                    <a href={`/event/${e.id}`} className="title-link">{e.title}</a>{" "}
                    {e.premier && <span className="badge">PREMIER</span>}
                  </div>
                  <div className="sub">
                    {e.date} · {e.time} · {e.city} · Hosted by{" "}
                    <a href={`/organizer/${slugify(e.hostedBy)}`} className="host-link">
                      {e.hostedBy}
                    </a>
                  </div>
                </div>
                <div className="sub">{e.cost}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="feature-strip">
        <h2>More on the way</h2>
        <p className="feature-sub">Part of the full spec — not built in this prototype yet.</p>
        <div className="feature-grid">
          {UPCOMING_FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <span className="coming-soon-tag">Coming soon</span>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default function SuperCalendar() {
  return (
    <Suspense fallback={null}>
      <SuperCalendarInner />
    </Suspense>
  );
}
