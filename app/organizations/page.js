"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import PageTemplate from "../components/PageTemplate";
import OrgSubNav from "../components/OrgSubNav";
import OrgFilterPanel from "../components/OrgFilterPanel";
import { StepHead, NextStep } from "../components/Steps";
import { Glyph } from "../components/Icons";
import { HostAvatar, shortDate } from "../components/EventVisuals";
import FillInHere from "../components/FillInHere";
import SendToMasoud from "../components/SendToMasoud";
import OrgStatusPicker from "../components/OrgStatusPicker";
import {
  EMPTY_ORG_FILTERS, orgMatches, fetchOrgs, localOrgs, readMembership, writeMembership, fmtMembers, fmtDues,
} from "../lib/organizations";

const SEL_KEY = "mc_org_selection_v1";
const PAGE_SIZE = 8;

const fmtOrg = (o) =>
  `${o.name}${o.premier ? " (PREMIER)" : ""}\n   ${o.tagline}\n   ${(o.formats || []).join(" / ")} · ${(o.categories || []).join(", ")} · ${o.industry}\n   ${o.city}, ${o.state || "CA"} (${o.region}) · ${fmtMembers(o.members)} · ${fmtDues(o.dues)}`;

function OrgsInner() {
  const [qRaw, setQRaw] = useState("");
  const q = qRaw.trim().toLowerCase();
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState(EMPTY_ORG_FILTERS);
  const [selected, setSelected] = useState({});
  const [membership, setMembership] = useState({});
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const today = useMemo(() => new Date(), []);
  const ctx = useMemo(() => ({ today, membership, q }), [today, membership, q]);

  useEffect(() => {
    fetchOrgs().then(setItems);
    setMembership(readMembership());
    try { setSelected(JSON.parse(localStorage.getItem(SEL_KEY) || "{}")); } catch {}
  }, []);
  useEffect(() => { setPage(1); }, [filters, q]);

  const visible = useMemo(() => {
    const list = items.filter((o) => orgMatches(o, filters, ctx));
    // Premier first, then newest posted / revised.
    return list.sort((a, b) => (!!b.premier - !!a.premier) || String(b.posted).localeCompare(String(a.posted)));
  }, [items, filters, ctx]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const firstSel = items.find((o) => selected[o.id]);

  function toggle(id) {
    const next = { ...selected, [id]: !selected[id] };
    setSelected(next);
    try { localStorage.setItem(SEL_KEY, JSON.stringify(next)); } catch {}
  }
  const setStatus = (id, s) => setMembership({ ...writeMembership(id, s) });
  const scrollToResults = () => document.getElementById("results")?.scrollIntoView({ block: "start", behavior: "smooth" });

  return (
    <>
      <PageTemplate
        section="organizations"
        title="Organization Digest"
        subtitle="Public"
        legend={false}
        subnav={<OrgSubNav active="digest" />}
        actions={<a href="/organizations/submit" className="tpl-action" data-tip="Add New organization">+ Add an Organization</a>}
        intro={<><strong>Get Connected!</strong> Select filters to curate organizations, and assign <strong>My Membership Status</strong> for each org. What is your cost of acquisition of a new member? Manage and promote your organization here!</>}
      />

      <div className={`page browse-page ${showFilters ? "" : "filters-hidden"}`}>
        <div className="layout-with-sidebar">
          {showFilters && (
            <OrgFilterPanel items={items} filters={filters} setFilters={setFilters} ctx={ctx}
              onHide={() => setShowFilters(false)} onDisplay={scrollToResults} />
          )}

          <div className="timeline-col" id="results">
            <StepHead n={3} title="My Organizations Digest" hint="Select all that apply">
              {!showFilters && (
                <button type="button" className="btn-ghost btn-sm" onClick={() => setShowFilters(true)}>
                  <Glyph name="expand" size={14} /> Display Filters
                </button>
              )}
            </StepHead>
            <div className="table-search-row">
              <label className="table-search">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input type="text" placeholder="Search organizations..." value={qRaw}
                  onChange={(e) => setQRaw(e.target.value)} aria-label="Search organizations" />
              </label>
            </div>

            <div className="results-bar">
              <div><strong>{visible.length}</strong> {visible.length === 1 ? "organization" : "organizations"} match your filters</div>
            </div>

            <FillInHere>
              These 6 organizations are placeholders. Click <strong>+ Add an Organization</strong> to enter real ones. They&rsquo;ll
              appear on your screen right away. When you&rsquo;re done, click <strong>Send my organizations to Masoud</strong> so I can
              make them permanent for everyone. <em>(Until we set up the database, what you post is only visible on your computer.)</em>
            </FillInHere>
            <SendToMasoud load={localOrgs} noun="organizations" format={fmtOrg} subject="calendarGold - my organizations" />

            {pageItems.length === 0 && (
              <div className="empty-state">
                Nothing matches yet.{" "}
                <button type="button" className="clear-filters-link" onClick={() => setFilters(EMPTY_ORG_FILTERS)}>Clear filters</button>
              </div>
            )}

            <div className="job-list">
              {pageItems.map((o) => (
                <article key={o.id} className={`job-card org-card ${o.premier ? "premier" : ""} ${selected[o.id] ? "saved" : ""}`}>
                  <HostAvatar name={o.name} size={40} />
                  <div className="job-body">
                    <div className="job-head">
                      <a href={`/organizations/${o.id}`} className="job-title">{o.name}</a>
                      {o.premier && <span className="price-chip job-premier-chip">PREMIER</span>}
                    </div>
                    <div className="disc-desc"><em>{o.tagline}</em></div>
                    {/* Premier listings show the full row; Regular (free) show name, tagline, city — per Figma */}
                    {o.premier && (
                      <>
                        <div className="job-sub">Type: {(o.formats || []).join(" / ")}</div>
                        <div className="job-sub">{(o.categories || []).join(" • ")} • {o.industry}</div>
                      </>
                    )}
                    <div className="job-meta">
                      <span>{o.city}, {o.state || "CA"}</span>
                      {o.premier && <span>{fmtMembers(o.members)} • {fmtDues(o.dues)}</span>}
                    </div>
                  </div>
                  <div className="job-side">
                    <div className="job-posted">Posted / Revised {shortDate(o.posted)}</div>
                    <div className="disc-actions">
                      <OrgStatusPicker value={membership[o.id] || ""} onChange={(s) => setStatus(o.id, s)} compact />
                      <label className="sel-radio-hit" data-tip={selected[o.id] ? "In My Selection" : "Add listing to My Selection"}>
                        <input type="checkbox" className="sel-radio" checked={!!selected[o.id]} onChange={() => toggle(o.id)} aria-label={`Select ${o.name}`} />
                      </label>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button type="button" className="pagination-btn" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
                <span className="pagination-summary">Page {safePage} of {totalPages}</span>
                <button type="button" className="pagination-btn" disabled={safePage >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            )}

            <NextStep noun="Organization" digest="My Organizations Digest" digestHref="/organizations"
              detailsHref={firstSel ? `/organizations/${firstSel.id}` : "/organizations"}
              selectedCount={Object.values(selected).filter(Boolean).length} />
          </div>
        </div>
      </div>
    </>
  );
}

export default function OrganizationsPage() {
  return <Suspense fallback={null}><OrgsInner /></Suspense>;
}
