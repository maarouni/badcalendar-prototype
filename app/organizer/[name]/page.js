"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { slugify } from "../../lib/slug";

export default function OrganizerPage() {
  const { name } = useParams();
  const [events, setEvents] = useState(undefined);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((all) => {
        setEvents(all.filter((e) => slugify(e.hostedBy) === name));
      });
  }, [name]);

  if (events === undefined) {
    return <div className="page"><p>Loading…</p></div>;
  }

  if (events.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          No organizer found with that name. <a href="/">Back to Super Calendar</a>
        </div>
      </div>
    );
  }

  const displayName = events[0].hostedBy;

  return (
    <div className="page">
      <div className="hint">
        Prototype: this organizer page is generated from the events they
        host — there's no real organizer account, verification, or
        follower system behind it yet.
      </div>

      <div className="profile-header">
        <div className="profile-avatar" style={{ fontSize: 22 }}>
          {displayName.slice(0, 2).toUpperCase()}
        </div>
        <div className="profile-info">
          <h2>{displayName}</h2>
          <div className="profile-meta">
            <span>📅 {events.length} event{events.length !== 1 ? "s" : ""} hosted</span>
            <span>📍 Bay Area, CA</span>
          </div>
          <button type="button" className="btn secondary" style={{ marginTop: 10 }} title="Coming soon">
            + Follow
          </button>
        </div>
      </div>

      <h4 className="section-label">Upcoming events by {displayName}</h4>
      <div className="event-list">
        {events.map((e) => (
          <a key={e.id} href={`/event/${e.id}`} className="event-card event-card-link">
            <div className="meta">
              <div className="title">
                {e.title} {e.premier && <span className="badge">PREMIER</span>}
              </div>
              <div className="sub">
                {e.date} · {e.time} · {e.city}
              </div>
            </div>
            <div className="sub">{e.cost}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
