"use client";

import { useState } from "react";
import { Glyph } from "./Icons";
import CollapseArrow from "./CollapseArrow";
import { CountyMap, CaliforniaMap } from "./Explore";

// One filter sidebar for every section (Oct 15 review — Cesar: "hardcode the
// structure so every page is consistent"). One Big Calendar, Discount / Gift
// Certificates, Organizations and Employment all build their filters from
// these pieces, so a style change here shows up on every page at once.
//
//   Filters [Hide]                      yellow bar
//   (1) Select all that apply   [X]     yellow pill, X clears everything
//   ┌ Box title  hint            (^) ┐  white box, big arrow in a circle
//   │ • All  Default                  │  small dot radios, no check marks
//   └─────────────────────────────────┘
//   (2) Submit  Display Results          yellow pill

export function FilterShell({ onHide, onClear, onDisplay, children }) {
  return (
    <aside className="sidebar filter-panel fp-v2">
      <div className="fp-bar">
        <b>Filters</b>
        {onHide && <button type="button" className="fp-hide" data-tip="Hide filters" onClick={onHide}>Hide</button>}
      </div>
      <div className="fp-step-pill">
        <span className="step-badge" aria-hidden="true">1</span>
        <em>Select all that apply</em>
        <button type="button" className="fp-clear-x" data-tip="Clear All" aria-label="Clear all filters" onClick={onClear}>
          <Glyph name="clearAll" size={18} />
        </button>
      </div>
      {children}
      <button type="button" className="fp-submit-pill" onClick={onDisplay}>
        <span className="step-badge" aria-hidden="true">2</span>
        Submit <em>Display Results</em>
      </button>
    </aside>
  );
}

export function Box({ title, hint, icon, defaultOpen = true, disabled, note, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`fp-box ${disabled ? "fp-disabled" : ""}`}>
      <div className="fp-box-head">
        <span className="fp-box-title">
          {icon}
          <b>{title}</b>
          {hint && <em>{hint}</em>}
        </span>
        <CollapseArrow open={open} onClick={() => setOpen((o) => !o)} label={title} />
      </div>
      {open && (
        <div className="fp-box-body">
          {note && <div className="fp-note">{note}</div>}
          {children}
        </div>
      )}
    </section>
  );
}

export function Option({ type = "checkbox", name, checked, onChange, label, def, count, disabled }) {
  const empty = count === 0 && !checked;
  return (
    <label className={`fp-option ${empty ? "fp-empty" : ""} ${checked ? "fp-checked" : ""}`}>
      <input type={type} name={name} checked={checked} onChange={onChange} disabled={disabled} />
      <span className="fp-label">{label}{def && <em> Default</em>}</span>
    </label>
  );
}

const optId = (o) => (typeof o === "string" ? o : o.id);
const optLabel = (o) => (typeof o === "string" ? o : o.icon ? <><b className="org-status-icon">{o.icon}</b> {o.label}</> : o.label);

// "All (Default)" + one option per value, for a multi-select field.
export function CheckList({ field, options, filters, setFilters, count, all = true, allLabel = "All" }) {
  const cur = filters[field] || [];
  const toggle = (v) => setFilters((f) => ({ ...f, [field]: f[field].includes(v) ? f[field].filter((x) => x !== v) : [...f[field], v] }));
  return (
    <>
      {all && (
        <Option type="radio" name={`all-${field}`} checked={!cur.length} onChange={() => setFilters((f) => ({ ...f, [field]: [] }))} label={allLabel} def />
      )}
      {options.map((o) => (
        <Option key={optId(o)} checked={cur.includes(optId(o))} onChange={() => toggle(optId(o))} label={optLabel(o)} count={count ? count(field, optId(o)) : undefined} />
      ))}
    </>
  );
}

// Single-choice date box ("All Default", Today, … MM/DD/YY - MM/DD/YY).
export function DateBox({ title = "Dates", field, fromKey, toKey, options, filters, setFilters, count }) {
  return (
    <Box title={title} hint="Select one">
      {options.map((o) => (
        <Option key={o.id} type="radio" name={`date-${field}`} checked={filters[field] === o.id}
          onChange={() => setFilters((f) => ({ ...f, [field]: o.id }))} label={o.label} def={o.id === "all"}
          count={o.id === "custom" || !count ? undefined : count(field, o.id)} />
      ))}
      {filters[field] === "custom" && (
        <div className="fp-range">
          <input type="date" aria-label="From date" value={filters[fromKey]} onChange={(e) => setFilters((f) => ({ ...f, [fromKey]: e.target.value }))} />
          <span>–</span>
          <input type="date" aria-label="To date" value={filters[toKey]} min={filters[fromKey] || undefined} onChange={(e) => setFilters((f) => ({ ...f, [toKey]: e.target.value }))} />
        </div>
      )}
    </Box>
  );
}

// Grouped options (Categories) inside one box.
export function GroupedBox({ title, field, groups, filters, setFilters, count }) {
  const cur = filters[field] || [];
  return (
    <Box title={title} defaultOpen={cur.length > 0}>
      <Option type="radio" name={`all-${field}`} checked={!cur.length} onChange={() => setFilters((f) => ({ ...f, [field]: [] }))} label="All" def />
      {groups.map((g) => (
        <div key={g.group} className="fp-cat-group">
          <div className="fp-cat-title">{g.group}</div>
          <CheckList field={field} options={g.options} filters={filters} setFilters={setFilters} count={count} all={false} />
        </div>
      ))}
    </Box>
  );
}

// "Add Selections to My ___ Digest — Select one: Manually / Automatically".
export function DigestBox({ digest }) {
  const [mode, setMode] = useState("manual");
  const name = `digest-${digest}`;
  return (
    <Box title={`Add Selections to ${digest}`} hint="Select one" icon={<Glyph name="select" size={14} />}>
      <Option type="radio" name={name} checked={mode === "manual"} onChange={() => setMode("manual")} label="Manually" def />
      <Option type="radio" name={name} checked={mode === "auto"} onChange={() => setMode("auto")} label="Automatically" />
      <p className="fp-aside">Saves time and is a useful reminder to see updates (My Notification Digest)</p>
    </Box>
  );
}

// The four Regions boxes. The Bay Area and California maps live inside their
// boxes (not at the top of the page); a picked county turns gold.
export function RegionBoxes({ field, groups, filters, setFilters, count, disabled, note }) {
  const cur = filters[field] || [];
  const clear = (opts) => setFilters((f) => ({ ...f, [field]: f[field].filter((r) => !opts.includes(r)) }));
  const noneOf = (opts) => !opts.some((o) => cur.includes(o));
  const [bay, california, ...rest] = groups;
  return (
    <>
      <Box title={bay.group} disabled={disabled} note={note}>
        <Option type="radio" name={`${field}-bay-all`} checked={noneOf(bay.options)} onChange={() => clear(bay.options)} label={bay.allLabel || "All"} def />
        <CountyMap compact field={field} filters={filters} setFilters={setFilters} />
      </Box>
      <Box title={california.group} defaultOpen={!noneOf(california.options)} disabled={disabled}>
        <CaliforniaMap compact field={field} filters={filters} setFilters={setFilters} />
        <CheckList field={field} options={california.options} filters={filters} setFilters={setFilters} count={count} all={false} />
      </Box>
      {rest.map((g) => (
        <Box key={g.group} title={g.group} defaultOpen={!noneOf(g.options)} disabled={disabled}>
          <CheckList field={field} options={g.options} filters={filters} setFilters={setFilters} count={count} all={false} />
        </Box>
      ))}
    </>
  );
}
