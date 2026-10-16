// ONE place for every advertising rate (Oct 15 call: "change a rate once on
// the Rates page and it updates everywhere", instead of ~25 places).
// The calculator, the Create-listing forms and every Rates page read from
// here. Edit a number here and the whole site follows.

export const RATES = {
  premierPerView: 0.005, // $ per view of a Premier listing
  premierPerClick: 0.25, // $ per click to Listing Details (was $0.35; Oct 15 call)
  ticketFeePaid: 0.8, // $ per ticket, paid events
};

const money = (n) => (n === 0 ? "Free" : `$${n < 1 ? n.toFixed(n < 0.01 ? 3 : 2) : n}`);

// Each rate page: slug, title, image (legend icon), rows [label, value | rate key].
export const RATE_PAGES = [
  {
    slug: "listings",
    title: "calendarGold Listings",
    icon: "calendar",
    rows: [
      ["Regular Listing", "Free"],
      ["Premier Listing, per view", { rate: "premierPerView" }],
      ["Premier Listing, per click", { rate: "premierPerClick" }],
      ["Per Ticket Fee – Free Events", "Free"],
      ["Per Ticket Fee – Paid Events", { rate: "ticketFeePaid" }],
      ["Barter for Premier Listing (subject to approval)", "N/A"],
    ],
  },
  {
    slug: "expos",
    title: "Business & Technology Networking Expos",
    icon: "expo",
    rows: [
      ["Ticket w/ RSVP", "Free"],
      ["Ticket at Door", "$10"],
      ["Exhibitor – 6 ft or 8 ft table with linen", "$250"],
      ["Exhibitor – round cocktail table w/ linen", "$100"],
      ["Sponsor – Package Deal", "TBD"],
      ["Barter for Participation (subject to approval)", "N/A"],
    ],
  },
  {
    slug: "dinners",
    title: "Dinners & Networking",
    icon: "dinner",
    rows: [
      ["Ticket w/ RSVP", "$25"],
      ["Ticket at Door", "$35"],
      ["Per Ticket Fee", { rate: "ticketFeePaid" }],
      ["Restaurant Host – Share Revenue", "TBD"],
    ],
  },
  {
    slug: "workshops",
    title: "Workshops",
    icon: "workshop",
    rows: [
      ["Ticket w/ RSVP", "$10"],
      ["Ticket at Door", "$20"],
      ["Per Ticket Fee", { rate: "ticketFeePaid" }],
      ["Presenter – Subject to Approval", "Free"],
    ],
  },
];

export function rateValue(v) {
  return typeof v === "object" && v.rate ? money(RATES[v.rate]) : v;
}
