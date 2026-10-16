"use client";

import { Glyph } from "./Icons";
import { StepBadge } from "./Steps";

// One results layout for every section (Oct 15 review), drawn from Cesar's
// "3 One Big Calendar" table:
//   (3) Title  Select all that apply       yellow bar
//   [ SEARCH ]                             gray pill
//   | left column | main column | image | o |   one row per listing
//   (<)  Page 1 of 3  (>)
// No counts ("N events coming up"), no PREMIER badges, no cart or calendar
// icons on rows — the #4 "Select one" box covers those actions. Premier
// rows are taller with an image column; a selected row turns yellow; a whole
// row links to its details page.

export function ResultsHead({ title, q, setQ, showFilters, onShowFilters }) {
  return (
    <>
      <div className="obc-bar">
        <StepBadge n={3} />
        <b>{title}</b>
        <em>Select all that apply</em>
        {!showFilters && (
          <button type="button" className="obc-show-filters" onClick={onShowFilters}>
            <Glyph name="expand" size={14} /> Filters
          </button>
        )}
      </div>
      <label className="obc-search">
        <Glyph name="search" size={18} />
        <input type="text" placeholder="SEARCH" value={q} onChange={(e) => setQ(e.target.value)} aria-label={`Search ${title}`} />
      </label>
    </>
  );
}

// rows: [{ id, href, left: [line1, line2], title, lines: [...], premier,
//          image: glyph name, barter, selected, onToggle, extra }]
export function ListingTable({ rows }) {
  if (!rows.length) return null;
  return (
    <div className="obc-table" role="list">
      {rows.map((r) => (
        <article key={r.id} role="listitem" className={`obc-row ${r.premier ? "premier" : "regular"} ${r.selected ? "selected" : ""}`}>
          <a href={r.href} className="obc-cell obc-when" tabIndex={-1}>
            {r.left.filter(Boolean).map((l, i) => <span key={i}>{l}</span>)}
          </a>
          <a href={r.href} className="obc-cell obc-main">
            <span className="obc-title">{r.title}</span>
            {r.lines.filter(Boolean).map((l, i) => <span key={i}>{l}</span>)}
            {r.barter && <span className="obc-barter" data-tip="Barter – no payment, not tracked"><Glyph name="barter" size={15} /></span>}
          </a>
          {r.premier && (
            <a href={r.href} className="obc-cell obc-img" tabIndex={-1} aria-hidden="true">
              <Glyph name={r.image || "expo"} size={34} strokeWidth={1.4} />
            </a>
          )}
          <div className="obc-cell obc-sel">
            {r.extra}
            <label className="obc-sel-hit" data-tip={r.selected ? "In My Selection" : "Add listing to My Selection"}>
              <input type="checkbox" className="sel-radio" checked={!!r.selected} onChange={r.onToggle}
                aria-label={`${r.selected ? "Remove" : "Add"} ${typeof r.title === "string" ? r.title : "listing"} ${r.selected ? "from" : "to"} My Selection`} />
            </label>
          </div>
        </article>
      ))}
    </div>
  );
}

export function Pager({ page, totalPages, onGo }) {
  return (
    <div className="obc-pager">
      <button type="button" className="obc-pg" onClick={() => onGo(page - 1)} disabled={page <= 1} aria-label="Previous page" data-tip="Previous">
        <Glyph name="prev" size={14} strokeWidth={2.4} />
      </button>
      <span>Page <b>{page}</b> of <b>{totalPages}</b></span>
      <button type="button" className="obc-pg" onClick={() => onGo(page + 1)} disabled={page >= totalPages} aria-label="Next page" data-tip="Next">
        <Glyph name="next" size={14} strokeWidth={2.4} />
      </button>
    </div>
  );
}

// "Expires Dec 31 '26" style short date for left columns.
export function shortYmd(iso) {
  const [y, m, d] = String(iso || "").split("-").map(Number);
  if (!y) return "";
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];
  return `${M} ${String(d).padStart(2, "0")} ‘${String(y).slice(2)}`;
}
