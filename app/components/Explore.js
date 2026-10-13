"use client";

import { useMemo, useState } from "react";
import { Icon, isoOf, parseDate } from "./EventVisuals";
import { BAY_COUNTIES, NORCAL_CONTEXT, MAP_W, MAP_H } from "../lib/norcalCounties";

// Cesar (Oct 10): use a natural, real-shape map of the Bay Area counties
// instead of the AI-style bubbles. Hover changes color; click (or
// shift-click) toggles a county, so several can be selected at once.
// Surrounding NorCal counties are drawn as faded context only.
const ELSEWHERE = [
  { label: "Online", kind: "format", value: "Online" },
  { label: "Rest of California", kind: "regions", value: ["North Coast", "Shasta Cascades", "Sacramento Valley", "Gold Country", "Sierra Nevada", "Central Coast", "San Joaquin Valley", "Southern California", "Desert"] },
  { label: "National", kind: "regions", value: ["National"] },
  { label: "International", kind: "regions", value: ["International"] },
];

const SHORT = { "San Francisco": "SF", "Contra Costa": "Contra Costa", "Santa Clara": "Santa Clara", "San Mateo": "San Mateo" };
// Nudge a few labels off busy edges so they stay readable.
const LABEL_NUDGE = { "San Francisco": [-22, 0], "San Mateo": [-14, 4], Marin: [-6, 0], Alameda: [6, 2], "Contra Costa": [4, -2] };

