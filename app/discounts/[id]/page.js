"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import PageTemplate from "../../components/PageTemplate";
import { Glyph, IconButton } from "../../components/Icons";
import { HostAvatar, shortDate } from "../../components/EventVisuals";
import { fetchDiscounts, discountLabel } from "../../lib/discounts";

const SEL_KEY = "mc_discount_selection_v1";

// Cesar's "Discount / Gift Certificates Details" (Figma Rev 261012).
export default function DiscountDetail() {
  const { id } = useParams();
  const [d, setD] = useState(undefined);
  const [qr, setQr] = useState(null);
  const [saved, setSaved] = useState(false);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    fetchDiscounts().then((list) => setD(list.find((x) => x.id === id) || null));
    try { setSaved(!!JSON.parse(localStorage.getItem(SEL_KEY) || "{}")[id]); } catch {}
    QRCode.toDataURL(`${window.location.origin}/discounts/${id}`, { width: 240, margin: 1 }).then(setQr).catch(() => {});
  }, [id]);

  if (d === undefined) return <div className="tpl"><p>Loading…</p></div>;
  if (d === null) return <div className="tpl"><div className="empty-state">Couldn&rsquo;t find that certificate. <a href="/discounts">Back to Discount / Gift Certificates</a></div></div>;

  function toggle() {
    try {
      const sel = JSON.parse(localStorage.getItem(SEL_KEY) || "{}");
      sel[id] = !sel[id];
      localStorage.setItem(SEL_KEY, JSON.stringify(sel));
      setSaved(!!sel[id]);
    } catch {}
  }

  return (
    <PageTemplate
      section="discounts"
      title="Discount / Gift Certificate Details"
      subtitle="Everyone loves a good deal! Distribute certificates as gifts, incentives, raffle prizes, and rewards!"
      legend={false}
      actions={<a href="/discounts" className="tpl-action">← All certificates</a>}
    >
      <div className="disc-detail">
        <div className="disc-detail-main">
          <div className="disc-cert">
            <span className="disc-cert-kicker">Discount / Gift Certificate</span>
            <h1>{d.offer}</h1>
            <p className="disc-desc">{d.description}</p>
            <div className="disc-cert-row">
              <span className="disc-value">{discountLabel(d)}</span>
              <span>Expires <b>{shortDate(d.expires)}</b></span>
              {d.premier && <span className="price-chip job-premier-chip">PREMIER</span>}
            </div>
          </div>

          <div className="event-icon-bar">
            <IconButton name="select" tip={saved ? "In My Selection — click to remove" : "Add listing to My Selection"} onClick={toggle} className={saved ? "on" : ""} />
            <IconButton name="like" tip="Like (coming soon)" />
            <IconButton name="share" onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => { setFlash("Link copied"); setTimeout(() => setFlash(""), 1800); })} />
            <IconButton name="pdf" onClick={() => window.print()} />
            <IconButton name="print" onClick={() => window.print()} />
          </div>
          {flash && <div className="fp-flash fp-flash-block">{flash}</div>}

          <h4 className="section-label">Instructions</h4>
          <p>{d.instructions || "—"}</p>

          <h4 className="section-label">Redeem Certificate</h4>
          <p>{(d.redeem || []).join(" and ")}{(d.redeem || []).includes("In-Person") ? ` · ${d.city}, ${d.state || "CA"}` : ""}</p>

          <h4 className="section-label">About {d.company}</h4>
          <p>{d.about || "—"}</p>
          <p className="nt-hint">{d.industry} · {d.city}, {d.state || "CA"}{d.phone ? ` · ${d.phone}` : ""}{d.url ? ` · ${d.url}` : ""}</p>

          <div className="disc-thanks">
            <b>Note:</b> A little courtesy goes a long way&hellip; Please contact and thank the person who donated this discount /
            gift certificate / prize. It&rsquo;s the decent and right thing to do, and you just might make a new friend and/or client!
          </div>
        </div>

        <aside className="disc-detail-side">
          <div className="host-card">
            <HostAvatar name={d.company} size={40} />
            <div>
              <div className="host-card-label">Offered by</div>
              <div className="host-card-name">{d.company}</div>
              {d.contact && <div className="nt-hint">{d.contact}</div>}
            </div>
          </div>
          <div className="qr-card">
            {qr ? <img src={qr} alt={`QR code for ${d.offer}`} /> : <div style={{ padding: 40 }}>Generating QR code…</div>}
            <div className="qr-card-label"><b>Certificate QR Code</b> — show it when you redeem.</div>
          </div>
          <button type="button" className="btn-primary rsvp-btn" onClick={toggle}><Glyph name="select" size={17} /> {saved ? "In My Selection" : "Add to My Selection"}</button>
        </aside>
      </div>
    </PageTemplate>
  );
}
