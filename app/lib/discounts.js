// Discount / Gift Certificates — fields and filters from Cesar's Figma
// (calendarGold.com Discount / Gift Certificates, Rev 261012):
//   list row: Offer · one-line description · Redeem In-Person / Online ·
//             Industry • Company · City, State · Discount $ · Expires · Posted
//   filters:  Date Posted · Redeem Certificate · Discount ($ buckets) ·
//             Industries · Regions (4 groups)
import { REGION_GROUPS } from "./taxonomy";
import { INDUSTRIES } from "./employmentTaxonomy";

export { REGION_GROUPS, INDUSTRIES };

export const REDEEM_OPTIONS = ["In-Person", "Online"];

export const DISCOUNT_OPTIONS = [
  { id: "free", label: "Free", min: 0, max: 0 },
  { id: "0-15", label: "$ 0 - $ 14.99", min: 0.01, max: 14.99 },
  { id: "15-30", label: "$ 15 - $ 29.99", min: 15, max: 29.99 },
  { id: "30-50", label: "$ 30 - $ 49.99", min: 30, max: 49.99 },
  { id: "50-100", label: "$ 50 - $ 99.99", min: 50, max: 99.99 },
  { id: "100+", label: "$ 100+", min: 100, max: Infinity },
];

export const DATE_POSTED_OPTIONS = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "7", label: "Past 7 days" },
  { id: "15", label: "Past 15 days" },
  { id: "30", label: "Past 30+ days" },
  { id: "custom", label: "MM/DD/YY - MM/DD/YY" },
];

export const EMPTY_DISCOUNT_FILTERS = {
  posted: "all", postedFrom: "", postedTo: "",
  redeem: [], value: [], industry: [], region: [],
};

// Placeholder certificates to test the layout — Cesar replaces these.
const DISCOUNTS = [
  {
    id: "d1", offer: "$25 off a 60-minute massage", description: "Any weekday appointment, first-time clients",
    company: "Tri-Valley Wellness Spa", industry: "Beauty", city: "Pleasanton", state: "CA", region: "Alameda",
    redeem: ["In-Person"], value: 25, expires: "2026-12-31", posted: "2026-10-09", premier: true,
    instructions: "Show this certificate at the front desk. One per person.",
    about: "Day spa offering massage, facials and wellness packages.", phone: "(925) 555-0142", url: "", contact: "Front desk",
  },
  {
    id: "d2", offer: "Free 30-minute business strategy session", description: "For calendarGold members starting a small business",
    company: "Bay Area SBDC", industry: "Professional Services", city: "Oakland", state: "CA", region: "Alameda",
    redeem: ["Online", "In-Person"], value: 0, expires: "2026-11-30", posted: "2026-10-05", premier: false,
    instructions: "Book through the advisor link and mention calendarGold.",
    about: "Free and low-cost advising for small businesses.", phone: "", url: "", contact: "Advising team",
  },
  {
    id: "d3", offer: "15% off your first catering order", description: "Orders of 20+ guests, Bay Area delivery",
    company: "Golden Gate Catering Co.", industry: "Food & Beverage", city: "San Francisco", state: "CA", region: "San Francisco",
    redeem: ["In-Person", "Online"], value: 60, expires: "2027-01-31", posted: "2026-10-01", premier: true,
    instructions: "Use code GOLD15 when ordering online.",
    about: "Event and corporate catering across the Bay Area.", phone: "(415) 555-0190", url: "", contact: "Events desk",
  },
  {
    id: "d4", offer: "$10 gift certificate", description: "Coffee, pastries and lunch",
    company: "Main Street Café", industry: "Food & Beverage", city: "Walnut Creek", state: "CA", region: "Contra Costa",
    redeem: ["In-Person"], value: 10, expires: "2026-12-15", posted: "2026-09-28", premier: false,
    instructions: "Print or show on your phone at the register.",
    about: "Neighborhood café.", phone: "", url: "", contact: "",
  },
  {
    id: "d5", offer: "Free headshot mini-session", description: "10 minutes, 2 edited photos — great for LinkedIn",
    company: "Peninsula Portraits", industry: "Professional Services", city: "San Mateo", state: "CA", region: "San Mateo",
    redeem: ["In-Person"], value: 0, expires: "2026-11-15", posted: "2026-09-25", premier: false,
    instructions: "Available at calendarGold networking expos.",
    about: "Professional portrait and event photography.", phone: "", url: "", contact: "",
  },
  {
    id: "d6", offer: "$100 off website redesign", description: "Small-business sites, any package",
    company: "Silicon Valley Web Studio", industry: "Technology", city: "San Jose", state: "CA", region: "Santa Clara",
    redeem: ["Online"], value: 100, expires: "2027-02-28", posted: "2026-09-20", premier: false,
    instructions: "Mention this certificate on your free consultation call.",
    about: "Web design and SEO for local businesses.", phone: "", url: "", contact: "",
  },
];

const LOCAL_KEY = "mc_submitted_discounts_v1";

export function localDiscounts() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); } catch { return []; }
}

export function saveLocalDiscount(d) {
  try {
    const list = localDiscounts().filter((x) => x.id !== d.id);
    list.unshift(d);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {}
}

export async function fetchDiscounts() {
  const ids = new Set(DISCOUNTS.map((d) => d.id));
  return [...localDiscounts().filter((d) => !ids.has(d.id)), ...DISCOUNTS];
}

export function discountLabel(d) {
  return d.value > 0 ? `$${Number(d.value).toLocaleString()} value` : "Free";
}

function dayDiff(iso, today) {
  const [y, m, dd] = String(iso || "").split("-").map(Number);
  if (!y) return null;
  const t = new Date(today); t.setHours(0, 0, 0, 0);
  return Math.round((t - new Date(y, m - 1, dd)) / 86400000);
}

const TESTS = {
  posted: (d, f, today) => {
    if (f.posted === "all") return true;
    if (f.posted === "custom") {
      if (f.postedFrom && d.posted < f.postedFrom) return false;
      if (f.postedTo && d.posted > f.postedTo) return false;
      return true;
    }
    const diff = dayDiff(d.posted, today);
    if (diff === null) return false;
    if (f.posted === "today") return diff === 0;
    if (f.posted === "30") return diff >= 0;
    return diff >= 0 && diff <= Number(f.posted);
  },
  redeem: (d, f) => !f.redeem.length || (d.redeem || []).some((r) => f.redeem.includes(r)),
  value: (d, f) => !f.value.length || f.value.some((id) => {
    const o = DISCOUNT_OPTIONS.find((x) => x.id === id);
    return o && d.value >= o.min && d.value <= o.max;
  }),
  industry: (d, f) => !f.industry.length || f.industry.includes(d.industry),
  region: (d, f) => !f.region.length || f.region.includes(d.region),
};

export function discountMatches(d, f, today = new Date(), q = "") {
  for (const k of Object.keys(TESTS)) if (!TESTS[k](d, f, today)) return false;
  if (q) {
    const hay = `${d.offer} ${d.description} ${d.company} ${d.city} ${d.industry}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export function countDiscountsFor(list, f, patch, today, q) {
  const trial = { ...f, ...patch };
  return list.filter((d) => discountMatches(d, trial, today, q)).length;
}
