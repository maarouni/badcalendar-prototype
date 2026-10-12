"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconButton } from "./Icons";
import { cartCount } from "../lib/cart";

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
  const [cartN, setCartN] = useState(0);

  useEffect(() => {
    setUser(readUser());
    setCartN(cartCount());
    const onCart = () => setCartN(cartCount());
    window.addEventListener("mc-cart-changed", onCart);
    const onChange = () => { setUser(readUser()); setCartN(cartCount()); };
    window.addEventListener("mc-auth-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("mc-auth-changed", onChange);
      window.removeEventListener("storage", onChange);
      window.removeEventListener("mc-cart-changed", onCart);
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
        <span className="brand-mark" aria-hidden="true"><i /><i /></span>
        <span className="brand-word">calendar<b>Gold</b></span>
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
        <a href="/">One Big Calendar</a>
        <a href="/my-calendar">My Calendar</a>
        <a href="/submit" className="nav-cta">+ Create Event</a>

        {/* Header icons per Cesar's Legend Icons (Info section, Rev 261012) */}
        <IconButton name="info" href="/info" />
        <IconButton name="pdf" onClick={() => window.print()} />
        <IconButton name="print" onClick={() => window.print()} />
        <IconButton name="cart" href="/cart" badge={cartN || null} tip={`My Shopping Cart${cartN ? ` (${cartN})` : ""}`} />
        <IconButton name="notifications" href="/notifications" tip="Notifications" />
        {user && <IconButton name="dashboards" href="/dashboards" />}
        {user && <IconButton name="settings" href="/profile" />}
        {!user && <IconButton name="register" href="/login" />}

        {user ? (
          <div className="nav-user-menu">
            <button
              type="button"
              className="nav-avatar"
              data-tip={`Logged in — ${user.name}`}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {initials(user.name)}
            </button>
            {menuOpen && (
              <div className="nav-user-dropdown">
                <div className="nav-user-name">{user.name}</div>
                <div className="nav-user-id">{user.identifier}</div>
                <a href="/dashboards" onClick={() => setMenuOpen(false)}>Dashboards</a>
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
