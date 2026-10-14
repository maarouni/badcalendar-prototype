"use client";

// Second icon row inside the Organizations section (Cesar's Figma, Oct 14):
// Organization Details · Organization Digest · EDIT Organization Details ·
// Earn with Advertising
const Pyramid = ({ plus }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3 3 20h18L12 3Z" />
    <path d="M7.6 12h8.8" />
    {plus && <path d="M12 14.5v4M10 16.5h4" />}
  </svg>
);

export default function OrgSubNav({ active, orgId }) {
  const items = [
    { key: "details", label: "Organization Details", href: orgId ? `/organizations/${orgId}` : "/organizations#results", icon: <Pyramid /> },
    { key: "digest", label: "Organization Digest", href: "/organizations", icon: <Pyramid /> },
    { key: "edit", label: "EDIT Organization Details", href: orgId ? `/organizations/submit?id=${orgId}` : "/organizations/submit", icon: <Pyramid plus /> },
    {
      key: "advertising", label: "Earn with Advertising", href: "/advertising",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z" />
          <path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12" />
        </svg>
      ),
    },
  ];
  return (
    <nav className="org-subnav" aria-label="Organizations pages">
      {items.map((it) => (
        <a key={it.key} href={it.href} className={`org-subnav-item ${active === it.key ? "active" : ""}`}
          aria-current={active === it.key ? "page" : undefined}>
          {it.icon}
          <span>{it.label}</span>
        </a>
      ))}
    </nav>
  );
}
