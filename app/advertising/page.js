"use client";

import PageTemplate from "../components/PageTemplate";
import PremierCalculator from "../components/PremierCalculator";
import { Glyph } from "../components/Icons";

// Cesar's "Earn with Advertising" / "Calculate Advertising Cost" / "Rates"
// screens (Figma Rev 261012). Rates are his numbers, marked subject to change.
const LISTING_RATES = [
  ["Regular Listing", "Free"],
  ["Premier Listing, per view", "$0.005"],
  ["Premier Listing, per click", "$0.35"],
  ["Per Ticket Fee – Paid Events", "$0.80"],
  ["Per Ticket Fee – Free Events", "Free"],
  ["Non-Profits, 2 weeks (subject to approval)", "Free"],
];
const EXPO_RATES = [
  ["Ticket w/ RSVP", "Free"], ["Ticket at Door", "$10"],
  ["Exhibitor – 6 ft or 8 ft table with linen", "$250"], ["Exhibitor – round cocktail table w/ linen", "$100"],
  ["Sponsor – Package Deal", "TBD"], ["Caterer, Beverage Provider (Spirits, Wine)", "Free"], ["Entertainment", "Free"],
];
const DINNER_RATES = [["Ticket w/ RSVP", "$25"], ["Ticket at Door", "$35"], ["Per Ticket Fee", "$0.80"], ["Restaurant Host – Share Revenue", "TBD"]];
const WORKSHOP_RATES = [["Ticket w/ RSVP", "$10"], ["Ticket at Door", "$20"], ["Per Ticket Fee", "$0.80"], ["Presenter – Subject to Approval", "Free"]];

function RateTable({ title, rows }) {
  return (
    <div className="rate-table">
      <h4>{title}</h4>
      <table>
        <tbody>{rows.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

export default function AdvertisingPage() {
  return (
    <PageTemplate
      section={null}
      title="Earn with Advertising"
      subtitle="Innovative, Results-Based Marketing"
      intro="calendarGold offers various free and paid opportunities to promote your events, businesses, and organizations, online and in-person. Please contact us to discuss win-win package deals."
      actions={<a href="/info#contact" className="tpl-action">Contact us</a>}
    >
      <nav className="info-index" aria-label="Next step">
        <a href="#calculate"><Glyph name="calculate" size={14} /> Calculate Advertising Cost</a>
        <a href="#rates">View Advertising Rates</a>
        <a href="#participate">Event Participation</a>
      </nav>

      <section className="adv-section">
        <h2>Save $$$! Results-Based Marketing</h2>
        <p>
          Calculate and manage your advertising cost based on <b># weeks</b> and <b># views OR # clicks</b>. Full transparency:
          the system calculates the approximate number of times your listing may be displayed, based on every user&rsquo;s
          matching filters in Calendars, Discount / Gift Certificates, Employment Listings and Notifications.
        </p>
        <p className="nt-hint">This is NOT the typical pay-and-pray, shotgun, push-marketing approach.</p>
      </section>

      <section className="adv-section" id="calculate">
        <h2><Glyph name="calculate" size={20} /> Calculate My Advertising Cost</h2>
        <PremierCalculator />
      </section>

      <section className="adv-section" id="rates">
        <h2>Rates <span className="nt-hint">*</span></h2>
        <div className="rate-grid">
          <RateTable title="calendarGold Listings" rows={LISTING_RATES} />
          <RateTable title="Business & Technology Networking Expos" rows={EXPO_RATES} />
          <RateTable title="Dinners & Networking" rows={DINNER_RATES} />
          <RateTable title="Workshops" rows={WORKSHOP_RATES} />
        </div>
        <p className="nt-hint">* Rates subject to change without notice. They do not include credit card fees.</p>
      </section>

      <section className="adv-section" id="participate">
        <h2>Event Participation</h2>
        <p>Networking Expos / Mixers, Dinners and Workshops. Typical expo attendance 200&ndash;800+, upscale ambiance, caterers, exhibitors, music and prizes.</p>
        <ul className="adv-list">
          <li><Glyph name="expo" size={18} /> <b>Business &amp; Technology Networking Expos</b> — exhibitors, sponsors, caterers, entertainment</li>
          <li><Glyph name="dinner" size={18} /> <b>Dinners &amp; Networking</b> — restaurant hosts share revenue</li>
          <li><Glyph name="workshop" size={18} /> <b>Workshops</b> — presenters subject to approval</li>
        </ul>
        <div className="disc-thanks">
          <b>Exhibitors &amp; participants:</b> arrive by 4:45pm to set up; bring your banner, business cards, giveaways and
          prizes for the drawing. Stand in front of your table, not behind it. Exhibitors and sponsors: contact us to
          negotiate a win-win package deal &mdash; rates vary by date, location and expected attendance.
        </div>
        <p style={{ marginTop: 12 }}><a href="/" className="btn-primary btn-sm">See upcoming events on One Big Calendar</a></p>
      </section>
    </PageTemplate>
  );
}
