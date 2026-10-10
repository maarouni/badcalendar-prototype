import FillInHere from "../components/FillInHere";

// Cesar's wireframe (Figma, Oct 9 rev): "calendarGold.com Dashboards" — the
// signed-in account hub: your referral code/QR, your digests, your listings,
// revenue-share earnings. No real accounts/auth exist yet, so this is a
// prototype shell with his actual copy — not wired to real data.

export default function DashboardsPage() {
  return (
    <div className="page dash-page">
      <header className="mc-head">
        <div>
          <h1>Dashboards</h1>
          <p>Manage your account, your referrals, and everything you've posted — all in one place.</p>
        </div>
      </header>

      <FillInHere>
        This whole page is a prototype shell from Cesar&rsquo;s Oct 9 wireframe — it needs real accounts/auth
        before any of this is live data. Tell me which piece to wire up first.
      </FillInHere>

      <div className="dash-grid">
        <section className="dash-card dash-card-wide">
          <h3>Invite &amp; Refer</h3>
          <p>Invite / refer others to sign up with your QR code and custom marketing collateral. Sign up today to create an account, submit, and edit your listings.</p>
          <div className="dash-qr-row">
            <div className="dash-qr-box" aria-hidden="true">QR</div>
            <div>
              <div className="dash-referral-code">Your referral code: <b>MASOUD-A1</b></div>
              <button type="button" className="btn-primary btn-sm">Copy referral link</button>
            </div>
          </div>
        </section>

        <section className="dash-card">
          <h3>Earn Money Too!</h3>
          <p className="dash-tagline">Win&ndash;Win&ndash;Win! Share 10% of sales revenue with your referrals (2 levels):</p>
          <ul className="dash-plain-list">
            <li>Event Ticket Fees</li>
            <li>Premier Event Listings</li>
            <li>Careers / Jobs Listings</li>
            <li>Discount / Gift Certificates</li>
          </ul>
          <div className="dash-stat-row">
            <div className="dash-stat"><b>$0.00</b><span>earned so far</span></div>
            <div className="dash-stat"><b>0</b><span>referrals signed up</span></div>
          </div>
        </section>

        <section className="dash-card">
          <h3>Your Digests</h3>
          <div className="dash-link-list">
            <a href="/my-calendar">My Calendar Digest →</a>
            <a href="/employment">My Employment Digest →</a>
            <a href="/discounts">My Certificates Digest →</a>
            <a href="/notifications">My Notifications →</a>
          </div>
        </section>

        <section className="dash-card">
          <h3>Your Listings</h3>
          <p className="nt-hint">Events, job postings and discounts you've submitted, with view/click counts once advertising tracking is built.</p>
          <div className="dash-stat-row">
            <div className="dash-stat"><b>0</b><span>listings posted</span></div>
            <div className="dash-stat"><b>0</b><span>Premier listings</span></div>
          </div>
          <a href="/submit" className="post-listing-link">+ Post a Listing</a>
        </section>

        <section className="dash-card">
          <h3>Innovative, Results-Based Marketing</h3>
          <p>Save $$$! Calculate and manage your advertising cost based on # weeks and # views or # clicks &mdash; full transparency, no pay-and-pray shotgun marketing.</p>
          <a href="/employment/submit" className="nt-hint">See the advertising cost calculator on a Premier listing →</a>
        </section>
      </div>
    </div>
  );
}
