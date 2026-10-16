"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconButton } from "./Icons";

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

  function logOut() {
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("mc-auth-changed"));
    setMenuOpen(false);
    router.push("/");
  }

  // Oct 15 Figma review: no text links or "+ Create" button in the header
  // (the section tiles and Next Step box cover them), no Log in button
  // (redundant with the log-in icon), and the icon set is grouped 3 · 2 · 1:
  //   Info, Dashboards, Settings | Download PDF, Print | Log in / user
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="/" className="brand">
          <span className="brand-mark" aria-hidden="true"><i /><i /></span>
          <span className="brand-word">calendar<b>Gold</b></span>
          <span className="brand-more">&amp; much more</span>
        </a>

        <div className="nav-links nav-icon-groups">
          <span className="nav-icon-group">
            <IconButton name="info" href="/info" />
            <IconButton name="dashboards" href={user ? "/dashboards" : "/login"} />
            <IconButton name="settings" href={user ? "/profile" : "/login"} />
          </span>
          <span className="nav-icon-group">
            <IconButton name="pdf" onClick={() => window.print()} />
            <IconButton name="print" onClick={() => window.print()} />
          </span>
          <span className="nav-icon-group">
            {user ? (
              <span className="nav-user-menu">
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
              </span>
            ) : (
              <IconButton name="login" href="/login" />
            )}
          </span>
        </div>
      </div>
    </nav>
  );
}
