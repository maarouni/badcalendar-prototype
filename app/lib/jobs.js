// Mock Employment listings data — matches Cesar's "Employment" wireframe card fields.
const JOBS = [
  {
    id: "j1",
    title: "Business Development Manager",
    company: "Bay Area SBDC",
    industry: "Professional Services",
    city: "Oakland", region: "Alameda",
    level: "Management", types: ["Hybrid", "FT Full-Time"],
    compType: "yearly", compMin: 85000, compMax: 110000,
    posted: "2026-10-05", premier: true,
  },
  {
    id: "j2",
    title: "Founding Engineer",
    company: "Founders Circle SF",
    industry: "Technology",
    city: "San Francisco", region: "San Francisco",
    level: "Founder, Owner", types: ["In-Person", "Entrepreneur"],
    compType: "none", compMin: 0, compMax: 0,
    posted: "2026-10-02", premier: true,
  },
  {
    id: "j3",
    title: "Marketing Coordinator",
    company: "San Mateo Area Chamber",
    industry: "Media, Advertising",
    city: "San Mateo", region: "San Mateo",
    level: "Staff", types: ["Remote", "PT Part-Time"],
    compType: "hourly", compMin: 28, compMax: 35,
    posted: "2026-09-29",
  },
  {
    id: "j4",
    title: "Commercial Loan Officer",
    company: "Iron Oak Lending",
    industry: "Financial",
    city: "Walnut Creek", region: "Contra Costa",
    level: "Executive", types: ["In-Person", "Employee"],
    compType: "yearly", compMin: 95000, compMax: 140000,
    posted: "2026-09-25",
  },
  {
    id: "j5",
    title: "Event Operations Volunteer",
    company: "infoBayArea Workshops",
    industry: "Community",
    city: "San Jose", region: "Santa Clara",
    level: "Staff", types: ["In-Person", "Volunteer"],
    compType: "volunteer", compMin: 0, compMax: 0,
    posted: "2026-09-20",
  },
  {
    id: "j6",
    title: "Listing Agent",
    company: "Keller Williams",
    industry: "Retail",
    city: "Fremont", region: "Alameda",
    level: "Consultant", types: ["Hybrid", "Contractor", "Affiliate"],
    compType: "none", compMin: 0, compMax: 0,
    posted: "2026-09-18",
  },
  {
    id: "j7",
    title: "Healthcare Recruiter",
    company: "Peninsula Health Partners",
    industry: "Healthcare",
    city: "Redwood City", region: "San Mateo",
    level: "Management", types: ["Remote", "FT Full-Time"],
    compType: "monthly", compMin: 6500, compMax: 8000,
    posted: "2026-09-12",
  },
  {
    id: "j8",
    title: "Construction Project Manager",
    company: "North Bay Builders",
    industry: "Construction",
    city: "Santa Rosa", region: "Sonoma",
    level: "Management", types: ["In-Person", "FT Full-Time"],
    compType: "yearly", compMin: 100000, compMax: 130000,
    posted: "2026-09-08",
  },
];

// Jobs posted from this browser via /employment/submit are kept in
// localStorage, same pattern as events — no real backend yet.
const LOCAL_KEY = "mc_submitted_jobs_v1";

export function localJobs() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveLocalJob(job) {
  try {
    const list = localJobs().filter((j) => j.id !== job.id);
    list.unshift(job);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {}
}

export async function fetchJobs() {
  const ids = new Set(JOBS.map((j) => j.id));
  return [...localJobs().filter((j) => !ids.has(j.id)), ...JOBS];
}
