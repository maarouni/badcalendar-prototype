// Filter taxonomy — mirrors Cesar's Figma spec (rev 260923).
// Rule (spec "Matchmaking Algorithm", rev 260920): an event shows only if EVERY
// major section matches (Event Types, Dates, Costs, Regions, Categories).
// Inside a section, any selected option can match (OR).

export const EVENT_FORMATS = ["In-Person", "Online"]; // Event Types, part 1
export const EVENT_TIERS = ["Premier", "Regular"]; // Event Types, part 2

export const DATE_OPTIONS = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "7", label: "Next 7 days" },
  { id: "15", label: "Next 15 days" },
  { id: "30", label: "Next 30+ days" },
];

export const COST_OPTIONS = [
  { id: "free", label: "Free", min: 0, max: 0 },
  { id: "0-15", label: "$0 – $14.99", min: 0, max: 14.99 },
  { id: "15-30", label: "$15 – $29.99", min: 15, max: 29.99 },
  { id: "30-50", label: "$30 – $49.99", min: 30, max: 49.99 },
  { id: "50-100", label: "$50 – $99.99", min: 50, max: 99.99 },
  { id: "100+", label: "$100+", min: 100, max: Infinity },
];

export const REGION_GROUPS = [
  {
    group: "Bay Area Counties",
    options: [
      "Alameda", "Contra Costa", "Marin", "Napa", "San Francisco",
      "San Mateo", "Santa Clara", "Solano", "Sonoma",
    ],
  },
  {
    group: "California",
    options: [
      "North Coast", "Shasta Cascades", "Sacramento Valley", "Gold Country",
      "Sierra Nevada", "Central Coast", "San Joaquin Valley",
      "Southern California", "Desert",
    ],
  },
  { group: "Beyond California", options: ["National", "International"] },
];

export const CATEGORY_GROUPS = [
  {
    group: "Business, Education",
    options: [
      "Business, Financial", "Business Investor, Startup", "Career", "Conference",
      "Dinner", "Education", "Expo, Trade Show", "Meeting", "Networking",
      "Seminar, Workshop", "Team Building",
    ],
  },
  { group: "Community", options: ["Advocacy, Political", "Community", "Health", "Other"] },
  {
    group: "Cultural, Ethnic",
    options: [
      "African", "Arab, Middle Eastern", "Asian", "Black", "European",
      "Hispanic, Latino, Latinx", "Indigenous, Native Am.", "Mediterranean",
      "Pacific Islander",
    ],
  },
  {
    group: "Diversity",
    options: [
      "Age: Seniors", "Age: Youth", "Age: Children", "Female, Women", "LGBTQ+",
      "People with a Disability", "Religious, Spiritual",
    ],
  },
  {
    group: "Entertainment",
    options: [
      "Arts", "Concerts, Music", "Dancing, Nightlife", "Fashion Show",
      "Festivals, Parade", "Food, Spirits, Wine", "Party, Wedding", "Recreation",
      "Singles, Dating", "Social, Reunion", "Sports", "Travel", "Tourism",
    ],
  },
  {
    group: "Technology",
    options: [
      "AI", "Biotechnology", "Communication", "Emerging Tech", "Energy",
      "Manufacturing", "Medical", "Transportation", "Internet, IT, Web",
      "Sustainability",
    ],
  },
];

// 8-state attendance status from the spec legend.
export const ATTENDANCE_STATUSES = [
  { id: "none", icon: "⊘", label: "No Selection" },
  { id: "attending", icon: "✓", label: "Attending" },
  { id: "high", icon: ">", label: "High Probability" },
  { id: "low", icon: "~", label: "Low Probability" },
  { id: "not", icon: "N", label: "Will not attend" },
  { id: "job", icon: "J", label: "Job / Work" },
  { id: "personal", icon: "P", label: "Personal" },
  { id: "waitlist", icon: "W", label: "Waitlist / Pending" },
];

export const EMPTY_FILTERS = {
  formats: [],
  tiers: [],
  date: "all",
  costs: [],
  regions: [],
  categories: [],
};