export function CountyMap({ events, filters, setFilters }) {
  const counts = useMemo(() => {
    const c = {};
    for (const e of events) if (e.type !== "Online" && e.region) c[e.region] = (c[e.region] || 0) + 1;
    return c;
  }, [events]);
  const onlineCount = events.filter((e) => e.type === "Online").length;
  const bayNames = BAY_COUNTIES.map((c) => c.name);
  const pickedBay = bayNames.filter((n) => filters.regions.includes(n));

  function toggleRegions(values) {
    setFilters((f) => {
      const allOn = values.every((v) => f.regions.includes(v));
      const regions = allOn ? f.regions.filter((r) => !values.includes(r)) : [...new Set([...f.regions, ...values])];
      return { ...f, regions };
    });
  }
  function toggleOnline() {
    setFilters((f) => ({
      ...f,
      formats: f.formats.includes("Online") ? f.formats.filter((x) => x !== "Online") : [...f.formats, "Online"],
    }));
  }
  function clearBay() {
    setFilters((f) => ({ ...f, regions: f.regions.filter((r) => !bayNames.includes(r)) }));
  }

  return (
    <div className="explore-card">
      <div className="explore-head">
        <h3>Bay Area counties</h3>
        <span className="map-actions">
          <button type="button" className="link-btn" onClick={() => toggleRegions(bayNames)} title="Select all nine Bay Area counties">All</button>
          {pickedBay.length > 0 && (
            <button type="button" className="link-btn" onClick={clearBay} title="Clear county selection">Clear ({pickedBay.length})</button>
          )}
        </span>
      </div>
      <p className="map-hint">Click (or shift-click) counties to select several at once.</p>
      <svg className="county-map" viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="group" aria-label="Filter by county">
        <defs>
          <clipPath id="map-clip"><rect x="0" y="0" width={MAP_W} height={MAP_H} rx="12" /></clipPath>
        </defs>
        <g clipPath="url(#map-clip)">
          <rect className="map-water" x="0" y="0" width={MAP_W} height={MAP_H} />
          {NORCAL_CONTEXT.map((c) => (
            <path key={c.name} className="county-ctx" d={c.d}>
              <title>{`${c.name} County — outside the Bay Area (use "Rest of California")`}</title>
            </path>
          ))}
          {BAY_COUNTIES.map((c) => {
            const n = counts[c.name] || 0;
            const on = filters.regions.includes(c.name);
            return (
              <path
                key={c.name}
                d={c.d}
                className={`county-shape ${on ? "on" : ""} ${n ? "has" : "none"}`}
                tabIndex={0}
                role="checkbox"
                aria-checked={on}
                aria-label={`${c.name} County: ${n} events`}
                onClick={() => toggleRegions([c.name])}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggleRegions([c.name]))}
              >
                <title>{`${c.name} County · ${n} event${n === 1 ? "" : "s"} — click to ${on ? "remove" : "add"}`}</title>
              </path>
            );
          })}
          {BAY_COUNTIES.map((c) => {
            const n = counts[c.name] || 0;
            const on = filters.regions.includes(c.name);
            const [dx, dy] = LABEL_NUDGE[c.name] || [0, 0];
            return (
              <g key={c.name} className={`county-label ${on ? "on" : ""} ${n ? "has" : "none"}`} transform={`translate(${c.cx + dx} ${c.cy + dy})`}>
                <text className="county-name" textAnchor="middle" y="-2">{SHORT[c.name] || c.name}</text>
                {n > 0 && <text className="county-n" textAnchor="middle" y="12">{n}</text>}
              </g>
            );
          })}
        </g>
      </svg>
      <div className="elsewhere">
        {ELSEWHERE.map((o) => {
          const on = o.kind === "format" ? filters.formats.includes("Online") : o.value.every((v) => filters.regions.includes(v));
          const n = o.kind === "format" ? onlineCount : events.filter((e) => o.value.includes(e.region)).length;
          return (
            <button
              key={o.label}
              type="button"
              className={`elsewhere-chip ${on ? "on" : ""}`}
              onClick={() => (o.kind === "format" ? toggleOnline() : toggleRegions(o.value))}
            >
              {o.label} <b>{n}</b>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function MonthCalendar({ events, month, setMonth, day, setDay, today }) {
  const [collapsed, setCollapsed] = useState(false);
  const byDay = useMemo(() => {
    const m = {};
    for (const e of events) {
      (m[e.date] = m[e.date] || { premier: 0, regular: 0 })[e.premier ? "premier" : "regular"]++;
    }
    return m;
  }, [events]);

  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysIn = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  const todayIso = isoOf(today);
  const monthTotal = Object.entries(byDay)
    .filter(([iso]) => {
      const d = parseDate(iso);
      return d && d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
    })
    .reduce((s, [, v]) => s + v.premier + v.regular, 0);

  const shift = (n) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  return (
    <div className="explore-card">
      <div className="explore-head">
        <h3>{MONTH_NAMES[month.getMonth()]} {month.getFullYear()}</h3>
        <div className="month-nav">
          {!collapsed && <button type="button" onClick={() => shift(-1)} aria-label="Previous month" title="Previous month"><Icon name="chev-l" /></button>}
          {!collapsed && <button type="button" onClick={() => shift(1)} aria-label="Next month" title="Next month"><Icon name="chev-r" /></button>}
          <button type="button" className="collapse-btn" onClick={() => setCollapsed((c) => !c)} aria-expanded={!collapsed} title={collapsed ? "Expand calendar" : "Collapse calendar"}>
            <Icon name={collapsed ? "chev-d" : "chev-u"} />
          </button>
        </div>
      </div>
      {!collapsed && <>
      <div className="month-grid">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="month-wd">{w}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`b${i}`} />;
          const iso = isoOf(d);
          const info = byDay[iso];
          const dots = info ? [...Array(Math.min(info.premier, 3)).fill("p"), ...Array(Math.min(info.regular, 3 - Math.min(info.premier, 3))).fill("r")] : [];
          const cls = ["month-day", info ? "has" : "", iso === todayIso ? "today" : "", iso === day ? "on" : "", iso < todayIso ? "past" : ""].join(" ");
          return (
            <button
              key={iso}
              type="button"
              className={cls}
              disabled={!info}
              onClick={() => setDay(iso === day ? "" : iso)}
              aria-label={`${MONTH_NAMES[d.getMonth()]} ${d.getDate()}${info ? `, ${info.premier + info.regular} events` : ""}`}
            >
              <span className="month-num">{d.getDate()}</span>
              <span className="month-dots">
                {dots.map((k, j) => <i key={j} className={k} />)}
              </span>
            </button>
          );
        })}
      </div>
      <div className="month-foot">
        <span><i className="p" /> Premier</span>
        <span><i className="r" /> Regular</span>
        <span className="month-total">{monthTotal} this month</span>
      </div>
      </>}
    </div>
  );
}
