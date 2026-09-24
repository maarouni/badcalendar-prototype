"use client";

import { useEffect, useState } from "react";
import {
  EVENT_FORMATS,
  EVENT_TIERS,
  DATE_OPTIONS,
  COST_OPTIONS,
  REGION_GROUPS,
  CATEGORY_GROUPS,
  EMPTY_FILTERS,
  countFor,
} from "../lib/taxonomy";

const SETS_KEY = "mc_filter_sets_v1";
const SET_NAMES = ["A", "B", "C"];

function Section({ title, badge, defaultOpen = true, disabled, note, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`fp-section ${disabled ? "fp-disabled" : ""}`}>
      <button type="button" className="fp-section-head" onClick={() => setOpen((o) => !o)}>
        <span>
          {title}
          {badge > 0 && <span className="fp-badge">{badge}</span>}
        </span>
        <span className="fp-caret">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="fp-section-body">
          {note && <div className="fp-note">{note}</div>}
          {children}
        </div>
      )}
    </div>
  );
}

function Option({ type = "checkbox", name, checked, onChange, label, count, disabled }) {
  const empty = count === 0 && !checked;
  return (
    <label className={`fp-option ${empty ? "fp-empty" : ""} ${checked ? "fp-checked" : ""}`}>
      <input type={type} name={name} checked={checked} onChange={onChange} disabled={disabled} />
      <span className="fp-label">{label}</span>
      {typeof count === "number" && <span className="fp-count">{count}</span>}
    </label>
  );
}

function SubGroup({ title, options, selected, onToggle, countOf, disabled, defaultOpen = false }) {
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
      {open &&
        options.map((o) => (
          <Option
            key={o}
            checked={selected.includes(o)}
            onChange={() => onToggle(o)}
            label={o}
            count={countOf(o)}
            disabled={disabled}
          />
        ))}
    </div>
  );
}

export default function FilterPanel({ events, filters, setFilters, today, q }) {
  const [sets, setSets] = useState({});
  const [activeSet, setActiveSet] = useState(null);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    try {
      setSets(JSON.parse(localStorage.getItem(SETS_KEY) || "{}"));
    } catch {}
  }, []);

  const toggleIn = (key, value) =>
    setFilters((f) => {
      const cur = f[key];
      return { ...f, [key]: cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value] };
    });

  const count = (section, value) =>
    countFor(events, filters, section, { [section]: section === "date" ? value : [value] }, today, q);

  const onlineOnly = filters.formats.length === 1 && filters.formats[0] === "Online";
  const totalSelected =
    filters.formats.length + filters.tiers.length + (filters.date !== "all" ? 1 : 0) +
    filters.costs.length + filters.regions.length + filters.categories.length;

  function saveSet(name) {
    const next = { ...sets, [name]: filters };
    setSets(next);
    setActiveSet(name);
    try { localStorage.setItem(SETS_KEY, JSON.stringify(next)); } catch {}
    setFlash(`Saved as Filter Set ${name}`);
    setTimeout(() => setFlash(""), 1800);
  }

  function loadSet(name) {
    if (!sets[name]) return;
    setFilters({ ...EMPTY_FILTERS, ...sets[name] });
    setActiveSet(name);
  }

  function deleteSet(name) {
    const next = { ...sets };
    delete next[name];
    setSets(next);
    if (activeSet === name) setActiveSet(null);
    try { localStorage.setItem(SETS_KEY, JSON.stringify(next)); } catch {}
  }

  return (
    <aside className="sidebar filter-panel">
      <div className="fp-top">
        <h4>Filters</h4>
        {totalSelected > 0 && (
          <button type="button" className="fp-clear" onClick={() => { setFilters(EMPTY_FILTERS); setActiveSet(null); }}>
            ✕ Clear all
          </button>
        )}
      </div>

      <Section title="Filter Sets" badge={0} defaultOpen>
        <div className="fp-sets">
          {SET_NAMES.map((n) => (
            <div key={n} className={`fp-set ${activeSet === n ? "active" : ""}`}>
              <button type="button" className="fp-set-load" disabled={!sets[n]} onClick={() => loadSet(n)}>
                Set {n}{!sets[n] && <em> · empty</em>}
              </button>
              <button type="button" className="fp-set-save" onClick={() => saveSet(n)} title={`Save current filters as Set ${n}`}>
                Save
              </button>
              {sets[n] && (
                <button type="button" className="fp-set-del" onClick={() => deleteSet(n)} title="Delete set">✕</button>
              )}
            </div>
          ))}
          {flash && <div className="fp-flash">{flash}</div>}
        </div>
      </Section>

      <Section title="Event Types" badge={filters.formats.length + filters.tiers.length}>
        {EVENT_FORMATS.map((o) => (
          <Option key={o} checked={filters.formats.includes(o)} onChange={() => toggleIn("formats", o)} label={o} count={count("formats", o)} />
        ))}
        <div className="fp-divider" />
        {EVENT_TIERS.map((o) => (
          <Option key={o} checked={filters.tiers.includes(o)} onChange={() => toggleIn("tiers", o)} label={o} count={count("tiers", o)} />
        ))}
      </Section>

      <Section title="Dates" badge={filters.date !== "all" ? 1 : 0}>
        {DATE_OPTIONS.map((o) => (
          <Option
            key={o.id}
            type="radio"
            name="fp-date"
            checked={filters.date === o.id}
            onChange={() => setFilters((f) => ({ ...f, date: o.id }))}
            label={o.label}
            count={count("date", o.id)}
          />
        ))}
      </Section>

      <Section title="Costs" badge={filters.costs.length}>
        {COST_OPTIONS.map((o) => (
          <Option key={o.id} checked={filters.costs.includes(o.id)} onChange={() => toggleIn("costs", o.id)} label={o.label} count={count("costs", o.id)} />
        ))}
      </Section>

      <Section
        title="Regions"
        badge={filters.regions.length}
        disabled={onlineOnly}
        note={onlineOnly ? "Online only is selected — regions don't apply." : null}
      >
        {REGION_GROUPS.map((g, i) => (
          <SubGroup
            key={g.group + i}
            title={g.group}
            options={g.options}
            selected={filters.regions}
            onToggle={(o) => toggleIn("regions", o)}
            countOf={(o) => count("regions", o)}
            disabled={onlineOnly}
            defaultOpen={i === 0}
          />
        ))}
      </Section>

      <Section title="Categories" badge={filters.categories.length}>
        {CATEGORY_GROUPS.map((g) => (
          <SubGroup
            key={g.group}
            title={g.group}
            options={g.options}
            selected={filters.categories}
            onToggle={(o) => toggleIn("categories", o)}
            countOf={(o) => count("categories", o)}
          />
        ))}
      </Section>
    </aside>
  );
}
