"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { slugify } from "./lib/slug";
import FilterPanel from "./components/FilterPanel";
import PageTemplate from "./components/PageTemplate";
import { CountyMap } from "./components/Explore";
import { StepHead, NextStep } from "./components/Steps";
import { Glyph, IconButton } from "./components/Icons";
import {
  Poster, HostAvatar, Icon, fmtTime, fmtWhen, dayLabel, shortDate, isoOf,
} from "./components/EventVisuals";
import { EMPTY_FILTERS, matches, googleCalendarUrl } from "./lib/taxonomy";
import { fetchEvents } from "./lib/events";
import { addToCart } from "./lib/cart";

const STORAGE_KEY = "mc_my_calendar_v1";
const FILTERS_KEY = "mc_current_filters_v1";
const SHOW_FILTERS_KEY = "mc_show_filters_v1";
const PAGE_SIZE = 8; // events per page in the timeline

function chrono(a, b) {
  return `${a.date} ${a.time || ""}`.localeCompare(`${b.date} ${b.time || ""}`);
}

// Oct 10 decision: a small radio-style selector on the right of each
// listing (instead of the "+" circle), and the whole event box highlights
// when it's selected. Multi-select, so it's a checkbox drawn as a radio.
function SelectRadio({ saved, onClick, title }) {
  return (
    <label className="sel-radio-hit" data-tip={saved ? "In My Selection" : "Add listing to My Selection"}>
      <input
        type="checkbox"
        className="sel-radio"
        checked={saved}
        onChange={onClick}
        aria-label={`${saved ? "Remove" : "Add"} ${title} ${saved ? "from" : "to"} My Selection`}
      />
    </label>
  );
}

function PlaceLine({ e }) {
  return e.type === "Online" ? "Online" : `${e.city}${e.region && e.region !== e.city ? `, ${e.region}` : ""}`;
}

const multiDay = (e) => e.endDate && e.endDate > e.date;
const isPrivate = (e) => e.privacy === "Private";

function addTicket(e, setFlash) {
  addToCart({ kind: "tickets", refId: e.id, title: e.title, when: fmtWhen(e), price: e.price || 0 });
  setFlash(`Ticket for "${e.title}" added to My Shopping Cart`);
  setTimeout(() => setFlash(""), 2200);
}

