// Notification page content — the ONE place Cesar's text goes.
//
// This page is a framework only: the boxes, sections and controls are built,
// but most labels and links are intentionally left blank ("") so Cesar can
// fill them in (agreed in the 9/24 meeting). Anything left blank shows up on
// the page as a dashed "to be filled" box.
//
// To fill in: replace each "" with the label text, and each link: "" with
// the URL (or leave link blank if the option isn't a link).
//
// Regions and Categories are NOT repeated here — the notification filters
// reuse the same lists as One Big Calendar (app/lib/taxonomy.js), so they
// only ever need to be maintained in one place.

const blank = (n) => Array.from({ length: n }, () => ({ label: "", link: "" }));

// Filters on the "Browse Notifications" tab (left panel).
export const NOTIFICATION_FILTERS = [
  {
    id: "subscribers",
    title: "Subscribers",
    hint: 'e.g. "Over 15,000 subscribers"',
    type: "radio",
    options: blank(5),
  },
  {
    id: "frequency",
    title: "Revision frequency",
    hint: 'e.g. "Weekly", "Monthly"',
    type: "checkbox",
    options: blank(4),
  },
  {
    id: "additions",
    title: "Listing additions",
    hint: "Manual vs. automatic",
    type: "checkbox",
    options: blank(2),
  },
  {
    id: "ntype",
    title: "Notification type",
    hint: "Events now; coupons, gift certificates, jobs later",
    type: "checkbox",
    options: blank(4),
  },
];

// Delivery preferences on the "My Notifications" tab.
export const DELIVERY_CHANNELS = ["Email", "Text", "Email + Text"];
export const DELIVERY_FREQUENCY = blank(3); // e.g. As published / Daily / Weekly
export const DELIVERY_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Business notification builder — the three sections from the 9/24 walkthrough.
export const BUSINESS_SECTIONS = [
  { id: "A", title: "Section A — Information", kind: "text", hint: "Free-text description box" },
  { id: "B", title: "Section B — RSVP Today", kind: "listings", hint: "Featured events with RSVP links" },
  { id: "C", title: "Section C — Other Events", kind: "listings", hint: "Additional events feed" },
];

export const MAX_LISTINGS_PER_NOTIFICATION = 20; // premier + regular combined
export const MAX_BUSINESSES_PER_USER = 10;

// Mini-cards shown on the Browse tab (placeholders until real data exists).
export const SAMPLE_NOTIFICATION_CARDS = blank(6);
