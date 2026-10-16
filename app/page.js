"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import FilterPanel from "./components/FilterPanel";
import HomeHero from "./components/HomeHero";
import { StepBadge, NextStep } from "./components/Steps";
import { Glyph } from "./components/Icons";
import { fmtTime, fmtWhen, fmtDateRange, isoOf } from "./components/EventVisuals";
import { EMPTY_FILTERS, matches } from "./lib/taxonomy";
import { fetchEvents, localEvents } from "./lib/events";
import SendToMasoud from "./components/SendToMasoud";
import { cityCode } from "./lib/cityCodes";

const STORAGE_KEY = "mc_my_calendar_v1";
const FILTERS_KEY = "mc_current_filters_v1";
const SHOW_FILTERS_KEY = "mc_show_filters_v1";
const PAGE_SIZE = 10; // rows per page in the One Big Calendar table

function chrono(a, b) {
  return `${a.date} ${a.time || ""}`.localeCompare(`${b.date} ${b.time || ""}`);
}

const multiDay = (e) => e.endDate && e.endDate > e.date;
const isPrivate = (e) => e.privacy === "Private";

const fmtEvent = (e) =>
  `${e.title} — hosted by ${e.hostedBy}\n   ${fmtWhen(e)} · ${e.type === "Online" ? "Online" : `${e.city}, ${e.region}`}\n   ${e.cost}${e.premier ? " · PREMIER" : ""}${e.privacy === "Private" ? " · PRIVATE" : ""}`;

// Image column for Premier rows: Cesar's legend images by event kind.
function rowImage(e) {
  const cats = [...(e.categories || []), e.category].join(" ").toLowerCase();
  if (cats.includes("dinner")) return "dinner";
  if (cats.includes("workshop") || cats.includes("seminar")) return "workshop";
  return "expo";
}

