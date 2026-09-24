"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { slugify } from "./lib/slug";
import FilterPanel from "./components/FilterPanel";
import { EMPTY_FILTERS, matches, orderEvents, googleCalendarUrl } from "./lib/taxonomy";

const STORAGE_KEY = "mc_my_calendar_v1";
const FILTERS_KEY = "mc_current_filters_v1";
const PAGE_SIZE = 6; // max events per page — mix of Premier + Regular, per spec

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
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const today = useMemo(() => new Date(), []);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/events").then((r) => r.json()).then(setEvents);
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    setSelected(saved);
    try {
      const f = JSON.parse(localStorage.getItem(FILTERS_KEY) || "null");
      if (f) setFilters({ ...EMPTY_FILTERS, ...f });
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(FILTERS_KEY, JSON.stringify(filters)); } catch {}
  }, [filters]);

  const filtered = useMemo(
    () => events.filter((e) => matches(e, filters, today, null, q)),
    [events, filters, today, q]
  );

  // Premier events surface first, then Regular fills out the rest of each page —
  // "system automatically displays a combo of as many Premier and Regular events
  // that fit on the page" per spec. Sort is stable so order within each group holds.
  // Premier first, then chronological (spec notes rev 260923).
  const ordered = useMemo(() => orderEvents(filtered), [filtered]);

  const totalPages = Math.max(1, Math.ceil(ordered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageItems = ordered.slice(pageStart, pageStart + PAGE_SIZE);

  // Any time the filters or search change the result set, snap back to page 1
  // instead of showing an empty page.
  useEffect(() => {
    setPage(1);
  }, [filters, q]);

  const activeFilters = [];
  if (q) activeFilters.push({ key: "q", label: `Search: "${q}"` });
  const anyFilter =
    filters.formats.length || filters.tiers.length || filters.date !== "all" ||
    filters.costs.length || filters.regions.length || filters.categories.length;

  function clearFilter(key) {
    if (key === "q") {
      window.history.replaceState({}, "", "/");
      window.location.reload();
      return;
    }
  }

  function clearAllFilters() {
    setFilters(EMPTY_FILTERS);
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

  function goToPage(p) {
    setPage(Math.min(Math.max(1, p), totalPages));
    document.getElementById("browse")?.scrollIntoView({ block: "start" });
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
          <FilterPanel events={events} filters={filters} setFilters={setFilters} today={today} q={q} />

          <div>
            <div className="results-bar">
              <strong>{ordered.length}</strong> of {events.length} events match
              {anyFilter ? " your filters" : ""}
            </div>
            <div className="event-list">
              {pageItems.length === 0 && (
                <div className="empty-state">
                  No events match these filters.
                  {(activeFilters.length > 0 || anyFilter) && (
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
              {pageItems.map((e) => (
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
                      {e.date}{e.time ? ` · ${e.time}` : ""} · {e.type === "Online" ? "Online" : `${e.city}${e.region ? ` (${e.region})` : ""}`} · Hosted by{" "}
                      <a href={`/organizer/${slugify(e.hostedBy)}`} className="host-link">
                        {e.hostedBy}
                      </a>
                    </div>
                  </div>
                  <div className="card-right">
                    <div className="sub">{e.cost}</div>
                    <a
                      className="gcal-link"
                      href={googleCalendarUrl(e)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Add to my Google Calendar"
                    >
                      + Google Cal
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {ordered.length > 0 && (
              <>
                <div className="pagination">
                  <button
                    type="button"
                    className="pagination-btn"
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage <= 1}
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`pagination-btn ${p === safePage ? "active" : ""}`}
                      onClick={() => goToPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="pagination-btn"
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage >= totalPages}
                  >
                    Next →
                  </button>
                </div>
                <div className="pagination-summary">
                  Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, ordered.length)} of{" "}
                  {ordered.length} events · Page {safePage} of {totalPages}
                </div>
              </>
            )}
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
