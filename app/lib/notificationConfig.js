// Notification page — starting content.
//
// Cesar fills these in ON THE PAGE: /notifications → "Edit labels" → type into
// the boxes → "Download my entries". His entries are saved in his browser
// (no database yet) and the downloaded JSON file can be pasted over the
// defaults below so everyone sees them.
//
// Regions and Categories are NOT repeated here — the notification filters
// reuse the same lists as One Big Calendar (app/lib/taxonomy.js).

const blank = (n) => Array.from({ length: n }, () => ({ label: "", link: "" }));
const blankCards = (n) =>
  Array.from({ length: n }, () => ({ name: "", publisher: "", subscribers: "", frequency: "", area: "" }));

export const DEFAULT_LABELS = {
  // Filters on the "Browse Notifications" tab (left panel).
  filters: [
    { id: "subscribers", title: "Subscribers", hint: 'e.g. "Over 15,000 subscribers"', type: "radio", options: blank(5) },
    { id: "frequency", title: "Revision frequency", hint: 'e.g. "Weekly", "Monthly"', type: "checkbox", options: blank(4) },
    { id: "additions", title: "Listing additions", hint: "Manual vs. automatic", type: "checkbox", options: blank(2) },
    { id: "ntype", title: "Notification type", hint: "Events now; coupons, gift certificates, jobs later", type: "checkbox", options: blank(4) },
  ],
  // Mini-cards on the Browse tab.
  cards: blankCards(6),
  // "How often" choices on the My Notifications tab.
  deliveryFrequency: blank(3),
};

export const DELIVERY_CHANNELS = ["Email", "Text", "Email + Text"];
export const DELIVERY_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const MAX_LISTINGS_PER_NOTIFICATION = 20; // premier + regular combined
export const MAX_BUSINESSES_PER_USER = 10;
