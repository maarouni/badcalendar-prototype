"use client";

import { Glyph } from "./Icons";

// Oct 15 Figma: collapse / expand arrows are larger and sit inside a circle,
// pointing up when the box is open and down when it is closed.
export default function CollapseArrow({ open, onClick, label }) {
  return (
    <button
      type="button"
      className="fp-arrow"
      onClick={onClick}
      aria-expanded={open}
      aria-label={`${open ? "Collapse" : "Expand"} ${label}`}
      data-tip={open ? "Collapse" : "View / Expand"}
    >
      <Glyph name={open ? "collapse" : "expand"} size={16} strokeWidth={2.4} />
    </button>
  );
}
