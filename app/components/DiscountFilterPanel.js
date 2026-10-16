"use client";

import { FilterShell, Box, CheckList, DateBox, DigestBox, RegionBoxes } from "./FilterKit";
import {
  DATE_POSTED_OPTIONS, REDEEM_OPTIONS, DISCOUNT_OPTIONS, INDUSTRIES, REGION_GROUPS,
  EMPTY_DISCOUNT_FILTERS, countDiscountsFor,
} from "../lib/discounts";

// Discount / Gift Certificates filters — same shared structure as One Big Calendar.
export default function DiscountFilterPanel({ items, filters, setFilters, today, q, onHide, onDisplay }) {
  const count = (key, v) => countDiscountsFor(items, filters, { [key]: key === "posted" ? v : [v] }, today, q);
  const kit = { filters, setFilters, count };
  return (
    <FilterShell onHide={onHide} onClear={() => setFilters(EMPTY_DISCOUNT_FILTERS)} onDisplay={onDisplay}>
      <DateBox title="Date Posted" field="posted" fromKey="postedFrom" toKey="postedTo" options={DATE_POSTED_OPTIONS} {...kit} />
      <Box title="Redeem Certificate">
        <CheckList field="redeem" options={REDEEM_OPTIONS} {...kit} />
      </Box>
      <Box title="Discount">
        <CheckList field="value" options={DISCOUNT_OPTIONS} {...kit} />
      </Box>
      <DigestBox digest="My Certificates Digest" />
      <Box title="Industries" defaultOpen={filters.industry.length > 0}>
        <CheckList field="industry" options={INDUSTRIES} {...kit} />
      </Box>
      <RegionBoxes field="region" groups={REGION_GROUPS} {...kit} />
    </FilterShell>
  );
}
