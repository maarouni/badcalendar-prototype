import FillInHere from "../components/FillInHere";

// Cesar's wireframe (Figma, Oct 9 rev): "calendarGold.com Info" —
// About Us / public info page. Copy below is lifted straight from his
// Figma notes (Business & Tech Networking Expos, sponsor tiers) — real
// content, just needs his sign-off and a final layout pass.

export default function InfoPage() {
  return (
    <div className="page info-page">
      <header className="mc-head">
        <div>
          <h1>About calendarGold</h1>
          <p>Innovative, results-based marketing and revenue-sharing system. Connect &middot; Promote &middot; Earn.</p>
        </div>
      </header>

      <FillInHere>
        This is his actual Figma copy, dropped in as-is — confirm the final wording with him before it goes live.
      </FillInHere>

      <section className="info-section">
        <h2>Business &amp; Tech Networking Expos</h2>
        <p className="nt-hint">Hosted by calendarGold + everyCircle &middot; Typical attendance 200&ndash;800+ &middot; 5-star hospitality, upscale ambiance, caterers, exhibitors, music, prizes.</p>
        <p>
          Your mini-card on the event page links to your comprehensive profile in calendarGold, or directly to your
          website. Bring your banner, candies, giveaways and marketing collateral. Bring prizes for the drawing
          (free, or tickets sold for a participating non-profit). Discounts available for participating in multiple
          events.
        </p>

        <div className="info-tier-grid">
          <div className="info-tier">
            <h4>Caterer / Beverage Provider</h4>
            <p>Spirits, wine. Includes a 6 ft or 8 ft table with linen. Bring lots of appetizers &mdash; we usually invite multiple caterers.</p>
          </div>
          <div className="info-tier">
            <h4>Entertainment</h4>
            <p>DJ, live music, performer, photographer, videographer. Includes a round cocktail table with linen.</p>
          </div>
          <div className="info-tier">
            <h4>Exhibitor</h4>
            <p>Option A: 6 ft or 8 ft table with linen. Option B: round cocktail table with linen.</p>
          </div>
          <div className="info-tier">
            <h4>Sponsor Package</h4>
            <p>
              A custom Effective Networking Workshop (1&ndash;3 hrs) for your staff, clients and guests, presented
              by Cesar Plata at your location. List of all attendees. 6 ft or 8 ft table with linen. 30-second
              shout-out during the brief presentation. Weekly calendarGold notification: event sponsored by your
              biz/org in the Expo listing. Premier event listing including your logo. Be a presenter at a monthly
              calendarGold + everyCircle workshop. Discount / Gift Certificates for 2 months.
            </p>
          </div>
        </div>
      </section>

      <section className="info-section">
        <h2>Dinners &amp; Networking</h2>
        <p>Sponsor, Chocolate / Desserts Tasting, Wine / Spirits Tasting, or other &mdash; submit your restaurant name, description and a 3-course prix fixe menu.</p>
      </section>

      <section className="info-section">
        <h2>Workshops</h2>
        <p>Hosted in a conference room. Sponsor, Chocolate / Desserts Tasting, Wine / Spirits Tasting, or other &mdash; submit your workshop presenter's topic, title, description and bio.</p>
      </section>

      <section className="info-section">
        <h2>About Us</h2>
        <p>
          One place for every Bay Area networking event, meetup and workshop &mdash; built for organizers who are
          tired of juggling five different tools. calendarGold is a collaboration between Masoud Arouni and Cesar
          Plata (everyCircle).
        </p>
        <p className="nt-hint">Contact: <a href="mailto:maarouni@gmail.com">maarouni@gmail.com</a></p>
      </section>
    </div>
  );
}
