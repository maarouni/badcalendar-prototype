// Short city codes for the One Big Calendar table (Oct 15 review: "use
// consistent city abbreviations", e.g. SJC for San Jose). Cesar's Figma uses
// SF, SJC, OAK and FREM; the rest follow the same idea. Hover shows the full
// name. Add new cities here — anything missing falls back to the full name.
export const CITY_CODES = {
  "San Jose": "SJC",
  "San Francisco": "SF",
  Oakland: "OAK",
  Fremont: "FREM",
  Concord: "CCR",
  Cupertino: "CUP",
  Napa: "NAPA",
  "Palo Alto": "PA",
  Pleasanton: "PLS",
  Sacramento: "SAC",
  "San Mateo": "SMT",
  "San Rafael": "SRF",
  "Santa Rosa": "STS",
  Vacaville: "VAC",
  "Walnut Creek": "WC",
  Monterey: "MRY",
  "Los Angeles": "LA",
  "Austin, TX": "AUS",
  Lisbon: "LIS",
};

export function cityCode(e) {
  if (e.type === "Online") return "Online";
  return CITY_CODES[e.city] || e.city || "";
}
