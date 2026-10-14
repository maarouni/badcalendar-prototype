"use client";

import { useState } from "react";
import {
  DATE_POSTED_OPTIONS, ORG_FORMATS, ORG_TIERS, MEMBER_OPTIONS, DUES_OPTIONS, MEMBERSHIP_STATUSES,
  CATEGORY_GROUPS, INDUSTRIES, REGION_GROUPS, EMPTY_ORG_FILTERS, countOrgsFor,
} from "../lib/organizations";
import DigestActions from "./DigestActions";

function Section({ title, badge, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="fp-section">
      <button type="button" className="fp-section-head" onClick={() => setOpen((o) => !o)}>
        <span>{title}{badge > 0 && <span className="fp-badge">{badge}</span>}</span>
        <span className="fp-caret">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="fp-section-body">{children}</div>}
    </div>
  );
}

function Option({ type = "checkbox", name, checked, onChange, label, count }) {
  const empty = count === 0 && !checked;
  return (
    <label className={`fp-option ${empty ? "fp-empty" : ""} ${checked ? "fp-checked" : ""}`}>
      <input type={type} name={name} checked={checked} onChange={onChange} />
      <span className="fp-label">{label}</span>
      {typeof count === "number" && <span className="fp-count">{count}</span>}
    </label>
  );
}

function SubGroup({ title, options, selected, onToggle, onClearGroup, allLabel, countOf, defaultOpen }) {
  const picked = options.filter((o) => selected.includes(o)).length;
  const [open, setOpen] = useState(defaultOpen || picked > 0);
  return (
    <div className="fp-subgroup">
      <button type="button" className="fp-subgroup-head" onClick={() => setOpen((o) => !o)}>
        <span>{title}{picked > 0 && <span className="fp-badge">{picked}</span>}</span>
        <span className="fp-caret">{open ? "▾" : "▸"}</span>
      </button>
      {open && allLabel && (
        <Option type="radio" name={`o-all-${title}`} checked={picked === 0} onChange={() => onClearGroup(options)} label={<>{allLabel} <em>(default)</em></>} />
      )}
      {open && options.map((o) => (
        <Option key={o} checked={selected.includes(o)} onChange={() => onToggle(o)} label={o} count={countOf(o)} />
      ))}
    </div>
  );
}

// "All (default)" radio + checkbox options, as drawn in every Figma filter box.
function AllPlus({ name, field, options, filters, setFilters, toggleIn, count }) {
  return (
    <>
      <Option type="radio" name={name} checked={!filters[field].length}
        onChange={() => setFilters((f) => ({ ...f, [field]: [] }))} label={<>All <em>(default)</em></>} />
      {options.map((o) => {
        const id = typeof o === "string" ? o : o.id;
        const label = typeof o === "string" ? o : o.icon ? <><b className="org-status-icon">{o.icon}</b> {o.label}</> : o.label;
        return <Option key={id} checked={filters[field].includes(id)} onChange={() => toggleIn(field, id)} label={label} count={count(field, id)} />;
      })}
    </>
  );
}

