"use client";

import { useState } from "react";
import { Glyph } from "./Icons";
import CollapseArrow from "./CollapseArrow";
import { RATES } from "../lib/adRates";

// "Calculate Advertising Cost" from Cesar's Figma, Oct 15 version:
// a collapsible yellow bar, then Views and Clicks side by side so people can
// compare without clicking back and forth.
//   1  dates, est. reach per location, A · B · C, D = A × B × C (both columns)
//   2  compare D and pick one format
//   3  total for this Premier listing
// Rates come from app/lib/adRates.js, so the Rates pages and this calculator
// always match. Prototype: the per-location reach numbers are placeholders
// until view/click tracking exists, and nothing is charged.

const LOCATIONS = ["One Big Calendar", "My Calendars", "Notifications"];
const REACH = {
  views: { "One Big Calendar": 4200, "My Calendars": 1800, Notifications: 2600 },
  clicks: { "One Big Calendar": 180, "My Calendars": 90, Notifications: 140 },
};

function todayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function weeksBetween(startIso, endIso) {
  const ms = new Date(endIso) - new Date(startIso);
  if (!(ms > 0)) return 1;
  return Math.max(1, Math.ceil(ms / (7 * 24 * 60 * 60 * 1000)));
}

const fmt$ = (n) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);

export default function PremierCalculator({ onConfirm, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const [start, setStart] = useState(todayPlus(0));
  const [end, setEnd] = useState(todayPlus(14));
  const [format, setFormat] = useState("views");
  const [submitted, setSubmitted] = useState(false);

  const B = weeksBetween(start, end);
  const A = { views: sum(REACH.views), clicks: sum(REACH.clicks) };
  const C = { views: RATES.premierPerView, clicks: RATES.premierPerClick };
  const D = { views: A.views * B * C.views, clicks: A.clicks * B * C.clicks };

  function submit() {
    setSubmitted(true);
    onConfirm?.({ start, end, format, weeks: B, total: D[format] });
  }
  const touch = (fn) => (e) => { fn(e.target.value); setSubmitted(false); };

  return (
    <div className="calc2">
      <div className="calc2-bar">
        <Glyph name="calculate" size={30} strokeWidth={1.6} />
        <b>Calculate Advertising Cost</b>
        <CollapseArrow open={open} onClick={() => setOpen((o) => !o)} label="calculator" />
      </div>

      {open && (
        <div className="calc2-body">
          <h3>Premier Listing: Calculate My Advertising Cost</h3>

          <div className="calc2-step">
            <span className="step-badge" aria-hidden="true">1</span>
            <b>Submit below for this listing:</b>
          </div>
          <div className="calc2-dates">
            <input type="date" aria-label="Start date" value={start} onChange={touch(setStart)} />
            <input type="date" aria-label="End date" value={end} min={start} onChange={touch(setEnd)} />
            <span><b>Start and End Dates to Advertise</b><br /><i>If applicable, edit these automatically submitted dates</i></span>
          </div>

          <table className="calc2-table">
            <thead>
              <tr><th>Views</th><th>Clicks / Week</th><th>Locations</th></tr>
            </thead>
            <tbody>
              {LOCATIONS.map((l) => (
                <tr key={l}>
                  <td className="calc2-num">{REACH.views[l].toLocaleString()}</td>
                  <td className="calc2-num">{REACH.clicks[l].toLocaleString()}</td>
                  <td>{l}</td>
                </tr>
              ))}
              <tr>
                <td className="calc2-num">{A.views.toLocaleString()}</td>
                <td className="calc2-num">{A.clicks.toLocaleString()}</td>
                <td><b>A. My estimated total allotment for all locations</b></td>
              </tr>
              <tr>
                <td className="calc2-num">{B}</td>
                <td className="calc2-num">{B}</td>
                <td><b>B. # Weeks</b> <i>(rounded up)</i> <b>to Advertise</b></td>
              </tr>
              <tr>
                <td className="calc2-rate">${C.views}</td>
                <td className="calc2-rate">${C.clicks.toFixed(2)}</td>
                <td><b>C. Advertising Rates per View and per Click</b></td>
              </tr>
              <tr className="calc2-total">
                <td className={format === "views" ? "on" : ""}>{fmt$(D.views)}</td>
                <td className={format === "clicks" ? "on" : ""}>{fmt$(D.clicks)}</td>
                <td><b>D. Total:</b> <i>D = A x B x C</i></td>
              </tr>
            </tbody>
          </table>

          <div className="calc2-step">
            <span className="step-badge" aria-hidden="true">2</span>
            <b>Compare the results (D) and select one Advertising Format:</b>
          </div>
          <div className="calc2-pick">
            {[["views", "# Views of the listing"], ["clicks", "# Clicks from the listing to the Listing Details pages"]].map(([k, label]) => (
              <label key={k} className={`fp-option ${format === k ? "fp-checked" : ""}`}>
                <input type="radio" name="calc2-format" checked={format === k} onChange={() => { setFormat(k); setSubmitted(false); }} />
                <span className="fp-label">{label}</span>
              </label>
            ))}
          </div>

          <div className="calc2-step">
            <span className="step-badge" aria-hidden="true">3</span>
            <b>Total Advertising Cost for this Premier Listing</b>
          </div>
          <p className="calc2-grand">{fmt$(D[format])}</p>

          <p className="calc2-note">
            <b>NOTE:</b> Your Premier Listing is displayed until it expires <b>OR</b> its {format === "views" ? "views" : "clicks"} / week
            allotment is depleted. It will then be automatically converted into a Regular listing. Any remaining budget
            will be retained in your account.
          </p>

          <div className="calc2-actions">
            <button type="button" className="btn-primary" onClick={submit} disabled={submitted}>
              {submitted ? "✓ Submitted as Premier Listing" : "Submit as Premier Listing"}
            </button>
            <span className="nt-hint">Prototype — no payment is taken.</span>
          </div>
        </div>
      )}
    </div>
  );
}
