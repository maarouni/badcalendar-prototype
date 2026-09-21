"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const USER_KEY = "mc_user_v1";

function readUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function NavBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(readUser());
    const onChange = () => setUser(readUser());
    window.addEventListener("mc-auth-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("mc-auth-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  function submitSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function logOut() {
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("mc-auth-changed"));
    setMenuOpen(false);
    router.push("/");
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

        {user ? (
          <div className="nav-user-menu">
            <button
              type="button"
              className="nav-avatar"
              title={user.name}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {initials(user.name)}
            </button>
            {menuOpen && (
              <div className="nav-user-dropdown">
                <div className="nav-user-name">{user.name}</div>
                <div className="nav-user-id">{user.identifier}</div>
                <a href="/profile" onClick={() => setMenuOpen(false)}>Profile</a>
                <button type="button" onClick={logOut}>Log out</button>
              </div>
            )}
          </div>
        ) : (
          <a href="/login" className="btn-primary nav-login-btn">
            Log in
          </a>
        )}
      </div>
    </nav>
  );
}
