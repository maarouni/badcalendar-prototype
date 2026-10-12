"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import PageTemplate from "../components/PageTemplate";
import { Glyph } from "../components/Icons";

// Cesar's "Earn Money Too!" + "Invite / Refer Others" (Figma Rev 261012):
// 10% of sales revenue shared up to 3 levels away from a vendor (5 / 3 / 2 %).
const USER_KEY = "mc_user_v1";
const LEVELS = [["Level 1", "5%", "Someone you referred"], ["Level 2", "3%", "Someone they referred"], ["Level 3", "2%", "One more step out"]];
const ELIGIBLE = ["No-Cost and Premier Event Listings", "Event Ticket Fees", "Premier Discount / Gift Certificates", "Premier Employment Listings", "No-Cost and Premier Notifications"];

export default function ReferPage() {
  const [code, setCode] = useState("GUEST");
  const [link, setLink] = useState("");
  const [qr, setQr] = useState(null);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    let c = "GUEST";
    try {
      const u = JSON.parse(localStorage.getItem(USER_KEY) || "null");
      if (u?.name) c = u.name.trim().split(/\s+/)[0].toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10) + "-" + String(u.name.length * 7).padStart(2, "0");
    } catch {}
    setCode(c);
    const l = `${window.location.origin}/login?mode=signup&ref=${encodeURIComponent(c)}`;
    setLink(l);
    QRCode.toDataURL(l, { width: 220, margin: 1 }).then(setQr).catch(() => {});
  }, []);

  async function copy() {
    try { await navigator.clipboard.writeText(link); setFlash("Referral link copied"); }
    catch { setFlash("Couldn't copy — select the link and copy it"); }
    setTimeout(() => setFlash(""), 2200);
  }

  return (
    <PageTemplate
      section={null}
      title="Earn / Invite & Refer"
      subtitle="Earn Money Too! Win-Win-Win!"
      intro="Invite or refer others to sign up with your QR code and custom marketing collateral. Share 10% of sales revenue with your referrals, up to 3 levels away from a vendor."
      actions={<a href="/dashboards" className="tpl-action">My Dashboards</a>}
    >
      <div className="refer-grid">
        <section className="refer-card">
          <h3><Glyph name="qr" size={18} /> Your QR Code</h3>
          {qr ? <img src={qr} alt="Your referral QR code" className="refer-qr" /> : <div className="refer-qr-ph">Generating…</div>}
          <div className="nt-hint">Referral code: <b>{code}</b>{code === "GUEST" && <> — <a href="/login?mode=signup">sign up</a> to get your own</>}</div>
          <div className="refer-link"><input readOnly value={link} aria-label="Referral link" onFocus={(e) => e.target.select()} /></div>
          <div className="send-masoud-actions">
            <button type="button" className="btn-primary btn-sm" onClick={copy}>Copy referral link</button>
            <button type="button" className="btn-ghost btn-sm" onClick={() => window.print()}><Glyph name="print" size={14} /> Print</button>
          </div>
          {flash && <div className="fp-flash fp-flash-block">{flash}</div>}
        </section>

        <section className="refer-card">
          <h3>How the 10% is shared</h3>
          <ol className="refer-levels">
            <li className="refer-vendor"><b>Vendor</b><span>makes a sale on calendarGold</span></li>
            {LEVELS.map(([l, pct, who]) => (
              <li key={l}><b>{pct}</b><span>{l} · {who}</span></li>
            ))}
          </ol>
          <h4>Applies to</h4>
          <ul className="dash-plain-list">{ELIGIBLE.map((e) => <li key={e}>{e}</li>)}</ul>
          <div className="dash-stat-row">
            <div className="dash-stat"><b>$0.00</b><span>earned so far</span></div>
            <div className="dash-stat"><b>0</b><span>referrals signed up</span></div>
          </div>
          <p className="nt-hint">Prototype: payouts and referral tracking need accounts and payments, so the totals stay at zero for now.</p>
        </section>
      </div>
    </PageTemplate>
  );
}
