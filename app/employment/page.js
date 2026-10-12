"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import PageTemplate from "../components/PageTemplate";
import { StepHead, NextStep } from "../components/Steps";
import { Glyph } from "../components/Icons";
import EmploymentFilterPanel from "../components/EmploymentFilterPanel";
import { HostAvatar, shortDate } from "../components/EventVisuals";
import { EMPTY_JOB_FILTERS, jobMatches, sortJobs } from "../lib/employmentTaxonomy";
import { fetchJobs } from "../lib/jobs";
import FillInHere from "../components/FillInHere";
import SendToMasoud from "../components/SendToMasoud";
import { localJobs } from "../lib/jobs";

const fmtJob = (j) =>
  `${j.title} — ${j.company} (${j.industry})\n   ${j.city}, ${j.region} · ${j.level} · ${(j.types || []).join(", ")}\n   Pay: ${compLabel(j)} · Posted ${j.posted}${j.premier ? " · PREMIER" : ""}`;

const PAGE_SIZE = 8;
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
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") || "").toLowerCase();

  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState(EMPTY_JOB_FILTERS);
  const [page, setPage] = useState(1);
  const [showAllPremier, setShowAllPremier] = useState(false);
  const today = useMemo(() => new Date(), []);
  const [showFilters, setShowFilters] = useState(true);
  const scrollToResults = () => document.getElementById("results")?.scrollIntoView({ block: "start", behavior: "smooth" });

  useEffect(() => { fetchJobs().then(setJobs); }, []);

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
            <StepHead n={3} title="Results">
              {!showFilters && (
                <button type="button" className="btn-ghost btn-sm" onClick={() => setShowFilters(true)}>
                  <Glyph name="expand" size={14} /> Display Filters
                </button>
              )}
            </StepHead>
            <div className="results-bar">
              <div>
                <strong>{visible.length}</strong> {visible.length === 1 ? "listing" : "listings"} match your filters
              </div>
            </div>

            {pageItems.length === 0 && featured.length === 0 && (
              <div className="empty-state">
                Nothing matches yet.{" "}
                <button type="button" className="clear-filters-link" onClick={() => setFilters(EMPTY_JOB_FILTERS)}>Clear filters</button>{" "}
                to see every listing.
              </div>
            )}

            <FillInHere>
              These 8 listings are placeholders. Click <strong>+ Post a Listing</strong> to enter real ones. They&rsquo;ll appear on
              your screen right away. When you&rsquo;re done, click <strong>Send my listings to Masoud</strong> so I can make them
              permanent for everyone. <em>(Until we set up the database, listings you post are only visible on your computer.)</em>
            </FillInHere>

            <SendToMasoud load={localJobs} noun="listings" format={fmtJob} subject="calendarGold - my employment listings" />

            <div className="job-list">
              {[...featuredShown, ...pageItems].map((j) => (
                <article key={j.id} className={`job-card ${j.premier ? "premier" : ""}`}>
                  <HostAvatar name={j.company} size={40} />
                  <div className="job-body">
                    <div className="job-head">
                      <a href={`#job-${j.id}`} className="job-title">{j.title}</a>
                      {j.premier && <span className="price-chip job-premier-chip">PREMIER</span>}
                    </div>
                    <div className="job-sub">{j.industry} · {j.company}</div>
                    <div className="job-meta">
                      <span>{j.city}, {j.region}</span>
                      <span>{j.level}</span>
                      <span>{j.types.join(", ")}</span>
                    </div>
                  </div>
                  <div className="job-side">
                    <div className="job-comp">{compLabel(j)}</div>
                    <div className="job-posted">Posted {shortDate(j.posted)}</div>
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
