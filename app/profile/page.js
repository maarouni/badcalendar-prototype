"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "mc_my_calendar_v1";

const INTERESTS = ["Networking", "Real Estate", "Startups", "AI & Tech"];

export default function Profile() {
  const [savedCount, setSavedCount] = useState(0);
  const [hostedCount, setHostedCount] = useState(0);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    setSavedCount(Object.values(saved).filter(Boolean).length);

    fetch("/api/events")
      .then((r) => r.json())
      .then((events) => {
        setHostedCount(events.filter((e) => e.hostedBy === "Masoud").length);
      });
  }, []);

  return (
    <div className="page profile-page">
      <div className="hint">
        Prototype: this profile is static placeholder data, styled after how a
        real account page would look — no login/auth is wired up yet.
      </div>

      <div className="profile-header">
        <div className="profile-avatar">
          MA
          <button type="button" className="avatar-edit-btn" title="Upload logo — coming soon">
            ✎
          </button>
        </div>
        <div className="profile-info">
          <h2>Masoud Arouni</h2>
          <div className="profile-meta">
            <span>✉️ masoud@badcalendar.com</span>
            <span>📍 Pleasanton, CA</span>
            <span>🗓️ Joined Sep 2026</span>
          </div>
          <button type="button" className="btn secondary" style={{ marginTop: 10 }}>
            Edit profile
          </button>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-value">{savedCount}</div>
          <div className="stat-label">Events Saved</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{hostedCount}</div>
          <div className="stat-label">Events Hosted</div>
        </div>
        <div className="stat-card muted">
          <div className="stat-value">—</div>
          <div className="stat-label">Following (coming soon)</div>
        </div>
      </div>

      <h4 className="section-label">My interests</h4>
      <div className="interest-tags">
        {INTERESTS.map((i) => (
          <span key={i} className="interest-tag">{i}</span>
        ))}
        <button type="button" className="interest-tag interest-tag-add" title="Coming soon">
          + Add
        </button>
      </div>

      <h4 className="section-label" style={{ marginTop: 28 }}>Company / organizer profile</h4>
      <div className="event-card" style={{ alignItems: "center" }}>
        <div className="feature-icon" style={{ marginBottom: 0 }}>🏢</div>
        <div className="meta">
          <div className="title">badcalendar</div>
          <div className="sub">Organizer page, verified badge, and event history — coming soon</div>
        </div>
      </div>
    </div>
  );
}
