"use client";

import { useState } from "react";

// Shared bottom-of-sidebar block from Cesar's wireframes: the "Add Listings to
// My ___ Digest" mode toggle, the "Actions" selector, and the Display
// Results / Submit buttons. Prototype-level — state lives here, nothing is
// wired to a real digest yet.

export default function DigestActions({ digestLabel, promptLabel }) {
  const [digestMode, setDigestMode] = useState("manual");
  const [action, setAction] = useState("view");
  const [flash, setFlash] = useState("");

  function submit(e) {
    e.preventDefault();
    if (action === "add") {
      setFlash(`Added your current selections to ${digestLabel}.`);
    } else {
      setFlash("Showing all matching results below.");
    }
    setTimeout(() => setFlash(""), 2200);
  }

  return (
    <form className="digest-actions" onSubmit={submit}>
      <div className="fp-section">
        <div className="fp-section-head fp-static-head"><span>{promptLabel}</span></div>
        <div className="fp-section-body">
          <label className="fp-option">
            <input type="radio" name="digest-mode" checked={digestMode === "manual"} onChange={() => setDigestMode("manual")} />
            <span className="fp-label">Manually <em>(default)</em></span>
          </label>
          <label className="fp-option">
            <input type="radio" name="digest-mode" checked={digestMode === "auto"} onChange={() => setDigestMode("auto")} />
            <span className="fp-label">Automatically</span>
          </label>
          <div className="fp-note fp-note-muted">This is a useful reminder to see updates.</div>
        </div>
      </div>

      <div className="fp-section">
        <div className="fp-section-head fp-static-head"><span>Actions <em>(select one at a time)</em></span></div>
        <div className="fp-section-body">
          <label className="fp-option">
            <input type="radio" name="digest-action" checked={action === "view"} onChange={() => setAction("view")} />
            <span className="fp-label">View All Selections <em>(default)</em></span>
          </label>
          <label className="fp-option">
            <input type="radio" name="digest-action" checked={action === "add"} onChange={() => setAction("add")} />
            <span className="fp-label">Add Selection(s) to: {digestLabel}</span>
          </label>
        </div>
      </div>

      <div className="fp-buttons">
        <button type="submit" className="btn-primary fp-submit-btn">
          {action === "add" ? "Submit" : "Display Results"}
        </button>
      </div>
      {flash && <div className="fp-flash fp-flash-block">{flash}</div>}
    </form>
  );
}
