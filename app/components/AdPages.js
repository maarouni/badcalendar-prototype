"use client";

import { usePathname } from "next/navigation";
import PageTemplate from "./PageTemplate";
import { Glyph } from "./Icons";
import { RATE_PAGES, rateValue } from "../lib/adRates";

// Earn with Advertising is split into separate pages (Oct 15 call): the
// calculator, then one page per rate card. This row links them.
export const AD_LINKS = [
  { href: "/advertising/calculate", icon: "calculate", label: "Calculate Advertising Cost" },
  ...RATE_PAGES.map((p) => ({ href: `/advertising/${p.slug}`, icon: p.icon, label: p.title })),
];

export function AdNav() {
  const path = usePathname() || "";
  return (
    <nav className="ad-nav" aria-label="Earn with Advertising pages">
      {AD_LINKS.map((l) => (
        <a key={l.href} href={l.href} className={`ad-nav-item ${path === l.href ? "active" : ""}`}>
          <Glyph name={l.icon} size={22} strokeWidth={1.5} />
          <span>{l.label}</span>
        </a>
      ))}
    </nav>
  );
}

export function AdPage({ title, children }) {
  return (
    <PageTemplate
      section={null}
      title={title}
      subtitle="Earn with Advertising · Innovative, Results-Based Marketing"
      legend={false}
      actions={<a href="/info#contact" className="tpl-action">Contact us</a>}
      subnav={<AdNav />}
    >
      {children}
    </PageTemplate>
  );
}

export function RateCard({ slug, children }) {
  const page = RATE_PAGES.find((p) => p.slug === slug);
  return (
    <section className="ad-box">
      <div className="ad-box-head">
        <h2>{page.title}</h2>
        <Glyph name={page.icon} size={34} strokeWidth={1.4} />
      </div>
      <table className="ad-rates">
        <thead><tr><th>Item</th><th>Rate *</th></tr></thead>
        <tbody>
          {page.rows.map(([k, v]) => <tr key={k}><td>{k}</td><td>{rateValue(v)}</td></tr>)}
        </tbody>
      </table>
      {children}
      <p className="ad-fine">* Rates subject to change without notice. They do not include credit card fees.</p>
    </section>
  );
}
