"use client";

import { useEffect, useMemo, useState } from "react";
import { ATTENDANCE_STATUSES, googleCalendarUrl } from "../lib/taxonomy";
import { fetchEvents } from "../lib/events";
import { Poster, HostAvatar, Icon, fmtTime, startTime, dayLabel, isoOf } from "../components/EventVisuals";

// Cesar's spec "My Calendar Digest" (rev 260924): the events you picked from
// One Big Calendar, each with an Attendance Status, filterable by status.

const STORAGE_KEY = "mc_my_calendar_v1";
const STATUS_KEY = "mc_attendance_status_v2";

const DATE_VIEWS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "all", label: "All dates" },
];

function chrono(a, b) {
  return `${a.date} ${a.time || ""}`.localeCompare(`${b.date} ${b.time || ""}`);
}

// Minimal iCalendar export so the digest can go into any calendar app.
function toICS(list) {
  const esc = (s) => String(s || "").replace(/[\\,;]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//calendarGold//My Calendar//EN", "CALSCALE:GREGORIAN"];
  for (const e of list) {
    const d = String(e.date || "").replace(/-/g, "");
    if (!d) continue;
    const m = String(e.time || "").match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    const pad = (x) => String(x).padStart(2, "0");
    lines.push("BEGIN:VEVENT", `UID:${e.id}@calendargold`, `DTSTAMP:${stamp}`);
    if (m) {
      lines.push(`DTSTART;TZID=America/Los_Angeles:${d}T${pad(m[1])}${m[2]}00`, `DTEND;TZID=America/Los_Angeles:${d}T${pad(m[3])}${m[4]}00`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${d}`);
    }
    lines.push(
      `SUMMARY:${esc(e.title)}`,
      `LOCATION:${esc(e.type === "Online" ? "Online" : e.city)}`,
      `DESCRIPTION:${esc(`${e.description || ""}\nHosted by ${e.hostedBy}`)}`,
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function StatusPicker({ value, onChange }) {
  const meta = ATTENDANCE_STATUSES.find((s) => s.id === value) || ATTENDANCE_STATUSES[0];
  return (
    <label className={`st-picker st-${meta.id}`} title="Attendance status">
      <span className="st-icon">{meta.icon}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Attendance status">
        {ATTENDANCE_STATUSES.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>
    </label>
  );
}

export default function MyCalendar() {
  const [events, setEvents] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState({});
  const [status, setStatus] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateView, setDateView] = useState("upcoming");
  const today = useMemo(() => new Date(), []);
  const todayIso = isoOf(today);

  useEffect(() => {
    fetchEvents().then((list) => { setEvents(list); setLoaded(true); });
    try {
      setSelected(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
      setStatus(JSON.parse(localStorage.getItem(STATUS_KEY) || "{}"));
    } catch {}
  }, []);

  function persist(nextSel, nextStatus) {
    try {
      if (nextSel) localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSel));
      if (nextStatus) localStorage.setItem(STATUS_KEY, JSON.stringify(nextStatus));
    } catch {}
  }

  function setEventStatus(id, value) {
    const next = { ...status, [id]: value };
    setStatus(next);
    persist(null, next);
  }

  function remove(id) {
    const next = { ...selected, [id]: false };
    setSelected(next);
    persist(next, null);
  }

  // Demo helper: fills the digest with a few upcoming events.
  function loadSample() {
    const picks = events.filter((e) => e.date >= todayIso).sort(chrono).slice(0, 5);
    const sel = { ...selected };
    const st = { ...status };
    const cycle = ["attending", "high", "low", "job", "none"];
    picks.forEach((e, i) => { sel[e.id] = true; st[e.id] = st[e.id] || cycle[i % cycle.length]; });
    setSelected(sel);
    setStatus(st);
    persist(sel, st);
  }

  const mine = useMemo(() => events.filter((e) => selected[e.id]).sort(chrono), [events, selected]);
  const inView = mine.filter((e) =>
    dateView === "all" ? true : dateView === "past" ? e.date < todayIso : e.date >= todayIso
  );
  const counts = useMemo(() => {
    const c = {};
    for (const e of inView) {
      const s = status[e.id] || "none";
      c[s] = (c[s] || 0) + 1;
    }
    return c;
  }, [inView, status]);
  const shown = inView.filter((e) => statusFilter === "all" || (status[e.id] || "none") === statusFilter);

  const groups = [];
  for (const e of shown) {
    const last = groups[groups.length - 1];
    if (last && last.date === e.date) last.items.push(e);
    else groups.push({ date: e.date, items: [e] });
  }

  const attendingCount = (counts.attending || 0) + (counts.high || 0);

  function downloadICS() {
    const blob = new Blob([toICS(shown)], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "my-calendar.ics";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="page mc-page">
      <header className="mc-head">
        <div>
          <h1>My Calendar Digest</h1>
          <p>Assign your attendance status for each event. Curate the list with filters.</p>
        </div>
        <div className="mc-tools">
          <a href="/#timeline" className="mc-tool" title="Add events from One Big Calendar"><Icon name="plus" /><span>Add events</span></a>
          <button type="button" className="mc-tool" onClick={downloadICS} disabled={!shown.length} title="Download for Apple, Google or Outlook calendar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
            <span>Download .ics</span>
          </button>
          <button type="button" className="mc-tool" onClick={() => window.print()} disabled={!shown.length} title="Print">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z" /></svg>
            <span>Print</span>
          </button>
        </div>
      </header>

      {mine.length > 0 && (
        <div className="mc-stats">
          <div className="mc-stat"><b>{inView.length}</b><span>{dateView === "past" ? "past" : dateView === "all" ? "saved" : "coming up"}</span></div>
          <div className="mc-stat attending"><b>{attendingCount}</b><span>attending or likely</span></div>
          <div className="mc-stat"><b>{counts.none || 0}</b><span>need a status</span></div>
        </div>
      )}

      <div className="layout-with-sidebar">
        <aside className="sidebar mc-side">
          <h4>Dates</h4>
          <div className="mc-seg">
            {DATE_VIEWS.map((d) => (
              <button key={d.id} type="button" className={dateView === d.id ? "on" : ""} onClick={() => setDateView(d.id)}>{d.label}</button>
            ))}
          </div>
          <h4>My attendance status</h4>
          <button type="button" className={`mc-st-row ${statusFilter === "all" ? "on" : ""}`} onClick={() => setStatusFilter("all")}>
            <span className="st-icon st-all">∗</span>All<b>{inView.length}</b>
          </button>
          {ATTENDANCE_STATUSES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`mc-st-row st-${s.id} ${statusFilter === s.id ? "on" : ""}`}
              onClick={() => setStatusFilter(s.id)}
              disabled={!counts[s.id]}
            >
              <span className="st-icon">{s.icon}</span>{s.label}<b>{counts[s.id] || 0}</b>
            </button>
          ))}
        </aside>

        <div className="timeline-col">
          {loaded && mine.length === 0 && (
            <div className="mc-empty">
              <div className="empty-circles" aria-hidden="true"><i /><i /><i /></div>
              <h2>Your calendar is empty</h2>
              <p>Tap the <span className="mc-inline-plus"><Icon name="plus" /></span> on any event in One Big Calendar and it lands here.</p>
              <div className="mc-empty-actions">
                <a className="btn-primary" href="/#timeline">Browse One Big Calendar</a>
                <button type="button" className="btn-ghost" onClick={loadSample}>Show me with sample events</button>
              </div>
            </div>
          )}

          {mine.length > 0 && shown.length === 0 && (
            <div className="empty-state">
              Nothing here for this filter.{" "}
              <button type="button" className="clear-filters-link" onClick={() => { setStatusFilter("all"); setDateView("all"); }}>Show everything</button>
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
                    {g.items.map((e) => {
                      const s = status[e.id] || "none";
                      return (
                        <article key={e.id} className={`tl-card mc-card ${e.premier ? "premier" : "regular"} st-card-${s}`}>
                          <StatusPicker value={s} onChange={(v) => setEventStatus(e.id, v)} />
                          {e.premier && <a href={`/event/${e.id}`} className="tl-thumb mc-thumb"><Poster event={e} label={false} /></a>}
                          <div className="tl-main">
                            {e.premier && <div className="tl-kicker">Premier</div>}
                            <a href={`/event/${e.id}`} className="tl-title">{e.title}</a>
                            {e.premier ? (
                              <>
                                <div className="tl-line"><Icon name="clock" />{fmtTime(e.time)}</div>
                                <div className="tl-line"><Icon name={e.type === "Online" ? "globe" : "pin"} />{e.type === "Online" ? "Online" : e.city}</div>
                                <div className="tl-line tl-host"><HostAvatar name={e.hostedBy} size={18} /><b>{e.hostedBy}</b><span className="tl-sep">·</span><Icon name="tag" />{e.cost}</div>
                              </>
                            ) : (
                              <div className="tl-reg-2">{startTime(e.time)} · {e.type === "Online" ? "Online" : e.city} · {e.hostedBy} · {e.cost}</div>
                            )}
                          </div>
                          <div className="mc-actions">
                            <a className="gcal-link" href={googleCalendarUrl(e)} target="_blank" rel="noopener noreferrer">Google Cal</a>
                            <button type="button" className="mc-remove" onClick={() => remove(e.id)} aria-label={`Remove ${e.title} from My Calendar`} title="Remove from My Calendar">✕</button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
