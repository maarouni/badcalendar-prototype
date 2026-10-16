"use client";

import { Glyph } from "./Icons";

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

// Step 4 (Oct 15 Figma review): a yellow "Select one" box. One click goes
// straight there — no Submit button, no "0 selected" counter, no "Next Step"
// label.
export function NextStep({ noun = "Listing", digest = "My Listing Digest", digestHref = "/my-calendar", detailsHref }) {
  const options = [
    { id: "details", icon: "editMode", label: `View Selection(s) - ${noun} Details`, href: detailsHref || digestHref, def: true },
    { id: "digest", icon: "calendar", label: `View Selection(s) - EDIT ${digest}`, href: digestHref },
    { id: "signup", icon: "login", label: `Sign Up / Log In to ADD ${noun}s & EDIT ${digest}`, href: "/login" },
  ];
  return (
    <div className="next-step next-step-box">
      <div className="step-head">
        <StepBadge n={4} />
        <em className="next-step-title">Select one</em>
      </div>
      <ul className="next-step-list">
        {options.map((o) => (
          <li key={o.id}>
            <a href={o.href} className="next-step-link">
              <span className="ns-dot" aria-hidden="true" />
              <Glyph name={o.icon} size={14} />
              <span>{o.label}</span>
              {o.def && <em className="ns-default">Default</em>}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
