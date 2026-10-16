"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import FilterPanel from "./components/FilterPanel";
import HomeHero from "./components/HomeHero";
import { NextStep } from "./components/Steps";
import { ResultsHead, ListingTable, Pager } from "./components/ListingTable";
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
            <ResultsHead title="One Big Calendar" q={qRaw} setQ={setQRaw}
              showFilters={showFilters} onShowFilters={() => setFiltersShown(true)} />
            <SendToMasoud load={localEvents} noun="events" format={fmtEvent} subject="calendarGold - my events" />

            {pageItems.length === 0 && (
              <div className="empty-state">
                Nothing matches yet.{" "}
                <button type="button" className="clear-filters-link" onClick={clearAllFilters}>Clear filters</button>{" "}
                to see every event.
              </div>
            )}

            <ListingTable rows={pageItems.map((e) => ({
              id: e.id,
              href: `/event/${e.id}`,
              left: [fmtDateRange(e.date, e.endDate), fmtTime(e.time)],
              title: <>{isPrivate(e) && <span className="priv-icon" data-tip="Hide, Private — only you see this"><Glyph name="private" size={13} /></span>}{e.title}</>,
              lines: e.premier
                ? [`${cityCode(e)}${e.type !== "Online" && e.region ? `, ${e.region}` : ""}`, <>Hosted by <b>{e.hostedBy}</b></>, e.cost]
                : [`${cityCode(e)}, Hosted by ${e.hostedBy}`],
              premier: e.premier,
              image: rowImage(e),
              barter: e.barter,
              selected: !!selected[e.id],
              onToggle: () => toggle(e.id),
            }))} />

            <Pager page={safePage} totalPages={totalPages} onGo={goToPage} />

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
