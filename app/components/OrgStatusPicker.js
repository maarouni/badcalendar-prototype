"use client";

import { MEMBERSHIP_STATUSES } from "../lib/organizations";

// "My Membership Status" selector: ✓ Member · > Considering to apply ·
// N Not Applicable / Not a Member. Empty = not set yet.
export default function OrgStatusPicker({ value, onChange, compact = false }) {
  const cur = MEMBERSHIP_STATUSES.find((s) => s.id === value);
  return (
    <label className={`org-status ${compact ? "org-status-compact" : ""} ${value ? `org-status-${value}` : ""}`}
      data-tip={cur ? `My Membership Status: ${cur.label}` : "Set My Membership Status"}>
      {!compact && <span className="org-status-label">My Membership Status</span>}
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label="My Membership Status">
        <option value="">{compact ? "Status…" : "— Not set —"}</option>
        {MEMBERSHIP_STATUSES.map((s) => (
          <option key={s.id} value={s.id}>{s.icon} {compact ? s.label.split(" /")[0] : s.label}</option>
        ))}
      </select>
    </label>
  );
}
