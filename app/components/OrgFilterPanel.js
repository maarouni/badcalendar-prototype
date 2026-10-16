"use client";

import { FilterShell, Box, Option, CheckList, DateBox, GroupedBox, DigestBox, RegionBoxes } from "./FilterKit";
import {
  DATE_POSTED_OPTIONS, ORG_FORMATS, ORG_TIERS, MEMBER_OPTIONS, DUES_OPTIONS, MEMBERSHIP_STATUSES,
  CATEGORY_GROUPS, INDUSTRIES, REGION_GROUPS, EMPTY_ORG_FILTERS, countOrgsFor,
} from "../lib/organizations";

// Organizations filters — same shared structure as One Big Calendar.
export default function OrgFilterPanel({ items, filters, setFilters, ctx, onHide, onDisplay }) {
  const count = (key, v) => countOrgsFor(items, filters, { [key]: key === "posted" ? v : [v] }, ctx);
  const kit = { filters, setFilters, count };
  return (
    <FilterShell onHide={onHide} onClear={() => setFilters(EMPTY_ORG_FILTERS)} onDisplay={onDisplay}>
      <DateBox title="Date Posted / Revised" field="posted" fromKey="postedFrom" toKey="postedTo" options={DATE_POSTED_OPTIONS} {...kit} />
      <Box title="Organization Types">
        <Option type="radio" name="all-org-types" checked={!filters.formats.length && !filters.tiers.length}
          onChange={() => setFilters((f) => ({ ...f, formats: [], tiers: [] }))} label="All" def />
        <CheckList field="formats" options={ORG_FORMATS} all={false} {...kit} />
        <div className="fp-gap" />
        <CheckList field="tiers" options={ORG_TIERS} all={false} {...kit} />
      </Box>
      <Box title="# Members"><CheckList field="members" options={MEMBER_OPTIONS} {...kit} /></Box>
      <Box title="Annual Dues"><CheckList field="dues" options={DUES_OPTIONS} {...kit} /></Box>
      <Box title="My Membership Status"><CheckList field="status" options={MEMBERSHIP_STATUSES} {...kit} /></Box>
      <DigestBox digest="My Organizations Digest" />
      <GroupedBox title="Categories" field="categories" groups={CATEGORY_GROUPS} {...kit} />
      <Box title="Industries" defaultOpen={filters.industry.length > 0}>
        <CheckList field="industry" options={INDUSTRIES} {...kit} />
      </Box>
      <RegionBoxes field="region" groups={REGION_GROUPS} {...kit} />
    </FilterShell>
  );
}
