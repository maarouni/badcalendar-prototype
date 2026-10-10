"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import IconNav from "../components/IconNav";
import EmploymentFilterPanel from "../components/EmploymentFilterPanel";
import { HostAvatar, shortDate } from "../components/EventVisuals";
import { EMPTY_JOB_FILTERS, jobMatches, sortJobs } from "../lib/employmentTaxonomy";
import { fetchJobs } from "../lib/jobs";
import FillInHere from "../components/FillInHere";

const PAGE_SIZE = 8;

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
  const today = useMemo(() => new Date(), []);

  useEffect(() => { fetchJobs().then(setJobs); }, []);

  const filtered = useMemo(
    () => jobs.filter((j) => jobMatches(j, filters, today, null, q)),
    [jobs, filters, today, q]
  );
  const visible = useMemo(() => sortJobs(filtered, filters.sort), [filtered, filters.sort]);
  const featured = visible.filter((j) => j.premier);
  const regular = visible.filter((j) => !j.premier);

  const totalPages = Math.max(1, Math.ceil(regular.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = regular.slice((safePage - 1) * PAGE_SIZE, (safePage - 1) * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => { setPage(1); }, [filters, q]);

  return (
    <>
      <section className="section-intro">
        <IconNav active="employment" />
        <p className="section-intro-line">
          <strong>Get Alerts!</strong> Set filters to organize, submit, and view many types of <em>Careers / Jobs</em>.
          {" "}<a href="/employment/submit" className="post-listing-link">+ Post a Listing</a>
        </p>
      </section>

      <div className="page browse-page">
        <div className="layout-with-sidebar">
          <EmploymentFilterPanel jobs={jobs} filters={filters} setFilters={setFilters} today={today} q={q} />

          <div className="timeline-col">
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
              The 8 listings below are placeholders I wrote to test the layout. Click <strong>+ Post a Listing</strong> above to add a real one through the form — it'll show up here right away, same fields as these.
            </FillInHere>

            <div className="job-list">
              {[...featured, ...pageItems].map((j) => (
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

            <a href="#" className="more-premier-link" onClick={(e) => e.preventDefault()}>More Premier Listings →</a>
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