export default function OrgFilterPanel({ items, filters, setFilters, ctx, onHide, onDisplay }) {
  const toggleIn = (key, v) =>
    setFilters((f) => ({ ...f, [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v] }));
  const count = (key, v) => countOrgsFor(items, filters, { [key]: key === "posted" ? v : [v] }, ctx);
  const listKeys = ["formats", "tiers", "members", "dues", "status", "categories", "industry", "region"];
  const total = listKeys.reduce((n, k) => n + filters[k].length, 0) + (filters.posted !== "all" ? 1 : 0);
  const common = { filters, setFilters, toggleIn, count };

  return (
    <aside className="sidebar filter-panel">
      <div className="fp-top">
        <h4><span className="step-badge" aria-hidden="true">1</span> Filters <em className="fp-top-hint">Select all that apply</em></h4>
        <span className="fp-top-actions">
          {total > 0 && <button type="button" className="fp-clear" data-tip="Clear All" onClick={() => setFilters(EMPTY_ORG_FILTERS)}>✕ Clear</button>}
          {onHide && <button type="button" className="fp-hide" data-tip="Hide filters" onClick={onHide}>Hide</button>}
        </span>
      </div>

      <Section title="Date Posted / Revised" badge={filters.posted !== "all" ? 1 : 0}>
        {DATE_POSTED_OPTIONS.map((o) => (
          <Option key={o.id} type="radio" name="o-posted" checked={filters.posted === o.id}
            onChange={() => setFilters((f) => ({ ...f, posted: o.id }))} label={o.label}
            count={o.id === "custom" ? undefined : count("posted", o.id)} />
        ))}
        {filters.posted === "custom" && (
          <div className="fp-range">
            <input type="date" aria-label="Posted from" value={filters.postedFrom} onChange={(e) => setFilters((f) => ({ ...f, postedFrom: e.target.value }))} />
            <input type="date" aria-label="Posted to" value={filters.postedTo} min={filters.postedFrom || undefined} onChange={(e) => setFilters((f) => ({ ...f, postedTo: e.target.value }))} />
          </div>
        )}
      </Section>

      <Section title="Organization Types" badge={filters.formats.length + filters.tiers.length}>
        <Option type="radio" name="o-types-all" checked={!filters.formats.length && !filters.tiers.length}
          onChange={() => setFilters((f) => ({ ...f, formats: [], tiers: [] }))} label={<>All <em>(default)</em></>} />
        {ORG_FORMATS.map((o) => (
          <Option key={o} checked={filters.formats.includes(o)} onChange={() => toggleIn("formats", o)} label={o} count={count("formats", o)} />
        ))}
        <div className="fp-divider" />
        {ORG_TIERS.map((o) => (
          <Option key={o} checked={filters.tiers.includes(o)} onChange={() => toggleIn("tiers", o)} label={o} count={count("tiers", o)} />
        ))}
      </Section>

      <Section title="# Members" badge={filters.members.length}>
        <AllPlus name="o-members-all" field="members" options={MEMBER_OPTIONS} {...common} />
      </Section>

      <Section title="Annual Dues" badge={filters.dues.length}>
        <AllPlus name="o-dues-all" field="dues" options={DUES_OPTIONS} {...common} />
      </Section>

      <Section title="My Membership Status" badge={filters.status.length}>
        <AllPlus name="o-status-all" field="status" options={MEMBERSHIP_STATUSES} {...common} />
      </Section>

      <Section title="Categories" badge={filters.categories.length} defaultOpen={false}>
        {CATEGORY_GROUPS.map((g) => (
          <SubGroup key={g.group} title={g.group} options={g.options} selected={filters.categories}
            onToggle={(o) => toggleIn("categories", o)}
            onClearGroup={(opts) => setFilters((f) => ({ ...f, categories: f.categories.filter((c) => !opts.includes(c)) }))}
            countOf={(o) => count("categories", o)} />
        ))}
      </Section>

      <Section title="Industries" badge={filters.industry.length} defaultOpen={false}>
        {INDUSTRIES.map((o) => (
          <Option key={o} checked={filters.industry.includes(o)} onChange={() => toggleIn("industry", o)} label={o} count={count("industry", o)} />
        ))}
      </Section>

      <Section title="Regions" badge={filters.region.length} defaultOpen={false}>
        {REGION_GROUPS.map((g, i) => (
          <SubGroup key={g.group} title={g.group} options={g.options} selected={filters.region}
            onToggle={(o) => toggleIn("region", o)} allLabel={g.allLabel}
            onClearGroup={(opts) => setFilters((f) => ({ ...f, region: f.region.filter((r) => !opts.includes(r)) }))}
            countOf={(o) => count("region", o)} defaultOpen={i === 0} />
        ))}
      </Section>

      <DigestActions digestLabel="My Organizations Digest" promptLabel="Add Selections to My Organizations Digest" onDisplay={onDisplay} />
    </aside>
  );
}
