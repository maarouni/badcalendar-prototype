// Organizations — fields and filters from Cesar's Figma (Oct 14, "Organizations"):
//   digest row: Organization Name · Tagline · Type In-Person / Online ·
//               Categories • Industries · City, State ·
//               # Members • $ Annual Dues · Posted · icon / logo
//   filters:    Date Posted / Revised · Organization Types (In-Person,
//               Online / Virtual, Premier, Regular) · # Members ·
//               Annual Dues · My Membership Status · Categories ·
//               Industries · Regions (4 groups)
//   edit page:  WHY · BENEFITS · # Members · $ Annual Dues ·
//               Member List visibility · Contact · Leadership / Staff / Members
import { REGION_GROUPS, CATEGORY_GROUPS } from "./taxonomy";
import { INDUSTRIES } from "./employmentTaxonomy";

export { REGION_GROUPS, CATEGORY_GROUPS, INDUSTRIES };

export const ORG_FORMATS = ["In-Person", "Online / Virtual"];
export const ORG_TIERS = ["Premier", "Regular"];

export const DATE_POSTED_OPTIONS = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "7", label: "Past 7 days" },
  { id: "15", label: "Past 15 days" },
  { id: "30", label: "Past 30+ days" },
  { id: "custom", label: "MM/DD/YY - MM/DD/YY" },
];

export const MEMBER_OPTIONS = [
  { id: "0-500", label: "0 - 500", min: 0, max: 500 },
  { id: "501-5000", label: "501 - 5,000", min: 501, max: 5000 },
  { id: "5001-15000", label: "5,001 - 15,000", min: 5001, max: 15000 },
  { id: "15001-40000", label: "15,001 - 40,000", min: 15001, max: 40000 },
  { id: "40001-75000", label: "40,001 - 75,000", min: 40001, max: 75000 },
  { id: "75001+", label: "75,001+", min: 75001, max: Infinity },
];

export const DUES_OPTIONS = [
  { id: "free", label: "Free", min: 0, max: 0 },
  { id: "0-50", label: "$ 0 - $ 49.99", min: 0.01, max: 49.99 },
  { id: "50-100", label: "$ 50 - $ 99.99", min: 50, max: 99.99 },
  { id: "100-500", label: "$ 100 - $ 499.99", min: 100, max: 499.99 },
  { id: "500-1000", label: "$ 500 - $ 999.99", min: 500, max: 999.99 },
  { id: "1000+", label: "$ 1000+", min: 1000, max: Infinity },
];

// "My Membership Status" — set per organization by each user.
export const MEMBERSHIP_STATUSES = [
  { id: "member", icon: "✓", label: "Member" },
  { id: "considering", icon: ">", label: "Considering to apply" },
  { id: "na", icon: "N", label: "Not Applicable / Not a Member" },
];

// Who can see an organization's Member List (edit page, "Member List Mini-Cards").
export const MEMBER_LIST_VISIBILITY = [
  { id: "hide", label: "Hide", def: true },
  { id: "public", label: "Display — Public" },
  { id: "members", label: "Display — Only to members" },
  { id: "registered", label: "Display — Only to registered users" },
];

export const ROSTER_GROUPS = [
  { id: "leadership", label: "Organization Leadership" },
  { id: "staff", label: "Organization Staff" },
  { id: "member", label: "Organization Members" },
];

export const EMPTY_ORG_FILTERS = {
  posted: "all", postedFrom: "", postedTo: "",
  formats: [], tiers: [], members: [], dues: [], status: [],
  categories: [], industry: [], region: [],
};

