"use client";

import { useState } from "react";
import {
  DATE_POSTED_OPTIONS, REDEEM_OPTIONS, DISCOUNT_OPTIONS, INDUSTRIES, REGION_GROUPS,
  EMPTY_DISCOUNT_FILTERS, countDiscountsFor,
} from "../lib/discounts";
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
        <Option type="radio" name={`d-all-${title}`} checked={picked === 0} onChange={() => onClearGroup(options)} label={<>{allLabel} <em>(default)</em></>} />
      )}
      {open && options.map((o) => (
        <Option key={o} checked={selected.includes(o)} onChange={() => onToggle(o)} label={o} count={countOf(o)} />
      ))}
    </div>
  );
}

export default function DiscountFilterPanel({ items, filters, setFilters, today, q, onHide, onDisplay }) {
  const toggleIn = (key, v) =>
    setFilters((f) => ({ ...f, [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v] }));
  const count = (key, v) => countDiscountsFor(items, filters, { [key]: key === "posted" ? v : [v] }, today, q);
  const total = filters.redeem.length + filters.value.length + filters.industry.length + filters.region.length + (filters.posted !== "all" ? 1 : 0);

  return (
    <aside className="sidebar filter-panel">
      <div className="fp-top">
        <h4><span className="step-badge" aria-hidden="true">1</span> Filters <em className="fp-top-hint">Select all that apply</em></h4>
        <span className="fp-top-actions">
          {total > 0 && <button type="button" className="fp-clear" data-tip="Clear All" onClick={() => setFilters(EMPTY_DISCOUNT_FILTERS)}>✕ Clear</button>}
          {onHide && <button type="button" className="fp-hide" data-tip="Hide filters" onClick={onHide}>Hide</button>}
        </span>
      </div>

      <Section title="Date Posted" badge={filters.posted !== "all" ? 1 : 0}>
        {DATE_POSTED_OPTIONS.map((o) => (
          <Option key={o.id} type="radio" name="d-posted" checked={filters.posted === o.id}
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

      <Section title="Redeem Certificate" badge={filters.redeem.length}>
        {REDEEM_OPTIONS.map((o) => (
          <Option key={o} checked={filters.redeem.includes(o)} onChange={() => toggleIn("redeem", o)} label={o} count={count("redeem", o)} />
        ))}
      </Section>

      <Section title="Discount" badge={filters.value.length}>
        {DISCOUNT_OPTIONS.map((o) => (
          <Option key={o.id} checked={filters.value.includes(o.id)} onChange={() => toggleIn("value", o.id)} label={o.label} count={count("value", o.id)} />
        ))}
      </Section>

      <Section title="Regions" badge={filters.region.length}>
        {REGION_GROUPS.map((g, i) => (
          <SubGroup key={g.group} title={g.group} options={g.options} selected={filters.region}
            onToggle={(o) => toggleIn("region", o)} allLabel={g.allLabel}
            onClearGroup={(opts) => setFilters((f) => ({ ...f, region: f.region.filter((r) => !opts.includes(r)) }))}
            countOf={(o) => count("region", o)} defaultOpen={i === 0} />
        ))}
      </Section>

      <Section title="Industries" badge={filters.industry.length} defaultOpen={false}>
        {INDUSTRIES.map((o) => (
          <Option key={o} checked={filters.industry.includes(o)} onChange={() => toggleIn("industry", o)} label={o} count={count("industry", o)} />
        ))}
      </Section>

      <DigestActions digestLabel="My Certificates Digest" promptLabel="Add Selections to My Certificates Digest" onDisplay={onDisplay} />
    </aside>
  );
}
