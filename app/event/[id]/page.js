"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { slugify, categoryIcon } from "../../lib/slug";

const STORAGE_KEY = "mc_my_calendar_v1";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(undefined);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((events) => {
        setEvent(events.find((e) => e.id === id) || null);
      });
    const sel = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    setSaved(!!sel[id]);
  }, [id]);

  function toggleSaved() {
    const sel = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    sel[id] = !sel[id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sel));
    setSaved(!!sel[id]);
  }

  if (event === undefined) {
    return <div className="page"><p>Loading…</p></div>;
  }

  if (event === null) {
    return (
      <div className="page">
        <div className="empty-state">
          Couldn't find that event. <a href="/">Back to Super Calendar</a>
        </div>
      </div>
    );
  }

  const isFree = event.cost.toLowerCase().startsWith("free") && !event.cost.includes("$");
  const ctaLabel = event.cost.toLowerCase().includes("free") && !event.cost.includes("$")
    ? "RSVP"
    : "Get Tickets";

  return (
    <div className="page event-detail">
      <div className={`event-cover cover-${slugify(event.category)}`}>
        {event.premier && <span className="cover-premier">★ PREMIER EVENT</span>}
        <span className="cover-icon">{categoryIcon(event.category)}</span>
      </div>

      <div className="event-detail-grid">
        <div className="event-detail-main">
          <span className="badge" style={{ marginBottom: 10, display: "inline-block" }}>
            {event.category}
          </span>
          <h1>{event.title}</h1>
          <div className="event-meta-row">
            <span>🗓️ {event.date}{event.time ? ` · ${event.time}` : ""}</span>
            <span>{event.type === "Online" ? "💻 Online" : `📍 ${event.city}`}</span>
          </div>

          <h4 className="section-label" style={{ marginTop: 24 }}>About this event</h4>
          <p className="event-description">{event.description || "No description provided yet."}</p>

          <h4 className="section-label" style={{ marginTop: 24 }}>Who's going</h4>
          <div className="attendee-placeholder">
            <span className="coming-soon-tag" style={{ position: "static" }}>Coming soon</span>
            <p>Attendee lists and RSVP counts aren't wired up in this prototype yet.</p>
          </div>
        </div>

        <aside className="event-detail-side">
          <div className="rsvp-card">
            <div className="rsvp-cost">{event.cost}</div>
            <button type="button" className="btn-primary rsvp-btn" title="Payments aren't wired up yet">
              {ctaLabel}
            </button>
            <div className="rsvp-hint">Coming soon — no real checkout yet</div>
            <button
              type="button"
              className={`btn secondary rsvp-save ${saved ? "saved" : ""}`}
              onClick={toggleSaved}
            >
              {saved ? "✓ On My Calendar" : "+ Add to My Calendar"}
            </button>
          </div>

          <a href={`/organizer/${slugify(event.hostedBy)}`} className="host-card">
            <div className="nav-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
              {event.hostedBy.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="host-card-label">Hosted by</div>
              <div className="host-card-name">{event.hostedBy}</div>
            </div>
          </a>
        </aside>
      </div>
    </div>
  );
}
