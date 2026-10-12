"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Cesar's 4-step filter page (Figma Rev 261012):
//   1 Filters  →  2 Submit / Display Results  →  3 Results  →  4 Next step
export function StepBadge({ n }) {
  return <span className="step-badge" aria-hidden="true">{n}</span>;
}

export function StepHead({ n, title, hint, children }) {
  return (
    <div className="step-head">
      <StepBadge n={n} />
      <span className="step-title">{title}</span>
      {hint && <em className="step-hint">{hint}</em>}
      {children && <span className="step-right">{children}</span>}
    </div>
  );
}

// Step 4: "Select one — View Selection(s) / EDIT My Digest / Sign Up / Log In"
export function NextStep({ noun = "Event", digest = "My Calendar Digest", digestHref = "/my-calendar", detailsHref, selectedCount = 0 }) {
  const router = useRouter();
  const [pick, setPick] = useState("details");
  const options = [
    { id: "details", label: `View Selection(s) – ${noun} Details`, def: true },
    { id: "digest", label: `View Selection(s) – EDIT ${digest}` },
    { id: "signup", label: `Sign Up / Log In to ADD ${noun}s & EDIT ${digest}` },
  ];
  function go(e) {
    e.preventDefault();
    if (pick === "details") router.push(detailsHref || digestHref);
    else if (pick === "digest") router.push(digestHref);
    else router.push("/login");
  }
  return (
    <form className="next-step" onSubmit={go}>
      <StepHead n={4} title="Next Step" hint="Select one" />
      <div className="next-step-body">
        {options.map((o) => (
          <label key={o.id} className="fp-option">
            <input type="radio" name="next-step" checked={pick === o.id} onChange={() => setPick(o.id)} />
            <span className="fp-label">{o.label}{o.def && <em> (default)</em>}</span>
          </label>
        ))}
        <div className="next-step-foot">
          <span className="nt-hint">{selectedCount} selected</span>
          <button type="submit" className="btn-primary btn-sm">Submit</button>
        </div>
      </div>
    </form>
  );
}
