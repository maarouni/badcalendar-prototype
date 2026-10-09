"use client";

import { useState } from "react";
import {
  COMP_OPTIONS,
  SORT_OPTIONS,
  DATE_POSTED_OPTIONS,
  EMPLOYMENT_LEVELS,
  EMPLOYMENT_TYPES,
  REGION_GROUPS,
  INDUSTRIES,
  EMPTY_JOB_FILTERS,
  countJobsFor,
} from "../lib/employmentTaxonomy";
import DigestActions from "./DigestActions";

function Section({ title, badge, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="fp-section">
      <button type="button" className="fp-section-head" onClick={() => setOpen((o) => !o)}>
        <span>
          {title}
          {badge > 0 && <span className="fp-badge">{badge}</span>}
        </span>
        <span className="fp-caret">{open ? "−" : "+"}</span>
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

function SubGroup({ title, options, selected, onToggle, countOf, defaultOpen = false }) {
  const picked = options.filter((o) => selected.includes(o)).length;
  const [open, setOpen] = useState(defaultOpen || picked > 0);
  return (
    <div className="fp-subgroup">
      <button type="button" className="fp-subgroup-head" onClick={() => setOpen((o) => !o)}>
        <span>
          {title}
          {picked > 0 && <span className="fp-badge">{picked}</span>}
        </span>
        <span className="fp-caret">{open ? "−" : "+"}</span>
      </button>
      {open && options.map((o) => (
        <Option key={o} checked={selected.includes(o)} onChange={() => onToggle(o)} label={o} count={countOf(o)} />
      ))}
    </div>
  );
}

export default function EmploymentFilterPanel({ jobs, filters, setFilters, today, q }) {
  const toggleIn = (key, value) =>
    setFilters((f) => {
      const cur = f[key];
      return { ...f, [key]: cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value] };
    });

  const count = (section, value) =>
    countJobsFor(jobs, filters, section, { [section]: section === "posted" ? value : [value] }, today, q);

  const totalSelected =
    filters.comp.length + filters.level.length + filters.type.length +
    filters.region.length + filters.industry.length + (filters.posted !== "all" ? 1 : 0);

  return (
    <aside className="sidebar filter-panel">
      <div className="fp-top">
        <h4>Filters</h4>
        {totalSelected > 0 && (
          <button type="button" className="fp-clear" onClick={() => setFilters(EMPTY_JOB_FILTERS)}>
            ✕ Clear all
          </button>
        )}
      </div>

      <DigestActions digestLabel="My Careers / Jobs Digest" promptLabel="Add Listings to My Careers / Jobs Digest" />

      <Section title="Minimum Compensation" badge={filters.comp.length}>
        {COMP_OPTIONS.map((o) => (
          <Option key={o.id} checked={filters.comp.includes(o.id)} onChange={() => toggleIn("comp", o.id)} label={o.label} count={count("comp", o.id)} />
        ))}
      </Section>

      <Section title="Sort by" badge={0} defaultOpen={false}>
        {SORT_OPTIONS.map((o) => (
          <Option
            key={o.id}
            type="radio"
            name="emp-sort"
            checked={filters.sort === o.id}
            onChange={() => setFilters((f) => ({ ...f, sort: o.id }))}
            label={o.label}
          />
        ))}
      </Section>

      <Section title="Date Posted" badge={filters.posted !== "all" ? 1 : 0}>
        {DATE_POSTED_OPTIONS.map((o) => (
          <Option
            key={o.id}
            type="radio"
            name="emp-posted"
            checked={filters.posted === o.id}
            onChange={() => setFilters((f) => ({ ...f, posted: o.id }))}
            label={o.label}
            count={count("posted", o.id)}
          />
        ))}
      </Section>

      <Section title="Employment Level" badge={filters.level.length}>
        {EMPLOYMENT_LEVELS.map((o) => (
          <Option key={o} checked={filters.level.includes(o)} onChange={() => toggleIn("level", o)} label={o} count={count("level", o)} />
        ))}
      </Section>

      <Section title="Employment Types" badge={filters.type.length}>
        {EMPLOYMENT_TYPES.map((o) => (
          <Option key={o} checked={filters.type.includes(o)} onChange={() => toggleIn("type", o)} label={o} count={count("type", o)} />
        ))}
      </Section>

      <Section title="Regions" badge={filters.region.length}>
        {REGION_GROUPS.map((g, i) => (
          <SubGroup
            key={g.group + i}
            title={g.group}
            options={g.options}
            selected={filters.region}
            onToggle={(o) => toggleIn("region", o)}
            countOf={(o) => count("region", o)}
            defaultOpen={i === 0}
          />
        ))}
      </Section>

      <Section title="Industry(ies)" badge={filters.industry.length} defaultOpen={false}>
        {INDUSTRIES.map((o) => (
          <Option key={o} checked={filters.industry.includes(o)} onChange={() => toggleIn("industry", o)} label={o} count={count("industry", o)} />
        ))}
        <SubmitIndustry />
      </Section>
    </aside>
  );
}

function SubmitIndustry() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  return (
    <div className="fp-submit-here">
      {!open && !sent && (
        <button type="button" className="link-btn" onClick={() => setOpen(true)}>+ Submit Here (suggest an industry)</button>
      )}
      {open && !sent && (
        <form
          className="fp-submit-form"
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
        >
          <input type="text" placeholder="Industry name" required />
          <button type="submit" className="btn-primary btn-sm">Submit</button>
        </form>
      )}
      {sent && <div className="fp-flash">Thanks — sent for review.</div>}
    </div>
  );
}
