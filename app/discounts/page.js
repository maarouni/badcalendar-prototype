"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import PageTemplate from "../components/PageTemplate";
import DiscountFilterPanel from "../components/DiscountFilterPanel";
import { NextStep } from "../components/Steps";
import { ResultsHead, ListingTable, Pager, shortYmd } from "../components/ListingTable";
import { cityCode } from "../lib/cityCodes";
import FillInHere from "../components/FillInHere";
import SendToMasoud from "../components/SendToMasoud";
import { EMPTY_DISCOUNT_FILTERS, discountMatches, fetchDiscounts, localDiscounts, discountLabel } from "../lib/discounts";

const SEL_KEY = "mc_discount_selection_v1";
const PAGE_SIZE = 8;

const fmtDiscount = (d) =>
  `${d.offer} — ${d.company} (${d.industry})\n   ${d.description}\n   ${d.city}, ${d.region} · Redeem: ${(d.redeem || []).join(" / ")} · ${discountLabel(d)} · Expires ${d.expires}${d.premier ? " · PREMIER" : ""}`;

function DiscountsInner() {
  const [qRaw, setQRaw] = useState("");
  const q = qRaw.trim().toLowerCase();
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState(EMPTY_DISCOUNT_FILTERS);
  const [selected, setSelected] = useState({});
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
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
            <ResultsHead title="Discount / Gift Certificates" q={qRaw} setQ={setQRaw}
              showFilters={showFilters} onShowFilters={() => setShowFilters(true)} />

            <FillInHere>
              These 6 certificates are placeholders. Click <strong>+ Post a Certificate</strong> to enter real ones. They&rsquo;ll
              appear on your screen right away. When you&rsquo;re done, click <strong>Send my certificates to Masoud</strong> so I can
              make them permanent for everyone. <em>(Until we set up the database, what you post is only visible on your computer.)</em>
            </FillInHere>
            <SendToMasoud load={localDiscounts} noun="certificates" format={fmtDiscount} subject="calendarGold - my discount / gift certificates" />

            {pageItems.length === 0 && (
              <div className="empty-state">
                Nothing matches yet.{" "}
                <button type="button" className="clear-filters-link" onClick={() => setFilters(EMPTY_DISCOUNT_FILTERS)}>Clear filters</button>
              </div>
            )}

            <ListingTable rows={pageItems.map((d) => ({
              id: d.id,
              href: `/discounts/${d.id}`,
              left: [discountLabel(d), `Exp ${shortYmd(d.expires)}`],
              title: d.offer,
              lines: d.premier
                ? [d.description, <>{cityCode({ city: d.city })}, <b>{d.company}</b> · {d.industry}</>, `Redeem ${(d.redeem || []).join(" / ")}`]
                : [`${cityCode({ city: d.city })}, ${d.company}`],
              premier: d.premier,
              image: "discount",
              selected: !!selected[d.id],
              onToggle: () => toggle(d.id),
            }))} />

            <Pager page={safePage} totalPages={totalPages} onGo={(p) => setPage(Math.min(Math.max(1, p), totalPages))} />

            <NextStep noun="Certificate" digest="My Certificates Digest" digestHref="/discounts"
              detailsHref={firstSel ? `/discounts/${firstSel.id}` : "/discounts"} />
          </div>
        </div>
      </div>
    </>
  );
}

export default function DiscountsPage() {
  return <Suspense fallback={null}><DiscountsInner /></Suspense>;
}
