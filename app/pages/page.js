import PageTemplate from "../components/PageTemplate";

// Every page from the Oct 8 skeleton, each linked to its working version.
const GROUPS = [
  ["Entry", [
    ["Home", "/", "Welcome box, four sections, One Big Calendar"],
    ["Sign Up", "/login?mode=signup", "Create an account"],
    ["Log In", "/login?mode=login", "Welcome back"],
  ]],
  ["Calendar", [
    ["One Big Calendar", "/#results", "Filters, county map, all events"],
    ["My Calendar Digest", "/my-calendar", "Your selected events + attendance status"],
    ["Event Details", "/event/15", "Example event: map, QR, tickets"],
    ["Edit / Submit Event", "/submit", "Create Event form, Regular or Premier"],
  ]],
  ["Commerce", [
    ["Tickets / RSVP", "/event/15#tickets", "RSVP / Order Tickets into My Calendar", "Payment on hold"],
  ]],
  ["Modules", [
    ["Notifications", "/notifications", "Browse and subscribe"],
    ["My Notifications", "/notifications?tab=mine", "Your subscriptions"],
    ["Discount / Gift Certificates", "/discounts", "Browse, filter, post a certificate"],
    ["Organizations", "/organizations", "Digest, filters, My Membership Status"],
    ["Organization Details", "/organizations/o1", "Example org: WHY, BENEFITS, QR code"],
    ["Organization Members", "/organizations/o1/members", "Leadership, Staff, Members mini-cards"],
    ["EDIT Organization Details", "/organizations/submit", "Add or edit an organization"],
    ["Employment Listings", "/employment", "Browse, filter, post a job"],
    ["Earn with Advertising", "/advertising", "Hub for the advertising pages"],
    ["Calculate Advertising Cost", "/advertising/calculate", "Views vs. clicks, side by side"],
    ["Rates – calendarGold Listings", "/advertising/listings", "Regular / Premier listing rates"],
    ["Rates – Networking Expos", "/advertising/expos", "Tickets, exhibitors, sponsors"],
    ["Rates – Dinners & Networking", "/advertising/dinners", "Tickets, restaurant hosts"],
    ["Rates – Workshops", "/advertising/workshops", "Tickets, presenters"],
    ["Earn / Invite & Refer", "/refer", "Your QR code + 5/3/2% revenue share"],
  ]],
  ["Account", [
    ["Dashboard", "/dashboards", "Referrals, digests, listings"],
  ]],
];

export const metadata = { title: "All Pages — calendarGold (Prototype)" };

export default function AllPages() {
  return (
    <PageTemplate
      section={null}
      title="All Pages"
      subtitle="Every page from the skeleton — each one opens the working page"
      legend={false}
      actions={<a href="/skeleton.html" className="tpl-action">Original skeleton</a>}
    >
      <div className="pages-grid">
        {GROUPS.map(([g, items]) => (
          <section key={g} className="pages-group">
            <h4>{g}</h4>
            {items.map(([name, href, desc, hold]) => (
              <a key={name} href={href} className="pages-item">
                <span className="pages-name">{name}{hold && <em className="pages-hold">{hold}</em>}</span>
                <span className="pages-desc">{desc}</span>
                <span className="pages-go" aria-hidden="true">→</span>
              </a>
            ))}
          </section>
        ))}
      </div>
    </PageTemplate>
  );
}
