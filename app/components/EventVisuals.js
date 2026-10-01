// Small presentational pieces shared by the home page: generated posters,
// host avatars, and date/time formatting. Everything is drawn from the
// Every Circle palette in Cesar's Figma, so no stock photos are needed.

import { CATEGORY_GROUPS } from "../lib/taxonomy";

const PERSONAL = new Set(
  CATEGORY_GROUPS.filter((g) => g.group === "Cultural, Ethnic" || g.group === "Diversity").flatMap((g) => g.options)
);

export const PALETTE = ["#ff9500", "#007aff", "#af52de", "#00c7be", "#1a1a1a"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function hash(str) {
  let h = 2166136261;
  for (const ch of String(str)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return Math.abs(h);
}

export function parseDate(iso) {
  const [y, m, d] = String(iso || "").split("-").map(Number);
  return y ? new Date(y, m - 1, d) : null;
}

export function isoOf(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function to12h(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return m ? `${hr}:${String(m).padStart(2, "0")} ${suffix}` : `${hr} ${suffix}`;
}

// "18:00-21:00" -> "6 PM – 9 PM"
export function fmtTime(t) {
  const m = String(t || "").match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!m) return t || "";
  return `${to12h(m[1])} – ${to12h(m[2])}`;
}

export function startTime(t) {
  const m = String(t || "").match(/(\d{1,2}:\d{2})/);
  return m ? to12h(m[1]) : "";
}

// Group header for the timeline: { day: "Oct 8", weekday: "Thursday", tag: "Today" }
export function dayLabel(iso, today) {
  const d = parseDate(iso);
  if (!d) return { day: iso, weekday: "", tag: "" };
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  const diff = Math.round((d - t) / 86400000);
  let tag = "";
  if (diff === 0) tag = "Today";
  else if (diff === 1) tag = "Tomorrow";
  else if (diff > 1 && diff < 7 && (d.getDay() === 0 || d.getDay() === 6)) tag = "This weekend";
  return { day: `${MONTHS[d.getMonth()]} ${d.getDate()}`, weekday: DAYS[d.getDay()], tag };
}

export function shortDate(iso) {
  const d = parseDate(iso);
  if (!d) return iso;
  return `${DAYS[d.getDay()].slice(0, 3)}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function initialsOf(name) {
  return String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function HostAvatar({ name, size = 22 }) {
  const color = PALETTE[hash(name) % 4];
  return (
    <span
      className="host-avatar"
      style={{ width: size, height: size, background: color, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  );
}

// A generated poster: overlapping circles on a palette background, seeded by
// the event id so each event always gets the same artwork.
export function Poster({ event, className = "", label = true }) {
  const h = hash(event.id + event.title);
  const bg = PALETTE[h % 4];
  const others = PALETTE.filter((c) => c !== bg && c !== "#1a1a1a");
  const c1 = others[h % others.length];
  const c2 = others[(h >> 3) % others.length];
  const x1 = 30 + (h % 140);
  const y1 = 20 + ((h >> 5) % 60);
  const r1 = 55 + ((h >> 7) % 40);
  const x2 = 160 + ((h >> 9) % 110);
  const y2 = 90 + ((h >> 11) % 50);
  const r2 = 30 + ((h >> 13) % 35);
  const ink = bg === "#ff9500" ? "#1a1a1a" : "#ffffff";
  // Most specific category first ("Networking" is on nearly everything).
  const cats = [...(event.categories || []), event.category].filter(Boolean);
  const usable = cats.filter((c) => !PERSONAL.has(c));
  const pick = usable.find((c) => c !== "Networking") || usable[0] || "Event";
  const word = String(pick).split(",")[0].trim();
  const size = word.length > 13 ? 22 : word.length > 9 ? 26 : 30;
  return (
    <svg className={`poster ${className}`} viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="320" height="180" fill={bg} />
      <circle cx={x1} cy={y1} r={r1} fill={c1} opacity="0.9" />
      <circle cx={x2} cy={y2} r={r2} fill={c2} opacity="0.85" />
      <circle cx={x2 + r2 * 0.9} cy={y2 - r2 * 0.6} r={r2 * 0.35} fill="#fff" opacity="0.9" />
      {label && <text x="18" y="160" fill={ink} fontFamily="Alata, Lexend, sans-serif" fontSize={size} letterSpacing="-1">
        {word}
      </text>}
    </svg>
  );
}

// Outline icons for the Premier 4-line format (spec: "bolded with icons").
export function Icon({ name }) {
  const common = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (name === "clock")
    return (<svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
  if (name === "pin")
    return (<svg {...common}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>);
  if (name === "globe")
    return (<svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>);
  if (name === "tag")
    return (<svg {...common}><path d="M3 12V4h8l10 10-8 8L3 12Z" /><circle cx="7.5" cy="8" r="1.4" /></svg>);
  if (name === "check")
    return (<svg {...common} strokeWidth="2.6"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>);
  if (name === "plus")
    return (<svg {...common} strokeWidth="2.4"><path d="M12 5v14M5 12h14" /></svg>);
  if (name === "chev-l")
    return (<svg {...common}><path d="M15 6l-6 6 6 6" /></svg>);
  if (name === "chev-r")
    return (<svg {...common}><path d="M9 6l6 6-6 6" /></svg>);
  return null;
}
