"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import PageTemplate from "../components/PageTemplate";
import { NextStep } from "../components/Steps";
import { ResultsHead, ListingTable, Pager, shortYmd } from "../components/ListingTable";
import { cityCode } from "../lib/cityCodes";
import EmploymentFilterPanel from "../components/EmploymentFilterPanel";
import { EMPTY_JOB_FILTERS, jobMatches, sortJobs } from "../lib/employmentTaxonomy";
import { fetchJobs } from "../lib/jobs";
import FillInHere from "../components/FillInHere";
import SendToMasoud from "../components/SendToMasoud";
import { localJobs } from "../lib/jobs";

const fmtJob = (j) =>
  `${j.title} — ${j.company} (${j.industry})\n   ${j.city}, ${j.region} · ${j.level} · ${(j.types || []).join(", ")}\n   Pay: ${compLabel(j)} · Posted ${j.posted}${j.premier ? " · PREMIER" : ""}`;

const PAGE_SIZE = 8;
const SEL_KEY = "mc_job_selection_v1";
const FEATURED_CAP = 1; // how many Premier listings show before "More Premier Listings" is needed

function compLabel(j) {
  if (j.compType === "none") return "No Response";
  if (j.compType === "volunteer") return "Volunteer";
  const suffix = j.compType === "hourly" ? "/hr" : j.compType === "monthly" ? "/mo" : "/yr";
  if (!j.compMax) return "—";
  return j.compMin && j.compMin !== j.compMax
    ? `$${j.compMin.toLocaleString()}–$${j.compMax.toLocaleString()}${suffix}`
    : `$${j.compMax.toLocaleString()}${suffix}`;
}

function EmploymentInner() {
  const [qRaw, setQRaw] = useState("");
  const q = qRaw.trim().toLowerCase();

  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState(EMPTY_JOB_FILTERS);
  const [page, setPage] = useState(1);
  const [showAllPremier, setShowAllPremier] = useState(false);
  const today = useMemo(() => new Date(), []);
  const [showFilters, setShowFilters] = useState(true);
  const scrollToResults = () => document.getElementById("results")?.scrollIntoView({ block: "start", behavior: "smooth" });

  const [selected, setSelected] = useState({});
  useEffect(() => {
    fetchJobs().then(setJobs);
    try { setSelected(JSON.parse(localStorage.getItem(SEL_KEY) || "{}")); } catch {}
  }, []);
  function toggle(id) {
    const next = { ...selected, [id]: !selected[id] };
    setSelected(next);
    try { localStorage.setItem(SEL_KEY, JSON.stringify(next)); } catch {}
  }

  const filtered = useMemo(
    () => jobs.filter((j) => jobMatches(j, filters, today, null, q)),
    [jobs, filters, today, q]
  );
  const visible = useMemo(() => sortJobs(filtered, filters.sort), [filtered, filters.sort]);
  const featured = visible.filter((j) => j.premier);
  const regular = visible.filter((j) => !j.premier);
  const hasMorePremier = featured.length > FEATURED_CAP;
  const featuredShown = showAllPremier ? featured : featured.slice(0, FEATURED_CAP);

  const totalPages = Math.max(1, Math.ceil(regular.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = regular.slice((safePage - 1) * PAGE_SIZE, (safePage - 1) * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => { setPage(1); }, [filters, q]);
  useEffect(() => { setShowAllPremier(false); }, [filters, q]);

  return (
    <>
      <PageTemplate
        section="employment"
        title="Employment Listings"
        subtitle="Public"
        legend={false}
        actions={<a href="/employment/submit" className="tpl-action" data-tip="Add New listing">+ Post a Listing</a>}
        intro={<><strong>Get Hired!</strong> Select filters to curate (organize, submit, view) employment listings. Assign your Application Status for each listing.</>}
      />

      <div className={`page browse-page ${showFilters ? "" : "filters-hidden"}`}>
        <div className="layout-with-sidebar">
          {showFilters && (
            <EmploymentFilterPanel jobs={jobs} filters={filters} setFilters={setFilters} today={today} q={q}
              onHide={() => setShowFilters(false)} onDisplay={scrollToResults} />
          )}

          <div className="timeline-col" id="results">
            <ResultsHead title="Employment Listings" q={qRaw} setQ={setQRaw}
              showFilters={showFilters} onShowFilters={() => setShowFilters(true)} />

            <FillInHere>
              These 8 listings are placeholders. Click <strong>+ Post a Listing</strong> to enter real ones. They&rsquo;ll appear on
              your screen right away. When you&rsquo;re done, click <strong>Send my listings to Masoud</strong> so I can make them
              permanent for everyone. <em>(Until we set up the database, listings you post are only visible on your computer.)</em>
            </FillInHere>
            <SendToMasoud load={localJobs} noun="listings" format={fmtJob} subject="calendarGold - my employment listings" />

            {pageItems.length === 0 && featured.length === 0 && (
              <div className="empty-state">
                Nothing matches yet.{" "}
                <button type="button" className="clear-filters-link" onClick={() => setFilters(EMPTY_JOB_FILTERS)}>Clear filters</button>{" "}
                to see every listing.
              </div>
            )}

            <ListingTable rows={[...featuredShown, ...pageItems].map((j) => ({
              id: j.id,
              href: `#job-${j.id}`,
              left: [compLabel(j), `Posted ${shortYmd(j.posted)}`],
              title: j.title,
              lines: j.premier
                ? [<>{cityCode({ city: j.city })}, <b>{j.company}</b> · {j.industry}</>, j.level, (j.types || []).join(", ")]
                : [`${cityCode({ city: j.city })}, ${j.company}`],
              premier: j.premier,
              image: "employment",
              selected: !!selected[j.id],
              onToggle: () => toggle(j.id),
            }))} />

            <Pager page={safePage} totalPages={totalPages} onGo={(p) => setPage(Math.min(Math.max(1, p), totalPages))} />

            {(hasMorePremier || showAllPremier) && (
              <button
                type="button"
                className="more-premier-link"
                onClick={() => setShowAllPremier((v) => !v)}
              >
                {showAllPremier
                  ? "← Show fewer Premier listings"
                  : `More Premier Listings (${featured.length - FEATURED_CAP} more) →`}
              </button>
            )}

            <NextStep noun="Listing" digest="My Employment Digest" digestHref="/employment" detailsHref="/employment" />
          </div>
        </div>
      </div>
    </>
  );
}

export default function EmploymentPage() {
  return (
    <Suspense fallback={null}>
      <EmploymentInner />
    </Suspense>
  );
}
