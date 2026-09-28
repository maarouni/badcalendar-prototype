// Notification page — starting content (SAMPLE data until Cesar's arrives).
//
// Cesar edits all of this ON THE PAGE: /notifications → "Edit labels" → type →
// "Email labels to Masoud". His entries arrive as JSON which replaces
// DEFAULT_LABELS below so everyone sees them.
//
// Cards link to filters by option POSITION (tags.frequency: 1 = the 2nd
// frequency option). Regions and Categories use the One Big Calendar lists.

export const LABELS_VERSION = 2;

const opt = (label) => ({ label, link: "" });

export const DEFAULT_LABELS = {
  version: LABELS_VERSION,
  filters: [
    { id: "subscribers", title: "Subscribers", hint: "Audience size",
      options: ["Under 1,000", "1,000 – 5,000", "5,000 – 15,000", "Over 15,000"].map(opt) },
    { id: "frequency", title: "Revision frequency", hint: "How often it's sent",
      options: ["Daily", "Weekly", "Every 2 weeks", "Monthly"].map(opt) },
    { id: "additions", title: "Listing additions", hint: "How listings get added",
      options: ["Manual", "Automatic"].map(opt) },
    { id: "ntype", title: "Notification type", hint: "What it contains",
      options: ["Events", "Coupons", "Gift certificates", "Jobs"].map(opt) },
  ],
  cards: [
    { id: "c1", name: "Bay Area Networking Weekly", publisher: "everyCircle", subscriberCount: "21,000",
      region: "Santa Clara", category: "Networking", tags: { subscribers: 3, frequency: 1, additions: 1, ntype: 0 } },
    { id: "c2", name: "East Bay Investor Digest", publisher: "East Bay REIA", subscriberCount: "4,200",
      region: "Alameda", category: "Business Investor, Startup", tags: { subscribers: 1, frequency: 3, additions: 0, ntype: 0 } },
    { id: "c3", name: "SF Startup Mixers", publisher: "SF Founders Club", subscriberCount: "9,800",
      region: "San Francisco", category: "Business Investor, Startup", tags: { subscribers: 2, frequency: 1, additions: 1, ntype: 0 } },
    { id: "c4", name: "Latino Business Alerts", publisher: "Hispanic Chamber of Silicon Valley", subscriberCount: "6,500",
      region: "Santa Clara", category: "Hispanic, Latino, Latinx", tags: { subscribers: 2, frequency: 2, additions: 0, ntype: 0 } },
    { id: "c5", name: "Member Deals", publisher: "Saratoga Chamber of Commerce", subscriberCount: "850",
      region: "Santa Clara", category: "Community", tags: { subscribers: 0, frequency: 3, additions: 0, ntype: 1 } },
    { id: "c6", name: "Marin Business Circle", publisher: "Marin Business Circle", subscriberCount: "2,300",
      region: "Marin", category: "Networking", tags: { subscribers: 1, frequency: 1, additions: 1, ntype: 0 } },
    { id: "c7", name: "Tri-Valley Career Board", publisher: "Tri-Valley Jobs Network", subscriberCount: "3,100",
      region: "Alameda", category: "Career", tags: { subscribers: 1, frequency: 0, additions: 1, ntype: 3 } },
    { id: "c8", name: "Wine Country Gift Club", publisher: "Napa Valley Merchants", subscriberCount: "1,700",
      region: "Napa", category: "Food, Spirits, Wine", tags: { subscribers: 1, frequency: 3, additions: 0, ntype: 2 } },
  ],
  deliveryFrequency: ["As published", "Daily digest", "Weekly digest"].map(opt),
  business: {
    sectionA: "Information",
    sectionAHint: "Free-text description box",
    sectionB: "RSVP Today",
    sectionBHint: "Featured events with RSVP links",
    sectionC: "Other Events",
    sectionCHint: "Additional events feed",
    footer: "You're receiving this because you subscribed on calendarGold. Unsubscribe · Manage preferences",
  },
};

export const DELIVERY_CHANNELS = ["Email", "Text", "Email + Text"];
export const DELIVERY_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const MAX_LISTINGS_PER_NOTIFICATION = 20; // premier + regular combined
export const MAX_BUSINESSES_PER_USER = 10;
