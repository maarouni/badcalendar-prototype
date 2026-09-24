"use client";

import { useEffect, useMemo, useState } from "react";
import { ATTENDANCE_STATUSES, orderEvents, googleCalendarUrl } from "../lib/taxonomy";

const STORAGE_KEY = "mc_my_calendar_v1";
const STATUS_KEY = "mc_attendance_status_v2";

export default function MyCalendar() {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState({});
  const [status, setStatus] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetch("/api/events").then((r) => r.json()).then(setEvents);
    try {
      setSelected(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
      setStatus(JSON.parse(localStorage.getItem(STATUS_KEY) || "{}"));
    } catch {}
  }, []);

  function setEventStatus(id, value) {
    const next = { ...status, [id]: value };
    setStatus(next);
    try { localStorage.setItem(STATUS_KEY, JSON.stringify(next)); } catch {}
  }

  function remove(id) {
    const next = { ...selected, [id]: false };
    setSelected(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }

  const myEvents = useMemo(
    () => orderEvents(events.filter((e) => selected[e.id])),
    [events, selected]
  );

  const counts = useMemo(() => {
    const c = {};
    for (const e of myEvents) {
      const s = status[e.id] || "none";
      c[s] = (c[s] || 0) + 1;
    }
    return c;
  }, [myEvents, status]);

  const shown = myEvents.filter(
    (e) => statusFilter === "all" || (status[e.id] || "none") === statusFilter
  );

  return (
    <div className="page">
      <div className="hint">
        My Calendar Digest (gray / edit mode in the spec) — events you selected
        from the Super Calendar, with your attendance status for each.
      </div>

      {myEvents.length > 0 && (
        <div className="status-legend">
          <button
            type="button"
            className={`status-pill ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All <span>{myEvents.length}</span>
          </button>
          {ATTENDANCE_STATUSES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`status-pill st-${s.id} ${statusFilter === s.id ? "active" : ""}`}
              onClick={() => setStatusFilter(s.id)}
              disabled={!counts[s.id]}
            >
              <b>{s.icon}</b> {s.label} <span>{counts[s.id] || 0}</span>
            </button>
          ))}
        </div>
      )}

      <div className="event-list">
        {myEvents.length === 0 && (
          <div className="empty-state">
            Nothing here yet — go to <a href="/">Super Calendar</a> and select some events.
          </div>
        )}
        {shown.map((e) => {
          const s = status[e.id] || "none";
          const meta = ATTENDANCE_STATUSES.find((x) => x.id === s);
          return (
            <div key={e.id} className={`event-card ${e.premier ? "premier" : ""}`}>
              <span className={`status-icon st-${s}`} title={meta?.label}>{meta?.icon}</span>
              <div className="meta">
                <div className="title">
                  <a href={`/event/${e.id}`} className="title-link">{e.title}</a>{" "}
                  {e.premier && <span className="badge">PREMIER</span>}
                </div>
                <div className="sub">
                  {e.date}{e.time ? ` · ${e.time}` : ""} · {e.type === "Online" ? "Online" : e.city}
                </div>
              </div>
              <select value={s} onChange={(ev) => setEventStatus(e.id, ev.target.value)}>
                {ATTENDANCE_STATUSES.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.icon}  {x.label}
                  </option>
                ))}
              </select>
              <a className="gcal-link" href={googleCalendarUrl(e)} target="_blank" rel="noopener noreferrer">
                + Google Cal
              </a>
              <button type="button" className="remove-link" onClick={() => remove(e.id)} title="Remove from My Calendar">
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
