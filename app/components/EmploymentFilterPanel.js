"use client";

import { useState } from "react";
import {
  COMP_OPTIONS,
  SORT_OPTIONS,
  DATE_POSTED_OPTIONS,
  EMPLOYMENT_LEVELS,
  EMPLOYMENT_TYPES,
  REGION_GROUPS,
  INDUSTRIES,
  EMPTY_JOB_FILTERS,
  countJobsFor,
} from "../lib/employmentTaxonomy";
import { FilterShell, Box, Option, CheckList, DateBox, DigestBox, RegionBoxes } from "./FilterKit";

// Employment filters — same shared structure as One Big Calendar.
export default function EmploymentFilterPanel({ jobs, filters, setFilters, today, q, onHide, onDisplay }) {
  const count = (section, value) =>
    countJobsFor(jobs, filters, section, { [section]: section === "posted" ? value : [value] }, today, q);
  const kit = { filters, setFilters, count };
  return (
    <FilterShell onHide={onHide} onClear={() => setFilters(EMPTY_JOB_FILTERS)} onDisplay={onDisplay}>
      <DateBox title="Date Posted" field="posted" fromKey="postedFrom" toKey="postedTo" options={DATE_POSTED_OPTIONS} {...kit} />
      <Box title="Minimum Compensation"><CheckList field="comp" options={COMP_OPTIONS} {...kit} /></Box>
      <Box title="Sort by" hint="Select one" defaultOpen={false}>
        {SORT_OPTIONS.map((o) => (
          <Option key={o.id} type="radio" name="emp-sort" checked={filters.sort === o.id}
            onChange={() => setFilters((f) => ({ ...f, sort: o.id }))} label={o.label} def={o.id === "posted"} />
        ))}
      </Box>
      <Box title="Employment Level"><CheckList field="level" options={EMPLOYMENT_LEVELS} {...kit} /></Box>
      <Box title="Employment Types"><CheckList field="type" options={EMPLOYMENT_TYPES} {...kit} /></Box>
      <DigestBox digest="My Employment Digest" />
      <Box title="Industry(ies)" defaultOpen={filters.industry.length > 0}>
        <CheckList field="industry" options={INDUSTRIES} {...kit} />
        <SubmitIndustry />
      </Box>
      <RegionBoxes field="region" groups={REGION_GROUPS} {...kit} />
    </FilterShell>
  );
}

function SubmitIndustry() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  return (
    <div className="fp-submit-here">
      {!open && !sent && (
        <button type="button" className="link-btn" onClick={() => setOpen(true)}>+ Submit Here (suggest an industry)</button>
      )}
      {open && !sent && (
        <form
          className="fp-submit-form"
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
        >
          <input type="text" placeholder="Industry name" required />
          <button type="submit" className="btn-primary btn-sm">Submit</button>
        </form>
      )}
      {sent && <div className="fp-flash">Thanks — sent for review.</div>}
    </div>
  );
}
