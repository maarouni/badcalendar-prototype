"use client";

import { useState } from "react";
import { Glyph } from "./Icons";
import { CountyMap, CaliforniaMap } from "./Explore";
import {
  DATE_OPTIONS,
  COST_OPTIONS,
  REGION_GROUPS,
  CATEGORY_GROUPS,
  EMPTY_FILTERS,
  countFor,
} from "../lib/taxonomy";

// One Big Calendar filters, rebuilt from Cesar's Oct 15 Figma review:
//   - yellow "Filters" bar with Hide, then "1 Select all that apply" with an
//     X to clear everything
//   - every section is its own white box with a large collapse arrow in a
//     circle (pointing up when open, down when closed)
//   - each section starts with "All (Default)"
//   - Filter Sets moved out (they belong in My Calendar Digest)
//   - the maps live inside the Regions boxes, not at the top of the page
//   - "2 Submit Display Results" at the bottom

export function CollapseArrow({ open, onClick, label }) {
  return (
    <button
      type="button"
      className="fp-arrow"
      onClick={onClick}
      aria-expanded={open}
      aria-label={`${open ? "Collapse" : "Expand"} ${label}`}
      data-tip={open ? "Collapse" : "View / Expand"}
    >
      <Glyph name={open ? "collapse" : "expand"} size={16} strokeWidth={2.4} />
    </button>
  );
}

