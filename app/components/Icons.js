// One icon set for the whole site, following Cesar's "Legend Icons" page
// (Figma, Info section, Rev 261012). Every icon has a name and a tooltip
// label; the Info → Legend Icons page renders this list, so adding an icon
// here documents it automatically.
//
// <Glyph name="cart" />                 → bare SVG
// <IconButton name="cart" onClick=... /> → button with hover tooltip

const P = {
  // ---- Header ----
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6" /><path d="M12 7.5h.01" /></>,
  // Oct 15 Figma: header Dashboards icon is a bar chart in a box.
  dashboards: <><rect x="3" y="3" width="18" height="18" rx="2.5" /><path d="M8 16v-4M12 16V8M16 16v-6" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,
  pdf: <><path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M4 19h16" /></>,
  print: <><path d="M6 9V3h12v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M6 14h12v7H6z" /></>,
  login: <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /></>,
  barter: <><path d="M4 8h14l-3-3" /><path d="M20 16H6l3 3" /></>,
  register: <><circle cx="10" cy="8" r="4" /><path d="M2 21c0-4 3.6-7 8-7s8 3 8 7" /><path d="M19 8v6M16 11h6" /></>,
  user: <><circle cx="12" cy="12" r="9.5" /><text x="12" y="16.2" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor" stroke="none">M</text></>,
  // ---- Actions ----
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></>,
  prev: <path d="M15 6l-6 6 6 6" />,
  next: <path d="M9 6l6 6-6 6" />,
  collapse: <path d="M6 15l6-6 6 6" />,
  expand: <path d="M6 9l6 6 6-6" />,
  public: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  private: <><path d="M9.9 5.2A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-2.4 3.3M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /><path d="M3 3l18 18" /></>,
  select: <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  gcal: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /><path d="M12 13v5M9.5 15.5h5" /></>,
  calculate: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8" /><path d="M8 11h.01M12 11h.01M16 11h.01M8 14.5h.01M12 14.5h.01M16 14.5h.01M8 18h.01M12 18h4" /></>,
  gallery: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></>,
  comments: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />,
  like: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z" />,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></>,
  viewMode: <><path d="M4 4h12l4 4v12H4z" /><path d="M8 12h8M8 16h5" /></>,
  editMode: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></>,
  addNew: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
  cart: <><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6" /></>,
  cartAdd: <><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6" /><path d="M14 8.5v5M11.5 11h5" /></>,
  delete: <><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M6 6l1 14h10l1-14" /><path d="M10 11v6M14 11v6" /></>,
  clearAll: <><circle cx="12" cy="12" r="9" /><path d="M15 9l-6 6M9 9l6 6" /></>,
  ticket: <><path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4V8Z" /><path d="M13 6v12" strokeDasharray="2 2" /></>,
  map: <><path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Z" /><path d="M9 4v14M15 6v14" /></>,
  qr: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3M21 14v.01M17 21h4v-4M14 18v3" /></>,
  // ---- Listings / images ----
  expo: <><circle cx="8" cy="8" r="3" /><circle cx="16" cy="8" r="3" /><path d="M2 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M14 14.3A6 6 0 0 1 22 20" /></>,
  dinner: <><path d="M7 3v8a2 2 0 0 0 2 2v8" /><path d="M5 3v6M9 3v6" /><path d="M17 21V3c-2 0-3 3-3 7h3" /></>,
  workshop: <><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M12 16v4M8 20h8" /><path d="M7 12l3-3 2 2 4-4" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>,
  email: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  verifyEmail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /><path d="M14.5 17.5l2 2 4-4" /></>,
  miniCard: <><rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="8" cy="11" r="2.2" /><path d="M5 16c.6-1.6 1.7-2.4 3-2.4s2.4.8 3 2.4" /><path d="M14 10h5M14 13h4" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18" /><path d="M8 3v4M16 3v4" /></>,
  discount: <><circle cx="8" cy="8" r="2.5" /><circle cx="16" cy="16" r="2.5" /><path d="M17 7 7 17" /></>,
  organizations: <><path d="M12 3 3 20h18L12 3Z" /><path d="M7.6 12h8.8M5.4 16h13.2" /></>,
  employment: <><rect x="3" y="8" width="18" height="12" rx="2" /><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 13h18" /></>,
  notifications: <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9Z" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
};

// Legend groups, labels exactly as Cesar's Legend Icons page names them.
export const LEGEND = [
  {
    group: "Header",
    items: [
      ["info", "Info"], ["dashboards", "Dashboards"], ["settings", "Settings"],
      ["pdf", "Download this page as a PDF"], ["print", "Print this page"],
      ["login", "Registration – Sign Up / Log In"], ["register", "Registration – Sign Up"], ["user", "Logged In – User's First Name Initial"],
      ["cart", "My Shopping Cart"],
    ],
  },
  {
    group: "Actions",
    items: [
      ["search", "SEARCH"], ["prev", "Previous"], ["next", "Next"], ["collapse", "Collapse"], ["expand", "View / Expand"],
      ["public", "Display, Public"], ["private", "Hide, Private"],
      ["select", "Add listing(s) to My Selection"], ["gcal", "Add event(s) to My Google Calendar"],
      ["calculate", "Calculate"], ["gallery", "Gallery"], ["comments", "Comments"], ["like", "Like"], ["share", "Share"],
      ["viewMode", "View Mode"], ["editMode", "Edit Mode"], ["addNew", "Add New"],
      ["cartAdd", "Add item to My Shopping Cart"], ["ticket", "RSVP / Order Tickets"], ["delete", "Delete"],
      ["pdf", "Download this page as a PDF"], ["print", "Print this page"], ["clearAll", "Clear All"],
      ["map", "Google Map"], ["qr", "QR Code"], ["barter", "Barter – no payment, not tracked"],
    ],
  },
  {
    group: "Sections",
    items: [
      ["calendar", "One Big Calendar"], ["discount", "Discount / Gift Certificates"],
      ["employment", "Employment Listings"], ["notifications", "Notifications"],
    ],
  },
  {
    group: "Images",
    items: [
      ["expo", "Networking Expos / Mixers"], ["dinner", "Networking Dinners"], ["workshop", "Seminars / Workshops"],
      ["logout", "Registration Log Out"], ["email", "Registration Sign Up Email"],
      ["miniCard", "Mini-Cards"], ["verifyEmail", "Verify Email"],
    ],
  },
];

export const ICON_LABEL = Object.fromEntries(LEGEND.flatMap((g) => g.items.map(([k, l]) => [k, l])));

export function Glyph({ name, size = 18, strokeWidth = 1.8, className = "" }) {
  const p = P[name];
  if (!p) return null;
  return (
    <svg className={`glyph ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {p}
    </svg>
  );
}

export function IconButton({ name, tip, href, onClick, className = "", size = 18, badge, ...rest }) {
  const label = tip || ICON_LABEL[name] || name;
  const inner = (
    <>
      <Glyph name={name} size={size} />
      {badge ? <span className="icon-badge">{badge}</span> : null}
    </>
  );
  if (href)
    return <a href={href} className={`icon-btn ${className}`} data-tip={label} aria-label={label} {...rest}>{inner}</a>;
  return <button type="button" className={`icon-btn ${className}`} data-tip={label} aria-label={label} onClick={onClick} {...rest}>{inner}</button>;
}
