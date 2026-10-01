"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { slugify } from "./lib/slug";
import FilterPanel from "./components/FilterPanel";
import { CountyMap, MonthCalendar } from "./components/Explore";
import {
  Poster, HostAvatar, Icon, fmtTime, startTime, dayLabel, shortDate, isoOf, parseDate,
} from "./components/EventVisuals";
import { EMPTY_FILTERS, matches, googleCalendarUrl } from "./lib/taxonomy";
import { fetchEvents } from "./lib/events";

const STORAGE_KEY = "mc_my_calendar_v1";
const FILTERS_KEY = "mc_current_filters_v1";
const PAGE_SIZE = 8; // events per page in the timeline

// Cesar's rule: keep marketing in groups of three.
const HOW_IT_WORKS = [
  { n: 1, color: "orange", title: "Find", desc: "Every Bay Area event in One Big Calendar, filtered by county, date, cost and category." },
  { n: 2, color: "blue", title: "Save", desc: "Add events to My Calendar, set your attendance status, sync to Google Calendar." },
  { n: 3, color: "purple", title: "Share", desc: "Organizers list free, go Premier for top placement, and reach subscribers through Notifications." },
];

function chrono(a, b) {
  return `${a.date} ${a.time || ""}`.localeCompare(`${b.date} ${b.time || ""}`);
}

function SaveButton({ saved, onClick }) {
  return (
    <button
      type="button"
      className={`save-circle ${saved ? "saved" : ""}`}
      onClick={onClick}
      aria-pressed={saved}
      title={saved ? "In My Calendar — click to remove" : "Add to My Calendar"}
    >
      <Icon name={saved ? "check" : "plus"} />
    </button>
  );
}

function PlaceLine({ e }) {
  return e.type === "Online" ? "Online" : `${e.city}${e.region && e.region !== e.city ? `, ${e.region}` : ""}`;
}

