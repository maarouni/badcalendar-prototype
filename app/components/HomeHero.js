"use client";

import { useState } from "react";
import IconNav from "./IconNav";
import { Glyph } from "./Icons";
import { CollapseArrow } from "./FilterPanel";

// Home hero from Cesar's Oct 15 Figma review — "replace completely as":
// every line of text inside a white box, the section tiles, a second row of
// boxes for the event actions, then the "Save Time!" line.
const ACTIONS = [
  { key: "details", icon: "editMode", label: "Event Details" },
  { key: "digest", icon: "calendar", label: "My Calendar Digest", href: "/my-calendar" },
  { key: "edit", icon: "editMode", label: "EDIT My Event Details", href: "/submit", dark: true },
  { key: "earn", icon: "share", label: "Earn with Advertising", href: "/advertising" },
];

export default function HomeHero({ detailsHref = "/my-calendar" }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="home-hero">
      <section className="hh-box hh-intro">
        <div className="hh-arrow">
          <CollapseArrow open={open} onClick={() => setOpen((o) => !o)} label="introduction" />
        </div>
        <h1>
          <i>Innovative,</i> Results-Based Marketing <br className="hh-br" />and Revenue-Sharing System
        </h1>
        {open && (
          <>
            <p className="hh-tag">Connect • Promote • Earn</p>
            <p className="hh-line"><b>Curate</b> specific listings by selecting sets of filters</p>
            <p className="hh-line">Includes several <b><i>innovative</i></b> custom features</p>
          </>
        )}
      </section>

      <IconNav active="calendar" mode="tiles" />

      <nav className="hh-actions" aria-label="Event actions">
        {ACTIONS.map((a) => (
          <a key={a.key} href={a.href || detailsHref} className={`hh-box hh-action ${a.dark ? "hh-action-dark" : ""}`}>
            <span className="hh-action-icon"><Glyph name={a.icon} size={20} /></span>
            <span>{a.label}</span>
          </a>
        ))}
      </nav>

      <p className="hh-box hh-save">
        <b><i>Save Time !</i></b> Select filters to <b>curate</b> (organize, submit, view) <b>events</b>
      </p>
    </div>
  );
}
