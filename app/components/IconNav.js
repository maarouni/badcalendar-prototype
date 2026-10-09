"use client";

// Shared 4-icon section row from Cesar's Home/Employment wireframes:
// One Big Calendar · Discount / Gift Certificates · Employment Listings · Notifications

const ITEMS = [
  {
    key: "calendar",
    href: "/",
    label: "One Big Calendar",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="16" rx="2.5" />
        <path d="M3 10h18" />
        <path d="M8 3v4M16 3v4" />
        <path d="M7.5 14h2M11 14h2M14.5 14h2M7.5 17h2M11 17h2" />
      </svg>
    ),
  },
  {
    key: "discounts",
    href: "/discounts",
    label: "Discount / Gift Certificates",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="8" cy="8" r="2.5" />
        <circle cx="16" cy="16" r="2.5" />
        <path d="M17 7 7 17" />
      </svg>
    ),
  },
  {
    key: "employment",
    href: "/employment",
    label: "Employment Listings",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="8" width="18" height="12" rx="2" />
        <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 13h18" />
      </svg>
    ),
  },
  {
    key: "notifications",
    href: "/notifications",
    label: "Notifications",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9Z" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

export default function IconNav({ active }) {
  return (
    <nav className="icon-nav" aria-label="Site sections">
      {ITEMS.map((it) => (
        <a key={it.key} href={it.href} className={`icon-nav-item ${active === it.key ? "active" : ""}`}>
          <span className="icon-nav-glyph">{it.icon}</span>
          <span className="icon-nav-label">{it.label}</span>
        </a>
      ))}
    </nav>
  );
}