function Box({ title, hint, icon, defaultOpen = true, disabled, note, children }) {
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

function Option({ type = "checkbox", name, checked, onChange, label, def, count, disabled }) {
  const empty = count === 0 && !checked;
  return (
    <label className={`fp-option ${empty ? "fp-empty" : ""} ${checked ? "fp-checked" : ""}`}>
      <input type={type} name={name} checked={checked} onChange={onChange} disabled={disabled} />
      <span className="fp-label">{label}{def && <em> Default</em>}</span>
    </label>
  );
}

export default function FilterPanel({ events, filters, setFilters, today, q, onHide, onDisplay }) {
  const [digestMode, setDigestMode] = useState("manual");

  const toggleIn = (key, value) =>
    setFilters((f) => {
      const cur = f[key];
      return { ...f, [key]: cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value] };
    });

  const count = (section, value) =>
    countFor(events, filters, section, { [section]: section === "date" ? value : [value] }, today, q);

  const onlineOnly = filters.formats.length === 1 && filters.formats[0] === "Online";
  const [bay, california, national, international] = REGION_GROUPS;
  const clearRegions = (opts) => setFilters((f) => ({ ...f, regions: f.regions.filter((r) => !opts.includes(r)) }));
  const noneOf = (opts) => !opts.some((o) => filters.regions.includes(o));

  return (
    <aside className="sidebar filter-panel fp-v2">
      <div className="fp-bar">
        <b>Filters</b>
        {onHide && <button type="button" className="fp-hide" data-tip="Hide filters" onClick={onHide}>Hide</button>}
      </div>
      <div className="fp-step-pill">
        <span className="step-badge" aria-hidden="true">1</span>
        <em>Select all that apply</em>
        <button type="button" className="fp-clear-x" data-tip="Clear All" aria-label="Clear all filters" onClick={() => setFilters(EMPTY_FILTERS)}>
          <Glyph name="clearAll" size={18} />
        </button>
      </div>

      <Box title="Dates" hint="Select one">
        {DATE_OPTIONS.map((o) => (
          <Option
            key={o.id}
            type="radio"
            name="fp-date"
            checked={filters.date === o.id}
            onChange={() => setFilters((f) => ({ ...f, date: o.id }))}
            label={o.label}
            def={o.id === "all"}
            count={o.id === "custom" ? undefined : count("date", o.id)}
          />
        ))}
        {filters.date === "custom" && (
          <div className="fp-range">
            <input type="date" aria-label="From date" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} />
            <span>–</span>
            <input type="date" aria-label="To date" value={filters.dateTo} min={filters.dateFrom || undefined} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} />
          </div>
        )}
      </Box>

      <Box title="Event Types">
        <Option
          type="radio"
          name="fp-types-all"
          checked={!filters.formats.length && !filters.tiers.length}
          onChange={() => setFilters((f) => ({ ...f, formats: [], tiers: [] }))}
          label="All"
          def
        />
        <Option checked={filters.formats.includes("In-Person")} onChange={() => toggleIn("formats", "In-Person")} label="In-Person" count={count("formats", "In-Person")} />
        <Option checked={filters.formats.includes("Online")} onChange={() => toggleIn("formats", "Online")} label="Online / Virtual" count={count("formats", "Online")} />
        <div className="fp-gap" />
        <Option checked={filters.tiers.includes("Premier")} onChange={() => toggleIn("tiers", "Premier")} label="Premier" count={count("tiers", "Premier")} />
        <Option checked={filters.tiers.includes("Regular")} onChange={() => toggleIn("tiers", "Regular")} label="Regular" count={count("tiers", "Regular")} />
      </Box>

      <Box title="Event Costs">
        <Option type="radio" name="fp-costs-all" checked={!filters.costs.length} onChange={() => setFilters((f) => ({ ...f, costs: [] }))} label="All" def />
        {COST_OPTIONS.map((o) => (
          <Option key={o.id} checked={filters.costs.includes(o.id)} onChange={() => toggleIn("costs", o.id)} label={o.label} count={count("costs", o.id)} />
        ))}
      </Box>

      <Box title="Add Selections to My Listings Digest" hint="Select one" icon={<Glyph name="select" size={14} />}>
        <Option type="radio" name="fp-digest" checked={digestMode === "manual"} onChange={() => setDigestMode("manual")} label="Manually" def />
        <Option type="radio" name="fp-digest" checked={digestMode === "auto"} onChange={() => setDigestMode("auto")} label="Automatically" />
        <p className="fp-aside">Saves time and is a useful reminder to see updates (My Notification Digest)</p>
      </Box>

      <Box title="Categories" defaultOpen={filters.categories.length > 0}>
        {CATEGORY_GROUPS.map((g) => (
          <div key={g.group} className="fp-cat-group">
            <div className="fp-cat-title">{g.group}</div>
            {g.options.map((o) => (
              <Option key={o} checked={filters.categories.includes(o)} onChange={() => toggleIn("categories", o)} label={o} count={count("categories", o)} />
            ))}
          </div>
        ))}
      </Box>

      <Box title={bay.group} disabled={onlineOnly} note={onlineOnly ? "Online only is selected — regions don't apply." : null}>
        <Option type="radio" name="fp-bay-all" checked={noneOf(bay.options)} onChange={() => clearRegions(bay.options)} label={bay.allLabel} def />
        <CountyMap compact events={events} filters={filters} setFilters={setFilters} />
      </Box>

      <Box title={california.group} defaultOpen={!noneOf(california.options)} disabled={onlineOnly}>
        <CaliforniaMap compact events={events} filters={filters} setFilters={setFilters} />
        {california.options.map((o) => (
          <Option key={o} checked={filters.regions.includes(o)} onChange={() => toggleIn("regions", o)} label={o} count={count("regions", o)} />
        ))}
      </Box>

      {[national, international].map((g) => (
        <Box key={g.group} title={g.group} defaultOpen={!noneOf(g.options)} disabled={onlineOnly}>
          {g.options.map((o) => (
            <Option key={o} checked={filters.regions.includes(o)} onChange={() => toggleIn("regions", o)} label={o} count={count("regions", o)} />
          ))}
        </Box>
      ))}

      <button type="button" className="fp-submit-pill" onClick={onDisplay}>
        <span className="step-badge" aria-hidden="true">2</span>
        Submit <em>Display Results</em>
      </button>
    </aside>
  );
}
