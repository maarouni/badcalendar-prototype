"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "mc_my_calendar_v1";
const STATUS_KEY = "mc_attendance_status_v1";
const STATUSES = ["Interested", "Going", "Not Going"];

export default function MyCalendar() {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState({});
  const [status, setStatus] = useState({});

  useEffect(() => {
    fetch("/api/events").then((r) => r.json()).then(setEvents);
    setSelected(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
    setStatus(JSON.parse(localStorage.getItem(STATUS_KEY) || "{}"));
  }, []);

  function setEventStatus(id, value) {
    const next = { ...status, [id]: value };
    setStatus(next);
    localStorage.setItem(STATUS_KEY, JSON.stringify(next));
  }

  const myEvents = events.filter((e) => selected[e.id]);

  return (
    <div className="page">
      <div className="hint">
        Private view (gray/edit mode in the spec) — only events you selected
        from the Super Calendar, with an attendance status per event.
      </div>
      <div className="event-list">
        {myEvents.length === 0 && (
          <div className="empty-state">
            Nothing here yet — go to Super Calendar and select some events.
          </div>
        )}
        {myEvents.map((e) => (
          <div key={e.id} className="event-card">
            <div className="meta">
              <div className="title">
                <a href={`/event/${e.id}`} className="title-link">{e.title}</a>
              </div>
              <div className="sub">
                {e.date} · {e.time} · {e.city}
              </div>
            </div>
            <select
              value={status[e.id] || "Interested"}
              onChange={(ev) => setEventStatus(e.id, ev.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
