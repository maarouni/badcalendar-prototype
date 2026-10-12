"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import PageTemplate from "../components/PageTemplate";
import DiscountFilterPanel from "../components/DiscountFilterPanel";
import { StepHead, NextStep } from "../components/Steps";
import { Glyph, IconButton } from "../components/Icons";
import { HostAvatar, shortDate } from "../components/EventVisuals";
import FillInHere from "../components/FillInHere";
import SendToMasoud from "../components/SendToMasoud";
import { EMPTY_DISCOUNT_FILTERS, discountMatches, fetchDiscounts, localDiscounts, discountLabel } from "../lib/discounts";
import { addToCart } from "../lib/cart";

const SEL_KEY = "mc_discount_selection_v1";
const PAGE_SIZE = 8;

const fmtDiscount = (d) =>
  `${d.offer} — ${d.company} (${d.industry})\n   ${d.description}\n   ${d.city}, ${d.region} · Redeem: ${(d.redeem || []).join(" / ")} · ${discountLabel(d)} · Expires ${d.expires}${d.premier ? " · PREMIER" : ""}`;

function DiscountsInner() {
  const q = (useSearchParams().get("q") || "").toLowerCase();
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState(EMPTY_DISCOUNT_FILTERS);
  const [selected, setSelected] = useState({});
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [flash, setFlash] = useState("");
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    fetchDiscounts().then(setItems);
    try { setSelected(JSON.parse(localStorage.getItem(SEL_KEY) || "{}")); } catch {}
  }, []);
  useEffect(() => { setPage(1); }, [filters, q]);

  const visible = useMemo(() => {
    const list = items.filter((d) => discountMatches(d, filters, today, q));
    // Premier first, then newest posted.
    return list.sort((a, b) => (!!b.premier - !!a.premier) || String(b.posted).localeCompare(String(a.posted)));
  }, [items, filters, today, q]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const firstSel = items.find((d) => selected[d.id]);

  function toggle(id) {
    const next = { ...selected, [id]: !selected[id] };
    setSelected(next);
    try { localStorage.setItem(SEL_KEY, JSON.stringify(next)); } catch {}
  }
  function cart(d) {
    addToCart({ kind: "discounts", refId: d.id, title: d.offer, when: `${d.company} · expires ${d.expires}`, price: 0 });
    setFlash(`"${d.offer}" added to My Shopping Cart`);
    setTimeout(() => setFlash(""), 2200);
  }
  const scrollToResults = () => document.getElementById("results")?.scrollIntoView({ block: "start", behavior: "smooth" });

  return (
    <>
      <PageTemplate
        section="discounts"
        title="Discount / Gift Certificates"
        subtitle="Public"
        legend={false}
        actions={<a href="/discounts/submit" className="tpl-action" data-tip="Add New certificate">+ Post a Certificate</a>}
        intro={<><strong>Save Money!</strong> Select filters to curate (organize, submit, view) discount / gift certificates. Gift them for yourself, your clients, colleagues, family and friends!</>}
      />

      <div className={`page browse-page ${showFilters ? "" : "filters-hidden"}`}>
        <div className="layout-with-sidebar">
          {showFilters && (
            <DiscountFilterPanel items={items} filters={filters} setFilters={setFilters} today={today} q={q}
              onHide={() => setShowFilters(false)} onDisplay={scrollToResults} />
          )}

          <div className="timeline-col" id="results">
            <StepHead n={3} title="Results" hint="Select certificates with the circle on the right">
              {!showFilters && (
                <button type="button" className="btn-ghost btn-sm" onClick={() => setShowFilters(true)}>
                  <Glyph name="expand" size={14} /> Display Filters
                </button>
              )}
            </StepHead>
            <div className="results-bar">
              <div><strong>{visible.length}</strong> {visible.length === 1 ? "certificate" : "certificates"} match your filters</div>
            </div>

            <FillInHere>
              These 6 certificates are placeholders. Click <strong>+ Post a Certificate</strong> to enter real ones. They&rsquo;ll
              appear on your screen right away. When you&rsquo;re done, click <strong>Send my certificates to Masoud</strong> so I can
              make them permanent for everyone. <em>(Until we set up the database, what you post is only visible on your computer.)</em>
            </FillInHere>
            <SendToMasoud load={localDiscounts} noun="certificates" format={fmtDiscount} subject="calendarGold - my discount / gift certificates" />
            {flash && <div className="fp-flash fp-flash-block">{flash}</div>}

            {pageItems.length === 0 && (
              <div className="empty-state">
                Nothing matches yet.{" "}
                <button type="button" className="clear-filters-link" onClick={() => setFilters(EMPTY_DISCOUNT_FILTERS)}>Clear filters</button>
              </div>
            )}

            <div className="job-list">
              {pageItems.map((d) => (
                <article key={d.id} className={`job-card disc-card ${d.premier ? "premier" : ""} ${selected[d.id] ? "saved" : ""}`}>
                  <HostAvatar name={d.company} size={40} />
                  <div className="job-body">
                    <div className="job-head">
                      <a href={`/discounts/${d.id}`} className="job-title">{d.offer}</a>
                      {d.premier && <span className="price-chip job-premier-chip">PREMIER</span>}
                    </div>
                    <div className="disc-desc">{d.description}</div>
                    <div className="job-sub">{d.industry} · {d.company}</div>
                    <div className="job-meta">
                      <span>{d.city}, {d.state || "CA"}</span>
                      <span>Redeem {(d.redeem || []).join(" / ")}</span>
                    </div>
                  </div>
                  <div className="job-side">
                    <div className="job-comp">{discountLabel(d)}</div>
                    <div className="job-posted">Expires {shortDate(d.expires)}</div>
                    <div className="job-posted">Posted {shortDate(d.posted)}</div>
                    <div className="disc-actions">
                      <IconButton name="cartAdd" size={16} tip="Add certificate to My Shopping Cart" onClick={() => cart(d)} />
                      <label className="sel-radio-hit" data-tip={selected[d.id] ? "In My Selection" : "Add listing to My Selection"}>
                        <input type="checkbox" className="sel-radio" checked={!!selected[d.id]} onChange={() => toggle(d.id)} aria-label={`Select ${d.offer}`} />
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

            <NextStep noun="Certificate" digest="My Certificates Digest" digestHref="/discounts"
              detailsHref={firstSel ? `/discounts/${firstSel.id}` : "/discounts"}
              selectedCount={Object.values(selected).filter(Boolean).length} />
          </div>
        </div>
      </div>
    </>
  );
}

export default function DiscountsPage() {
  return <Suspense fallback={null}><DiscountsInner /></Suspense>;
}