function SuperCalendarInner() {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") || "").toLowerCase();

  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState({});
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const today = useMemo(() => new Date(), []);
  const todayIso = isoOf(today);
  const [showPast, setShowPast] = useState(false);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [flash, setFlash] = useState("");

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
  // Same, but ignoring the region filter — so the county map can show what
  // each county would add.
  const forMap = useMemo(
    () => events.filter((e) => matches(e, filters, today, "regions", q)),
    [events, filters, today, q]
  );

  const customRange = filters.date === "custom";
  const lastDay = (e) => (multiDay(e) ? e.endDate : e.date);
  const pastCount = filtered.filter((e) => lastDay(e) < todayIso).length;
  const visible = useMemo(() => {
    let list = filtered;
    if (!showPast && !customRange) list = list.filter((e) => lastDay(e) >= todayIso);
    return [...list].sort(chrono);
  }, [filtered, showPast, customRange, todayIso]); // eslint-disable-line react-hooks/exhaustive-deps

  const featured = visible.filter((e) => e.premier).slice(0, 8);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageItems = visible.slice(pageStart, pageStart + PAGE_SIZE);
  const groups = [];
  for (const e of pageItems) {
    const last = groups[groups.length - 1];
    if (last && last.date === e.date) last.items.push(e);
    else groups.push({ date: e.date, items: [e] });
  }

  useEffect(() => { setPage(1); }, [filters, q, showPast]);

  const anyFilter =
    filters.formats.length || filters.tiers.length || filters.date !== "all" ||
    filters.costs.length || filters.regions.length || filters.categories.length;

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

  function scrollToResults() {
    document.getElementById("results")?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function goToPage(p) {
    setPage(Math.min(Math.max(1, p), totalPages));
    scrollToResults();
  }

  const selectedIds = Object.keys(selected).filter((k) => selected[k]);
  const firstSelected = events.find((e) => selected[e.id]);

  const chips = [];
  if (q) chips.push({ key: "q", label: `"${q}"`, clear: () => { window.history.replaceState({}, "", "/"); window.location.reload(); } });
  if (customRange && (filters.dateFrom || filters.dateTo)) chips.push({ key: "range", label: `${filters.dateFrom ? shortDate(filters.dateFrom) : "…"} – ${filters.dateTo ? shortDate(filters.dateTo) : "…"}`, clear: () => setFilters((f) => ({ ...f, date: "all", dateFrom: "", dateTo: "" })) });
  for (const r of filters.regions) chips.push({ key: `r-${r}`, label: r, clear: () => setFilters((f) => ({ ...f, regions: f.regions.filter((x) => x !== r) })) });
  if (filters.formats.includes("Online")) chips.push({ key: "online", label: "Online", clear: () => setFilters((f) => ({ ...f, formats: f.formats.filter((x) => x !== "Online") })) });

  const premierActions = (e) => (
    <div className="tl-actions">
      <SelectRadio saved={!!selected[e.id]} onClick={() => toggle(e.id)} title={e.title} />
      <div className="tl-icon-row">
        <IconButton name="gcal" size={16} href={googleCalendarUrl(e)} target="_blank" rel="noopener noreferrer" />
        {e.price > 0 && <IconButton name="cartAdd" size={16} tip="Add ticket to My Shopping Cart" onClick={() => addTicket(e, setFlash)} />}
      </div>
    </div>
  );

  return (
    <>
      {/* Cesar's HOME Template (Figma Rev 261012): welcome box, the four
          sections, then One Big Calendar as the default content. */}
      <PageTemplate
        section="calendar"
        title="Welcome!"
        subtitle="Connect • Promote • Earn"
        legend={false}
        actions={<a href="/login" className="tpl-action" data-tip="Registration – Sign Up / Log In">Sign up</a>}
        intro={
          <>
            <b>Innovative, Results-Based Marketing and Revenue-Sharing System.</b>{" "}
            Curate specific listings by selecting sets of filters &mdash; includes several innovative custom features.{" "}
            <a href="/login">Sign up today</a> to create your account and manage Your Custom Digests.
          </>
        }
      >
        <div className="home-default">
          <h2 className="home-section-title">One Big Calendar <em>Public</em></h2>
          <p className="home-section-line"><strong>Save Time!</strong> Select filters to curate (organize, submit, view) events.</p>
        </div>
      </PageTemplate>

      <section className="explore" id="browse">
        <div className="explore-inner">
          <div className="explore-grid">
            <CountyMap events={forMap} filters={filters} setFilters={setFilters} />
            {/* Oct 10: Cesar isn't happy with the box calendar (multi-month ranges are
                hard on phones). Date ranges are typed in the Dates filter instead
                ("MM/DD/YY - MM/DD/YY"). MonthCalendar stays in Explore.js. */}
            <div className="explore-card tbd-card" aria-label="Calendar under construction">
              <div className="tbd-inner">
                <span className="tbd-flag">Calendar Under Construction</span>
                <b>TBD</b>
                <span className="tbd-note">Use Dates → MM/DD/YY - MM/DD/YY in the filters for a custom range.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="featured">
          <div className="featured-head">
            <h2>Featured</h2>
            <span className="featured-sub">Premier listings</span>
          </div>
          <div className="featured-row">
            {featured.map((e) => (
              <article key={e.id} className={`feat-card ${selected[e.id] ? "saved" : ""}`}>
                <a href={`/event/${e.id}`} className="feat-poster">
                  <Poster event={e} />
                </a>
                <div className="feat-body">
                  <div className="feat-when">{fmtWhen(e)}</div>
                  <a href={`/event/${e.id}`} className="feat-title">{e.title}</a>
                  <div className="feat-where"><PlaceLine e={e} /></div>
                  <div className="feat-foot">
                    <span className="feat-host"><HostAvatar name={e.hostedBy} size={20} />{e.hostedBy}</span>
                    <span className="price-chip">{e.price ? `From $${e.price}` : "Free"}</span>
                  </div>
                </div>
                <SelectRadio saved={!!selected[e.id]} onClick={() => toggle(e.id)} title={e.title} />
              </article>
            ))}
          </div>
        </section>
      )}

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
            <StepHead n={3} title="Results" hint="Select listings with the circle on the right">
              {!showFilters && (
                <button type="button" className="btn-ghost btn-sm" onClick={() => setFiltersShown(true)}>
                  <Glyph name="expand" size={14} /> Display Filters
                </button>
              )}
            </StepHead>
            <div className="results-bar">
              <div>
                <strong>{visible.length}</strong> {visible.length === 1 ? "event" : "events"}
                {customRange ? " in your date range" : showPast ? "" : " coming up"}
              </div>
              {!customRange && pastCount > 0 && (
                <button type="button" className="link-btn" onClick={() => setShowPast((v) => !v)}>
                  {showPast ? "Hide past events" : `Show ${pastCount} past`}
                </button>
              )}
            </div>

            {(chips.length > 0 || anyFilter) && (
              <div className="active-filters">
                {chips.map((c) => (
                  <button key={c.key} type="button" className="filter-chip" onClick={c.clear}>
                    {c.label} <span aria-hidden="true">✕</span>
                  </button>
                ))}
                <button type="button" className="clear-filters-btn" onClick={clearAllFilters}>Clear all</button>
              </div>
            )}
            {flash && <div className="fp-flash fp-flash-block">{flash}</div>}

            {pageItems.length === 0 && (
              <div className="empty-state">
                <div className="empty-circles" aria-hidden="true"><i /><i /><i /></div>
                Nothing matches yet.{" "}
                <button type="button" className="clear-filters-link" onClick={clearAllFilters}>Clear filters</button>{" "}
                to see every event.
              </div>
            )}

            <div className="timeline">
              {groups.map((g) => {
                const l = dayLabel(g.date, today);
                return (
                  <section key={g.date} className={`tl-day ${g.date < todayIso ? "past" : ""}`}>
                    <header className="tl-date">
                      <span className="tl-dot" aria-hidden="true" />
                      <div>
                        <div className="tl-day-main">{l.day}{l.tag && <em>{l.tag}</em>}</div>
                        <div className="tl-weekday">{l.weekday}</div>
                      </div>
                    </header>
                    <div className="tl-items">
                      {g.items.map((e) =>
                        e.premier ? (
                          <article key={e.id} className={`tl-card premier ${selected[e.id] ? "saved" : ""}`}>
                            <a href={`/event/${e.id}`} className="tl-thumb"><Poster event={e} label={false} /></a>
                            <div className="tl-main">
                              <div className="tl-kicker">Premier{multiDay(e) && <span className="tl-multi">Multiple dates</span>}</div>
                              <a href={`/event/${e.id}`} className="tl-title">
                                {isPrivate(e) && <span className="priv-icon" data-tip="Hide, Private — only you see this"><Glyph name="private" size={14} /></span>}
                                {e.title}
                              </a>
                              <div className="tl-line"><Icon name="clock" />{multiDay(e) ? fmtWhen(e) : fmtTime(e.time)}</div>
                              <div className="tl-line"><Icon name={e.type === "Online" ? "globe" : "pin"} /><PlaceLine e={e} /></div>
                              <div className="tl-line tl-host">
                                <HostAvatar name={e.hostedBy} size={18} />
                                <a href={`/organizer/${slugify(e.hostedBy)}`}>{e.hostedBy}</a>
                                <span className="tl-sep">·</span>
                                <Icon name="tag" />{e.cost}
                              </div>
                            </div>
                            {premierActions(e)}
                          </article>
                        ) : (
                          <article key={e.id} className={`tl-card regular ${selected[e.id] ? "saved" : ""}`}>
                            <div className="tl-main">
                              <div className="tl-reg-1">
                                <span className="tl-time">{multiDay(e) ? fmtWhen(e) : fmtTime(e.time)}</span>
                                <a href={`/event/${e.id}`} className="tl-title">
                                  {isPrivate(e) && <span className="priv-icon" data-tip="Hide, Private — only you see this"><Glyph name="private" size={14} /></span>}
                                  {e.title}
                                </a>
                              </div>
                              <div className="tl-reg-2">
                                <PlaceLine e={e} /> · <a href={`/organizer/${slugify(e.hostedBy)}`}>{e.hostedBy}</a> · {e.cost}
                              </div>
                            </div>
                            <div className="tl-actions">
                              <SelectRadio saved={!!selected[e.id]} onClick={() => toggle(e.id)} title={e.title} />
                            </div>
                          </article>
                        )
                      )}
                    </div>
                  </section>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button type="button" className="pagination-btn" onClick={() => goToPage(safePage - 1)} disabled={safePage <= 1}>← Prev</button>
                <span className="pagination-summary">Page {safePage} of {totalPages}</span>
                <button type="button" className="pagination-btn" onClick={() => goToPage(safePage + 1)} disabled={safePage >= totalPages}>Next →</button>
              </div>
            )}

            <NextStep
              noun="Event"
              digest="My Calendar Digest"
              digestHref="/my-calendar"
              detailsHref={firstSelected ? `/event/${firstSelected.id}` : "/my-calendar"}
              selectedCount={selectedIds.length}
            />
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