function SuperCalendarInner() {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") || "").toLowerCase();

  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState({});
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const today = useMemo(() => new Date(), []);
  const todayIso = isoOf(today);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [day, setDay] = useState("");
  const [showPast, setShowPast] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchEvents().then(setEvents);
    try { setSelected(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")); } catch {}
    try {
      const f = JSON.parse(localStorage.getItem(FILTERS_KEY) || "null");
      if (f) setFilters({ ...EMPTY_FILTERS, ...f });
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(FILTERS_KEY, JSON.stringify(filters)); } catch {}
  }, [filters]);

  // Everything matching the sidebar filters + search.
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

  const pastCount = filtered.filter((e) => e.date < todayIso).length;
  const visible = useMemo(() => {
    let list = filtered;
    if (day) list = list.filter((e) => e.date === day);
    else if (!showPast) list = list.filter((e) => e.date >= todayIso);
    return [...list].sort(chrono);
  }, [filtered, day, showPast, todayIso]);

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

  useEffect(() => { setPage(1); }, [filters, q, day, showPast]);

  const anyFilter =
    filters.formats.length || filters.tiers.length || filters.date !== "all" ||
    filters.costs.length || filters.regions.length || filters.categories.length;

  function clearAllFilters() {
    setFilters(EMPTY_FILTERS);
    setDay("");
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

  function pickDay(iso) {
    setDay(iso);
    if (iso) {
      const d = parseDate(iso);
      setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }

  function goToPage(p) {
    setPage(Math.min(Math.max(1, p), totalPages));
    document.getElementById("timeline")?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  const chips = [];
  if (q) chips.push({ key: "q", label: `"${q}"`, clear: () => { window.history.replaceState({}, "", "/"); window.location.reload(); } });
  if (day) chips.push({ key: "day", label: shortDate(day), clear: () => setDay("") });
  for (const r of filters.regions) chips.push({ key: `r-${r}`, label: r, clear: () => setFilters((f) => ({ ...f, regions: f.regions.filter((x) => x !== r) })) });
  if (filters.formats.includes("Online")) chips.push({ key: "online", label: "Online", clear: () => setFilters((f) => ({ ...f, formats: f.formats.filter((x) => x !== "Online") })) });

  return (
    <>
      <section className="hero ec-hero">
        <div className="ec-arc" aria-hidden="true" />
        <div className="ec-hero-inner">
          <div className="ec-hero-copy">
            <span className="hero-eyebrow">Bay Area · Networking &amp; Events</span>
            <h1>It pays to be connected.</h1>
            <p>
              Every Bay Area networking event, meetup and workshop in One Big
              Calendar. Save the ones you care about to My Calendar, and list
              your own event for free.
            </p>
            <div className="hero-actions">
              <a href="/submit" className="btn-primary">+ Add an Event</a>
              <a href="#browse" className="btn-ghost">Browse Events ↓</a>
            </div>
          </div>

          <div className="ec-orbit">
            <svg className="ec-orbit-lines" viewBox="0 0 380 430" aria-hidden="true">
              <line x1="75" y1="70" x2="245" y2="205" />
              <line x1="70" y1="335" x2="245" y2="205" />
              <line x1="324" y1="378" x2="245" y2="205" />
            </svg>
            <a href="#browse" className="ec-circle ec-c-orange ec-c-main">One Big<br />Calendar</a>
            <a href="/submit" className="ec-circle ec-c-blue ec-c-add">Add<br />Event</a>
            <a href="/login" className="ec-circle ec-c-purple ec-c-login">Log In</a>
            <a href="/my-calendar" className="ec-circle ec-c-teal ec-c-mine">My<br />Calendar</a>
          </div>
        </div>
      </section>

      <section className="explore" id="browse">
        <div className="explore-inner">
          <div className="explore-intro">
            <h2>What&rsquo;s happening around the Bay</h2>
            <p>Pick a county, pick a day, or just scroll.</p>
          </div>
          <div className="explore-grid">
            <CountyMap events={forMap} filters={filters} setFilters={setFilters} />
            <MonthCalendar events={filtered} month={month} setMonth={setMonth} day={day} setDay={pickDay} today={today} />
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
              <article key={e.id} className="feat-card">
                <a href={`/event/${e.id}`} className="feat-poster">
                  <Poster event={e} />
                </a>
                <div className="feat-body">
                  <div className="feat-when">{shortDate(e.date)} · {startTime(e.time)}</div>
                  <a href={`/event/${e.id}`} className="feat-title">{e.title}</a>
                  <div className="feat-where"><PlaceLine e={e} /></div>
                  <div className="feat-foot">
                    <span className="feat-host"><HostAvatar name={e.hostedBy} size={20} />{e.hostedBy}</span>
                    <span className="price-chip">{e.price ? `From $${e.price}` : "Free"}</span>
                  </div>
                </div>
                <SaveButton saved={!!selected[e.id]} onClick={() => toggle(e.id)} />
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="page browse-page" id="timeline">
        <div className="layout-with-sidebar">
          <FilterPanel events={events} filters={filters} setFilters={setFilters} today={today} q={q} />

          <div className="timeline-col">
            <div className="results-bar">
              <div>
                <strong>{visible.length}</strong> {visible.length === 1 ? "event" : "events"}
                {day ? ` on ${shortDate(day)}` : showPast ? "" : " coming up"}
              </div>
              {!day && pastCount > 0 && (
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
                              <div className="tl-kicker">Premier</div>
                              <a href={`/event/${e.id}`} className="tl-title">{e.title}</a>
                              <div className="tl-line"><Icon name="clock" />{fmtTime(e.time)}</div>
                              <div className="tl-line"><Icon name={e.type === "Online" ? "globe" : "pin"} /><PlaceLine e={e} /></div>
                              <div className="tl-line tl-host">
                                <HostAvatar name={e.hostedBy} size={18} />
                                <a href={`/organizer/${slugify(e.hostedBy)}`}>{e.hostedBy}</a>
                                <span className="tl-sep">·</span>
                                <Icon name="tag" />{e.cost}
                              </div>
                            </div>
                            <div className="tl-actions">
                              <SaveButton saved={!!selected[e.id]} onClick={() => toggle(e.id)} />
                              <a className="gcal-link" href={googleCalendarUrl(e)} target="_blank" rel="noopener noreferrer">Google Cal</a>
                            </div>
                          </article>
                        ) : (
                          <article key={e.id} className={`tl-card regular ${selected[e.id] ? "saved" : ""}`}>
                            <div className="tl-main">
                              <div className="tl-reg-1">
                                <span className="tl-time">{startTime(e.time)}</span>
                                <a href={`/event/${e.id}`} className="tl-title">{e.title}</a>
                              </div>
                              <div className="tl-reg-2">
                                <PlaceLine e={e} /> · <a href={`/organizer/${slugify(e.hostedBy)}`}>{e.hostedBy}</a> · {e.cost}
                              </div>
                            </div>
                            <div className="tl-actions">
                              <SaveButton saved={!!selected[e.id]} onClick={() => toggle(e.id)} />
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} type="button" className={`pagination-btn ${p === safePage ? "active" : ""}`} onClick={() => goToPage(p)}>{p}</button>
                ))}
                <button type="button" className="pagination-btn" onClick={() => goToPage(safePage + 1)} disabled={safePage >= totalPages}>Next →</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="how">
        <h2>How it works</h2>
        <div className="how-grid">
          {HOW_IT_WORKS.map((h) => (
            <div key={h.n} className="how-item">
              <div className={`how-circle ${h.color}`}>{h.n}</div>
              <h3>{h.title}</h3>
              <p>{h.desc}</p>
            </div>
          ))}
        </div>
        <p className="proto-note">
          Prototype: My Calendar selections are saved in this browser only.
        </p>
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