// Placeholder organizations to test the layout — Cesar replaces these.
const ORGS = [
  {
    id: "o1", name: "Tri-Valley Business Alliance", tagline: "Connecting small businesses across Pleasanton, Dublin and Livermore",
    formats: ["In-Person", "Online / Virtual"], premier: true,
    categories: ["Networking", "Business, Financial"], industry: "Business",
    city: "Pleasanton", state: "CA", region: "Alameda", members: 420, dues: 150, posted: "2026-10-12",
    why: "Help local owners grow through referrals, education and advocacy.",
    benefits: "Monthly mixers, member directory, ribbon cuttings, discounted workshops.",
    url: "", profileUrl: "", phone: "(925) 555-0110", email: "", contactName: "Membership Desk", memberList: "public",
    roster: [
      { role: "leadership", name: "Leader Name", title: "President", org: "Tri-Valley Business Alliance", city: "Pleasanton, CA" },
      { role: "leadership", name: "Leader Name", title: "Vice President", org: "Tri-Valley Business Alliance", city: "Dublin, CA" },
      { role: "staff", name: "Staff Name", title: "Membership Director", org: "Tri-Valley Business Alliance", city: "Pleasanton, CA" },
      { role: "member", name: "Member Name", title: "Owner", org: "Member Business", city: "Livermore, CA" },
      { role: "member", name: "Member Name", title: "Founder", org: "Member Business", city: "San Ramon, CA" },
    ],
  },
  {
    id: "o2", name: "East Bay Women in Tech", tagline: "Mentorship, meetups and career growth for women in technology",
    formats: ["In-Person", "Online / Virtual"], premier: false,
    categories: ["Female, Women", "Career", "Emerging Tech"], industry: "Technology",
    city: "Oakland", state: "CA", region: "Alameda", members: 2300, dues: 0, posted: "2026-10-08",
    why: "Close the gender gap in Bay Area tech.", benefits: "Mentor matching, job board, monthly talks.",
    url: "", profileUrl: "", phone: "", email: "", contactName: "", memberList: "members",
    roster: [
      { role: "leadership", name: "Leader Name", title: "Executive Director", org: "East Bay Women in Tech", city: "Oakland, CA" },
      { role: "member", name: "Member Name", title: "Engineer", org: "Member Company", city: "Berkeley, CA" },
    ],
  },
  {
    id: "o3", name: "Peninsula Real Estate Investors Club", tagline: "Monthly deal reviews and education for Bay Area investors",
    formats: ["In-Person"], premier: true,
    categories: ["Business Investor, Startup", "Seminar, Workshop"], industry: "Financial",
    city: "San Mateo", state: "CA", region: "San Mateo", members: 860, dues: 99, posted: "2026-10-03",
    why: "Make investors better underwriters.", benefits: "Deal nights, lender panels, member-only market reports.",
    url: "", profileUrl: "", phone: "", email: "", contactName: "Club Organizer", memberList: "registered",
    roster: [
      { role: "leadership", name: "Leader Name", title: "Club Organizer", org: "Peninsula Real Estate Investors Club", city: "San Mateo, CA" },
    ],
  },
  {
    id: "o4", name: "Bay Area Hispanic Professionals Network", tagline: "Career and business networking for Latino professionals",
    formats: ["In-Person", "Online / Virtual"], premier: false,
    categories: ["Hispanic, Latino, Latinx", "Networking"], industry: "Professional Services",
    city: "San Jose", state: "CA", region: "Santa Clara", members: 6200, dues: 60, posted: "2026-09-29",
    why: "Grow Latino leadership across the Bay Area.", benefits: "Scholarships, chapter events, annual gala.",
    url: "", profileUrl: "", phone: "", email: "", contactName: "", memberList: "hide",
    roster: [],
  },
  {
    id: "o5", name: "Golden Gate Nonprofit Collaborative", tagline: "Shared resources and training for San Francisco nonprofits",
    formats: ["Online / Virtual"], premier: false,
    categories: ["Community", "Education"], industry: "Non Profit",
    city: "San Francisco", state: "CA", region: "San Francisco", members: 18500, dues: 250, posted: "2026-09-20",
    why: "Stronger nonprofits, stronger city.", benefits: "Grant-writing clinics, board training, shared vendor rates.",
    url: "", profileUrl: "", phone: "", email: "", contactName: "", memberList: "public",
    roster: [
      { role: "staff", name: "Staff Name", title: "Program Manager", org: "Golden Gate Nonprofit Collaborative", city: "San Francisco, CA" },
    ],
  },
  {
    id: "o6", name: "Northern California Engineers Society", tagline: "Professional development for engineers statewide",
    formats: ["In-Person", "Online / Virtual"], premier: false,
    categories: ["Education", "Conference"], industry: "Science",
    city: "Sacramento", state: "CA", region: "Sacramento Valley", members: 52000, dues: 1200, posted: "2026-09-12",
    why: "Advance the engineering profession.", benefits: "PE exam prep, continuing education credits, annual conference.",
    url: "", profileUrl: "", phone: "", email: "", contactName: "", memberList: "hide",
    roster: [],
  },
];

