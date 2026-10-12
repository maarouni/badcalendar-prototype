"use client";

import IconNav from "./IconNav";

// Cesar's page "template" (Oct 10 review): one layout that every section page
// copies — 4-section icon row, a title bar, a 2-line description, then the
// content. The title bar follows his color code:
//   yellow = page under construction
//   gray   = edit page / editable inputs
//   white  = output (view) page
// Usage: <PageTemplate section="employment" mode="edit" title="..." intro="...">
export default function PageTemplate({
  section,
  mode = "output", // "output" | "edit"
  status = "done", // "done" | "construction"
  title,
  subtitle,
  intro,
  actions,
  children,
  narrow = false,
}) {
  const bar = status === "construction" ? "construction" : mode;
  return (
    <div className={`tpl tpl-mode-${mode} ${narrow ? "tpl-narrow" : ""}`}>
      <IconNav active={section} mode={mode} />

      <header className={`tpl-title tpl-${bar}`}>
        <div>
          <h1>{title}</h1>
          {subtitle && <span className="tpl-subtitle">{subtitle}</span>}
        </div>
        <div className="tpl-title-right">
          {status === "construction" && <span className="tpl-flag">Under construction</span>}
          {mode === "edit" && status !== "construction" && <span className="tpl-flag tpl-flag-edit">Edit</span>}
          {actions}
        </div>
      </header>

      {intro && <p className="tpl-intro">{intro}</p>}

      <div className={`tpl-body ${mode === "edit" ? "tpl-body-edit" : ""}`}>{children}</div>

      <div className="tpl-legend" aria-label="Color legend">
        <span><i className="lg-construction" /> Under construction</span>
        <span><i className="lg-edit" /> Edit / input</span>
        <span><i className="lg-output" /> Output</span>
      </div>
    </div>
  );
}
