"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import PageTemplate from "../components/PageTemplate";
import OrgSubNav from "../components/OrgSubNav";
import OrgFilterPanel from "../components/OrgFilterPanel";
import { NextStep } from "../components/Steps";
import { ResultsHead, ListingTable, Pager, shortYmd } from "../components/ListingTable";
import { cityCode } from "../lib/cityCodes";
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
            <ResultsHead title="My Organizations Digest" q={qRaw} setQ={setQRaw}
              showFilters={showFilters} onShowFilters={() => setShowFilters(true)} />

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

            <ListingTable rows={pageItems.map((o) => ({
              id: o.id,
              href: `/organizations/${o.id}`,
              left: [`Revised ${shortYmd(o.posted)}`, o.premier ? fmtMembers(o.members) : null],
              title: o.name,
              lines: o.premier
                ? [<i key="t">{o.tagline}</i>, `${cityCode({ city: o.city })}, ${(o.formats || []).join(" / ")}`, `${(o.categories || []).join(" • ")} • ${o.industry}`, fmtDues(o.dues)]
                : [`${cityCode({ city: o.city })}, ${o.tagline}`],
              premier: o.premier,
              image: "organizations",
              selected: !!selected[o.id],
              onToggle: () => toggle(o.id),
              extra: <OrgStatusPicker value={membership[o.id] || ""} onChange={(st) => setStatus(o.id, st)} compact />,
            }))} />

            <Pager page={safePage} totalPages={totalPages} onGo={(p) => setPage(Math.min(Math.max(1, p), totalPages))} />

            <NextStep noun="Organization" digest="My Organizations Digest" digestHref="/organizations"
              detailsHref={firstSel ? `/organizations/${firstSel.id}` : "/organizations"} />
          </div>
        </div>
      </div>
    </>
  );
}

export default function OrganizationsPage() {
  return <Suspense fallback={null}><OrgsInner /></Suspense>;
}
