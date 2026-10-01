"use client";

import { useMemo } from "react";
import { Icon, isoOf, parseDate } from "./EventVisuals";

// Rough geographic placement of Cesar's nine Bay Area counties, drawn as
// Every Circle bubbles. Bubble size grows with the number of matching events.
const COUNTIES = [
  { name: "Sonoma", short: "Sonoma", x: 62, y: 52 },
  { name: "Napa", short: "Napa", x: 156, y: 38 },
  { name: "Solano", short: "Solano", x: 262, y: 66 },
  { name: "Marin", short: "Marin", x: 52, y: 146 },
  { name: "Contra Costa", short: "Contra Costa", x: 262, y: 158 },
  { name: "San Francisco", short: "SF", x: 112, y: 206 },
  { name: "Alameda", short: "Alameda", x: 246, y: 248 },
  { name: "San Mateo", short: "San Mateo", x: 98, y: 296 },
  { name: "Santa Clara", short: "Santa Clara", x: 236, y: 342 },
];

const ELSEWHERE = [
  { label: "Online", kind: "format", value: "Online" },
  { label: "Rest of California", kind: "regions", value: ["North Coast", "Shasta Cascades", "Sacramento Valley", "Gold Country", "Sierra Nevada", "Central Coast", "San Joaquin Valley", "Southern California", "Desert"] },
  { label: "National", kind: "regions", value: ["National"] },
  { label: "International", kind: "regions", value: ["International"] },
];

export function CountyMap({ events, filters, setFilters }) {
  const counts = useMemo(() => {
    const c = {};
    for (const e of events) if (e.type !== "Online" && e.region) c[e.region] = (c[e.region] || 0) + 1;
    return c;
  }, [events]);
  const onlineCount = events.filter((e) => e.type === "Online").length;

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

  return (
    <div className="explore-card">
      <div className="explore-head">
        <h3>The Bay in circles</h3>
        <span>Tap a county</span>
      </div>
      <svg className="county-map" viewBox="0 0 320 395" role="group" aria-label="Filter by county">
        <path className="bay-water" d="M150 92 C 168 140 158 190 176 236 S 206 300 214 318" />
        {COUNTIES.map((c) => {
          const n = counts[c.name] || 0;
          const r = n ? 15 + 7 * Math.sqrt(n) : 12;
          const on = filters.regions.includes(c.name);
          return (
            <g
              key={c.name}
              className={`county ${on ? "on" : ""} ${n ? "has" : "none"}`}
              tabIndex={0}
              role="button"
              aria-pressed={on}
              aria-label={`${c.name}: ${n} events`}
              onClick={() => toggleRegions([c.name])}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggleRegions([c.name]))}
            >
              <circle cx={c.x} cy={c.y} r={r} />
              {n > 0 && (
                <text className="county-n" x={c.x} y={c.y + 7} textAnchor="middle">{n}</text>
              )}
              <text className="county-name" x={c.x} y={c.y + r + 14} textAnchor="middle">{c.short}</text>
            </g>
          );
        })}
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
          <button type="button" onClick={() => shift(-1)} aria-label="Previous month"><Icon name="chev-l" /></button>
          <button type="button" onClick={() => shift(1)} aria-label="Next month"><Icon name="chev-r" /></button>
        </div>
      </div>
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
    </div>
  );
}
