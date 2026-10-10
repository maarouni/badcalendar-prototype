"use client";

import { useMemo, useState } from "react";

// Cesar's spec (Figma, Oct 9 rev): "Premier Listing: Calculate My Advertising
// Cost" — D = A x B x C, where A = estimated total allotment across
// locations, B = # weeks (rounded up) to advertise, C = the rate per view or
// per click. Prototype-level: the per-location allotments are placeholder
// numbers (real tracking needs the "# views / # clicks" counter he also
// asked for) — but the math, inputs and layout match his wireframe.

const RATE = { views: 0.005, clicks: 0.35 };

// Placeholder weekly reach per location, per format — swap for real counts
// once view/click tracking exists.
const ALLOTMENT = {
  views: { "One Big Calendar": 4200, "My Calendars": 1800, Notifications: 2600 },
  clicks: { "One Big Calendar": 180, "My Calendars": 90, Notifications: 140 },
};

function todayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function weeksBetween(startIso, endIso) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const ms = end - start;
  if (!(ms > 0)) return 1;
  return Math.max(1, Math.ceil(ms / (7 * 24 * 60 * 60 * 1000)));
}

export default function PremierCalculator({ onConfirm }) {
  const [start, setStart] = useState(todayPlus(0));
  const [end, setEnd] = useState(todayPlus(14));
  const [format, setFormat] = useState("views");
  const [paid, setPaid] = useState(false);
  const [flash, setFlash] = useState("");

  const weeks = weeksBetween(start, end);
  const allotment = ALLOTMENT[format];
  const perWeekTotal = useMemo(
    () => Object.values(allotment).reduce((a, b) => a + b, 0),
    [allotment]
  );
  const A = perWeekTotal; // estimated total allotment across locations, per week
  const B = weeks;
  const C = RATE[format];
  const D = A * B * C;

  function submitPayment(e) {
    e.preventDefault();
    setPaid(true);
    setFlash(`Payment of $${D.toFixed(2)} recorded (prototype — no real charge). Your listing is marked Premier through ${end}.`);
    onConfirm?.({ start, end, format, weeks, total: D });
    setTimeout(() => setFlash(""), 6000);
  }

  return (
    <div className="prem-calc">
      <div className="prem-calc-head">
        <b>Calculate My Advertising Cost</b>
        <span className="nt-hint">Start/end dates, your estimated reach, and the rate — same formula as his wireframe: D = A × B × C.</span>
      </div>

      <div className="prem-calc-row">
        <label className="ed-field">
          <span className="ed-label">Start date</span>
          <input type="date" value={start} onChange={(e) => { setStart(e.target.value); setPaid(false); }} />
        </label>
        <label className="ed-field">
          <span className="ed-label">End date</span>
          <input type="date" value={end} min={start} onChange={(e) => { setEnd(e.target.value); setPaid(false); }} />
        </label>
      </div>

      <div className="prem-calc-row">
        <span className="ed-label">Advertising format</span>
        <div className="prem-calc-seg">
          {["views", "clicks"].map((f) => (
            <label key={f} className="fp-option">
              <input type="radio" name="prem-format" checked={format === f} onChange={() => { setFormat(f); setPaid(false); }} />
              <span className="fp-label">
                {f === "views" ? "# Views of the listing" : "# Clicks to Listing Details"} <em>(${RATE[f]}/{f === "views" ? "view" : "click"})</em>
              </span>
            </label>
          ))}
        </div>
      </div>

      <table className="prem-calc-table">
        <thead>
          <tr><th>Location</th><th>Est. {format} / week</th></tr>
        </thead>
        <tbody>
          {Object.entries(allotment).map(([loc, n]) => (
            <tr key={loc}><td>{loc}</td><td>{n.toLocaleString()}</td></tr>
          ))}
        </tbody>
        <tfoot>
          <tr><td>A &middot; My estimated total allotment (all locations, per week)</td><td>{A.toLocaleString()}</td></tr>
          <tr><td>B &middot; # Weeks (rounded up) to advertise</td><td>{B}</td></tr>
          <tr><td>C &middot; Rate per {format === "views" ? "view" : "click"}</td><td>${C}</td></tr>
          <tr className="prem-calc-total"><td>D &middot; Total advertising cost (D = A × B × C)</td><td>${D.toFixed(2)}</td></tr>
        </tfoot>
      </table>

      <button type="button" className="btn-primary" onClick={submitPayment} disabled={paid}>
        {paid ? "✓ Payment submitted (prototype)" : `Submit payment — $${D.toFixed(2)}`}
      </button>
      {flash && <div className="fp-flash fp-flash-block">{flash}</div>}
      <p className="nt-hint">
        Your Premier listing shows until it expires or its {format}/week allotment is used up, then it converts to a
        Regular listing. Any remaining budget stays in your account.
      </p>
    </div>
  );
}