const LOCAL_KEY = "mc_submitted_orgs_v1";
const STATUS_KEY = "mc_org_membership_v1";

export function localOrgs() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); } catch { return []; }
}

export function saveLocalOrg(o) {
  try {
    const list = localOrgs().filter((x) => x.id !== o.id);
    list.unshift(o);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {}
}

export async function fetchOrgs() {
  const local = localOrgs();
  const localIds = new Set(local.map((o) => o.id));
  // A locally edited copy of a sample org replaces the sample.
  return [...local, ...ORGS.filter((o) => !localIds.has(o.id))];
}

export function readMembership() {
  try { return JSON.parse(localStorage.getItem(STATUS_KEY) || "{}"); } catch { return {}; }
}

export function writeMembership(id, status) {
  const all = readMembership();
  if (status) all[id] = status; else delete all[id];
  try { localStorage.setItem(STATUS_KEY, JSON.stringify(all)); } catch {}
  return all;
}

export const fmtMembers = (n) => `${Number(n || 0).toLocaleString()} Members`;
export const fmtDues = (n) => (Number(n) > 0 ? `$ ${Number(n).toLocaleString()} Annual Dues` : "Free membership");

// Can this viewer see the org's member list?
export function rosterVisible(o, status, loggedIn) {
  const v = o.memberList || "hide";
  if (v === "public") return true;
  if (v === "members") return status === "member";
  if (v === "registered") return !!loggedIn;
  return false;
}

function dayDiff(iso, today) {
  const [y, m, dd] = String(iso || "").split("-").map(Number);
  if (!y) return null;
  const t = new Date(today); t.setHours(0, 0, 0, 0);
  return Math.round((t - new Date(y, m - 1, dd)) / 86400000);
}

const inBucket = (opts, ids, v) => ids.some((id) => {
  const o = opts.find((x) => x.id === id);
  return o && v >= o.min && v <= o.max;
});

const TESTS = {
  posted: (o, f, ctx) => {
    if (f.posted === "all") return true;
    if (f.posted === "custom") {
      if (f.postedFrom && o.posted < f.postedFrom) return false;
      if (f.postedTo && o.posted > f.postedTo) return false;
      return true;
    }
    const diff = dayDiff(o.posted, ctx.today);
    if (diff === null) return false;
    if (f.posted === "today") return diff === 0;
    if (f.posted === "30") return diff >= 0;
    return diff >= 0 && diff <= Number(f.posted);
  },
  formats: (o, f) => !f.formats.length || (o.formats || []).some((x) => f.formats.includes(x)),
  tiers: (o, f) => !f.tiers.length || f.tiers.includes(o.premier ? "Premier" : "Regular"),
  members: (o, f) => !f.members.length || inBucket(MEMBER_OPTIONS, f.members, Number(o.members) || 0),
  dues: (o, f) => !f.dues.length || inBucket(DUES_OPTIONS, f.dues, Number(o.dues) || 0),
  // Orgs with no status set count as "Not Applicable".
  status: (o, f, ctx) => !f.status.length || f.status.includes(ctx.membership[o.id] || "na"),
  categories: (o, f) => !f.categories.length || (o.categories || []).some((c) => f.categories.includes(c)),
  industry: (o, f) => !f.industry.length || f.industry.includes(o.industry),
  region: (o, f) => !f.region.length || f.region.includes(o.region),
};

// ctx = { today, membership, q }
export function orgMatches(o, f, ctx) {
  for (const k of Object.keys(TESTS)) if (!TESTS[k](o, f, ctx)) return false;
  if (ctx.q) {
    const hay = `${o.name} ${o.tagline} ${o.city} ${o.industry} ${(o.categories || []).join(" ")}`.toLowerCase();
    if (!hay.includes(ctx.q)) return false;
  }
  return true;
}

export function countOrgsFor(list, f, patch, ctx) {
  const trial = { ...f, ...patch };
  return list.filter((o) => orgMatches(o, trial, ctx)).length;
}
