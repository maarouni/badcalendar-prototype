"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submitSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <nav className="navbar">
      <a href="/" className="brand">
        <span className="brand-mark">📅</span>
        bad<span>calendar</span>
      </a>

      <form className="nav-search" onSubmit={submitSearch}>
        <input
          type="text"
          placeholder="Search events..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span className="nav-search-divider" />
        <span className="nav-search-location" title="Location detection — coming soon">
          📍 Pleasanton, CA
        </span>
        <button type="submit" aria-label="Search" className="nav-search-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </form>

      <div className="nav-links">
        <a href="/">Super Calendar</a>
        <a href="/my-calendar">My Calendar</a>
        <a href="/submit" className="nav-cta">+ Create Event</a>

        <button type="button" className="icon-btn" title="Messages — coming soon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
          </svg>
        </button>
        <button type="button" className="icon-btn" title="Notifications — coming soon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9Z" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="icon-dot" />
        </button>
        <a href="/profile" className="nav-avatar" title="Masoud Arouni">MA</a>
      </div>
    </nav>
  );
}
