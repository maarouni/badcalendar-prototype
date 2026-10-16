"use client";

import { FilterShell, Box, Option, CheckList, DateBox, GroupedBox, DigestBox, RegionBoxes } from "./FilterKit";
import { DATE_OPTIONS, COST_OPTIONS, REGION_GROUPS, CATEGORY_GROUPS, EMPTY_FILTERS, countFor } from "../lib/taxonomy";

// One Big Calendar filters — built from the shared FilterKit so every section
// page has the same structure (Cesar's Oct 15 review).
export default function FilterPanel({ events, filters, setFilters, today, q, onHide, onDisplay }) {
  const count = (section, value) =>
    countFor(events, filters, section, { [section]: section === "date" ? value : [value] }, today, q);
  const onlineOnly = filters.formats.length === 1 && filters.formats[0] === "Online";
  const kit = { filters, setFilters, count };

  return (
    <FilterShell onHide={onHide} onClear={() => setFilters(EMPTY_FILTERS)} onDisplay={onDisplay}>
      <DateBox field="date" fromKey="dateFrom" toKey="dateTo" options={DATE_OPTIONS} {...kit} />

      <Box title="Event Types">
        <Option type="radio" name="all-types" checked={!filters.formats.length && !filters.tiers.length}
          onChange={() => setFilters((f) => ({ ...f, formats: [], tiers: [] }))} label="All" def />
        <CheckList field="formats" options={[{ id: "In-Person", label: "In-Person" }, { id: "Online", label: "Online / Virtual" }]} all={false} {...kit} />
        <div className="fp-gap" />
        <CheckList field="tiers" options={["Premier", "Regular"]} all={false} {...kit} />
      </Box>

      <Box title="Event Costs">
        <CheckList field="costs" options={COST_OPTIONS} {...kit} />
      </Box>

      <DigestBox digest="My Listings Digest" />

      <GroupedBox title="Categories" field="categories" groups={CATEGORY_GROUPS} {...kit} />

      <RegionBoxes field="regions" groups={REGION_GROUPS} disabled={onlineOnly}
        note={onlineOnly ? "Online only is selected — regions don't apply." : null} {...kit} />
    </FilterShell>
  );
}