// ---------- matching ----------

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function eventDate(e) {
  // "YYYY-MM-DD" parsed as local date (avoid UTC shift)
  const [y, m, d] = String(e.date || "").split("-").map(Number);
  if (!y) return null;
  return new Date(y, m - 1, d);
}

export function eventFormat(e) {
  return e.type === "Online" ? "Online" : "In-Person";
}

export function eventPrice(e) {
  if (typeof e.price === "number") return e.price;
  const m = String(e.cost || "").match(/\$(\d+(\.\d+)?)/);
  return m ? Number(m[1]) : 0;
}

export function eventCategories(e) {
  if (Array.isArray(e.categories) && e.categories.length) return e.categories;
  return e.category ? [e.category] : [];
}

const SECTION_TESTS = {
  formats: (e, f) => !f.formats.length || f.formats.includes(eventFormat(e)),
  tiers: (e, f) =>
    !f.tiers.length || f.tiers.includes(e.premier ? "Premier" : "Regular"),
  date: (e, f, today) => {
    if (f.date === "all") return true;
    const d = eventDate(e);
    if (!d) return false;
    const t = startOfDay(today);
    const diff = Math.round((d - t) / 86400000);
    if (f.date === "today") return diff === 0;
    if (f.date === "30") return diff >= 0; // 30+ days = everything upcoming
    return diff >= 0 && diff <= Number(f.date);
  },
  costs: (e, f) => {
    if (!f.costs.length) return true;
    const p = eventPrice(e);
    return f.costs.some((id) => {
      const o = COST_OPTIONS.find((c) => c.id === id);
      return o && p >= o.min && p <= o.max;
    });
  },
  regions: (e, f) => {
    if (!f.regions.length) return true;
    // Online events aren't tied to a place — they pass any region filter.
    if (eventFormat(e) === "Online") return true;
    return f.regions.includes(e.region);
  },
  categories: (e, f) =>
    !f.categories.length || eventCategories(e).some((c) => f.categories.includes(c)),
};

// `except` lets the sidebar count results for one section while holding the
// others fixed (so options that would return nothing can be grayed out).
export function matches(e, f, today = new Date(), except = null, q = "") {
  for (const key of Object.keys(SECTION_TESTS)) {
    if (key === except) continue;
    if (!SECTION_TESTS[key](e, f, today)) return false;
  }
  if (q) {
    const hay = `${e.title} ${e.hostedBy} ${e.city} ${eventCategories(e).join(" ")}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export function countFor(events, f, section, patch, today, q) {
  const trial = { ...f, ...patch };
  return events.filter((e) => matches(e, trial, today, null, q)).length;
}

// ---------- ordering ----------
// Premier first, then chronological by date/time (spec notes).
export function orderEvents(list) {
  return [...list].sort((a, b) => {
    if (!!b.premier - !!a.premier) return !!b.premier - !!a.premier;
    const da = `${a.date} ${a.time || ""}`;
    const db = `${b.date} ${b.time || ""}`;
    return da.localeCompare(db);
  });
}

// ---------- Google Calendar link ----------
export function googleCalendarUrl(e) {
  const d = String(e.date || "").replace(/-/g, "");
  let dates = `${d}/${d}`;
  const m = String(e.time || "").match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (d && m) {
    const pad = (x) => String(x).padStart(2, "0");
    dates = `${d}T${pad(m[1])}${m[2]}00/${d}T${pad(m[3])}${m[4]}00`;
  } else if (d) {
    const [y, mo, da] = e.date.split("-").map(Number);
    const next = new Date(y, mo - 1, da + 1);
    const n = `${next.getFullYear()}${String(next.getMonth() + 1).padStart(2, "0")}${String(next.getDate()).padStart(2, "0")}`;
    dates = `${d}/${n}`;
  }
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title || "Event",
    dates,
    ctz: "America/Los_Angeles",
    details: `${e.description || ""}\n\nHosted by ${e.hostedBy || ""} — via badcalendar`,
    location: e.type === "Online" ? "Online" : e.city || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