function SuperCalendarInner() {
  const [qRaw, setQRaw] = useState("");
  const q = qRaw.trim().toLowerCase();

  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState({});
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const today = useMemo(() => new Date(), []);
  const todayIso = isoOf(today);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    fetchEvents().then(setEvents);
    try { setSelected(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")); } catch {}
    try {
      const f = JSON.parse(localStorage.getItem(FILTERS_KEY) || "null");
      if (f) setFilters({ ...EMPTY_FILTERS, ...f });
    } catch {}
    try { if (localStorage.getItem(SHOW_FILTERS_KEY) === "0") setShowFilters(false); } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(FILTERS_KEY, JSON.stringify(filters)); } catch {}
  }, [filters]);

  function setFiltersShown(v) {
    setShowFilters(v);
    try { localStorage.setItem(SHOW_FILTERS_KEY, v ? "1" : "0"); } catch {}
  }

  const filtered = useMemo(
    () => events.filter((e) => matches(e, filters, today, null, q)),
    [events, filters, today, q]
  );

  const customRange = filters.date === "custom";
  const lastDay = (e) => (multiDay(e) ? e.endDate : e.date);
  const visible = useMemo(() => {
    let list = filtered;
    if (!customRange) list = list.filter((e) => lastDay(e) >= todayIso);
    return [...list].sort(chrono);
  }, [filtered, customRange, todayIso]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageItems = visible.slice(pageStart, pageStart + PAGE_SIZE);

  useEffect(() => { setPage(1); }, [filters, q]);

  function clearAllFilters() {
    setFilters(EMPTY_FILTERS);
    setQRaw("");
  }

  function toggle(id) {
    const next = { ...selected, [id]: !selected[id] };
    setSelected(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function scrollToResults() {
    document.getElementById("results")?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function goToPage(p) {
    setPage(Math.min(Math.max(1, p), totalPages));
    scrollToResults();
  }

  const firstSelected = events.find((e) => selected[e.id]);
  const detailsHref = firstSelected ? `/event/${firstSelected.id}` : "/my-calendar";

  return (
    <>
      <HomeHero detailsHref={detailsHref} />

      <div className={`page browse-page ${showFilters ? "" : "filters-hidden"}`} id="timeline">
        <div className="layout-with-sidebar">
          {showFilters && (
            <FilterPanel
              events={events}
              filters={filters}
              setFilters={setFilters}
              today={today}
              q={q}
              onHide={() => setFiltersShown(false)}
              onDisplay={scrollToResults}
            />
          )}

          <div className="timeline-col" id="results">
            {/* Oct 15 Figma: "3 One Big Calendar — Select all that apply",
                search, then a compact table. One text size per role; no
                event counts, no row icons (the #4 box covers those actions). */}
            <div className="obc-bar">
              <StepBadge n={3} />
              <b>One Big Calendar</b>
              <em>Select all that apply</em>
              {!showFilters && (
                <button type="button" className="obc-show-filters" onClick={() => setFiltersShown(true)}>
                  <Glyph name="expand" size={14} /> Filters
                </button>
              )}
            </div>
            <label className="obc-search">
              <Glyph name="search" size={18} />
              <input
                type="text"
                placeholder="SEARCH"
                value={qRaw}
                onChange={(e) => setQRaw(e.target.value)}
                aria-label="Search events"
              />
            </label>

            <SendToMasoud load={localEvents} noun="events" format={fmtEvent} subject="calendarGold - my events" />

            {pageItems.length === 0 && (
              <div className="empty-state">
                Nothing matches yet.{" "}
                <button type="button" className="clear-filters-link" onClick={clearAllFilters}>Clear filters</button>{" "}
                to see every event.
              </div>
            )}

            {pageItems.length > 0 && (
              <div className="obc-table" role="list">
                {pageItems.map((e) => {
                  const on = !!selected[e.id];
                  const href = `/event/${e.id}`;
                  return (
                    <article key={e.id} role="listitem" className={`obc-row ${e.premier ? "premier" : "regular"} ${on ? "selected" : ""}`}>
                      <a href={href} className="obc-cell obc-when" tabIndex={-1}>
                        <span>{fmtDateRange(e.date, e.endDate)}</span>
                        <span>{fmtTime(e.time)}</span>
                      </a>
                      <a href={href} className="obc-cell obc-main">
                        <span className="obc-title">
                          {isPrivate(e) && <span className="priv-icon" data-tip="Hide, Private — only you see this"><Glyph name="private" size={13} /></span>}
                          {e.title}
                        </span>
                        {e.premier ? (
                          <>
                            <span title={e.city}>{cityCode(e)}{e.type !== "Online" && e.region ? `, ${e.region}` : ""}</span>
                            <span>Hosted by <b>{e.hostedBy}</b></span>
                            <span>{e.cost}</span>
                          </>
                        ) : (
                          <span><abbr title={e.city}>{cityCode(e)}</abbr>, Hosted by {e.hostedBy}</span>
                        )}
                        {e.barter && <span className="obc-barter" data-tip="Barter – no payment, not tracked"><Glyph name="barter" size={15} /></span>}
                      </a>
                      {e.premier && (
                        <a href={href} className="obc-cell obc-img" tabIndex={-1} aria-hidden="true">
                          <Glyph name={rowImage(e)} size={34} strokeWidth={1.4} />
                        </a>
                      )}
                      <label className="obc-cell obc-sel" data-tip={on ? "In My Selection" : "Add listing to My Selection"}>
                        <input
                          type="checkbox"
                          className="sel-radio"
                          checked={on}
                          onChange={() => toggle(e.id)}
                          aria-label={`${on ? "Remove" : "Add"} ${e.title} ${on ? "from" : "to"} My Selection`}
                        />
                      </label>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="obc-pager">
              <button type="button" className="obc-pg" onClick={() => goToPage(safePage - 1)} disabled={safePage <= 1} aria-label="Previous page" data-tip="Previous">
                <Glyph name="prev" size={14} strokeWidth={2.4} />
              </button>
              <span>Page <b>{safePage}</b> of <b>{totalPages}</b></span>
              <button type="button" className="obc-pg" onClick={() => goToPage(safePage + 1)} disabled={safePage >= totalPages} aria-label="Next page" data-tip="Next">
                <Glyph name="next" size={14} strokeWidth={2.4} />
              </button>
            </div>

            <NextStep noun="Listing" digest="My Listing Digest" digestHref="/my-calendar" detailsHref={detailsHref} />
          </div>
        </div>
      </div>
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
