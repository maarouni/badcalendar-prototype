"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import PageTemplate from "../../components/PageTemplate";
import OrgSubNav from "../../components/OrgSubNav";
import OrgStatusPicker from "../../components/OrgStatusPicker";
import { IconButton } from "../../components/Icons";
import { HostAvatar, shortDate } from "../../components/EventVisuals";
import { fetchOrgs, readMembership, writeMembership, fmtMembers, fmtDues, rosterVisible } from "../../lib/organizations";

const SEL_KEY = "mc_org_selection_v1";

// Cesar's "Organization Details" page (Figma, Oct 14).
export default function OrgDetail() {
  const { id } = useParams();
  const [o, setO] = useState(undefined);
  const [qr, setQr] = useState(null);
  const [saved, setSaved] = useState(false);
  const [status, setStatusState] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    fetchOrgs().then((list) => setO(list.find((x) => x.id === id) || null));
    setStatusState(readMembership()[id] || "");
    try { setSaved(!!JSON.parse(localStorage.getItem(SEL_KEY) || "{}")[id]); } catch {}
    try { setLoggedIn(!!localStorage.getItem("mc_user_v1")); } catch {}
    QRCode.toDataURL(`${window.location.origin}/organizations/${id}`, { width: 240, margin: 1 }).then(setQr).catch(() => {});
  }, [id]);

  if (o === undefined) return <div className="tpl"><p>Loading…</p></div>;
  if (o === null) return <div className="tpl"><div className="empty-state">Couldn&rsquo;t find that organization. <a href="/organizations">Back to Organizations</a></div></div>;

  function toggle() {
    try {
      const sel = JSON.parse(localStorage.getItem(SEL_KEY) || "{}");
      sel[id] = !sel[id];
      localStorage.setItem(SEL_KEY, JSON.stringify(sel));
      setSaved(!!sel[id]);
    } catch {}
  }
  function setStatus(s) { writeMembership(id, s); setStatusState(s); }
  const say = (m) => { setFlash(m); setTimeout(() => setFlash(""), 1800); };
  const canSeeRoster = rosterVisible(o, status, loggedIn);

  return (
    <PageTemplate
      section="organizations"
      title="Organization Details"
      subtitle="Get Connected! Learn about this organization and set your membership status."
      legend={false}
      subnav={<OrgSubNav active="details" orgId={o.id} />}
      actions={<a href="/organizations" className="tpl-action">← All organizations</a>}
    >
      <div className="disc-detail org-detail">
        <div className="disc-detail-main">
          <div className="org-hero">
            <HostAvatar name={o.name} size={56} />
            <div>
              <h1>{o.name}</h1>
              <p className="disc-desc"><em>{o.tagline}</em></p>
              <div className="disc-cert-row">
                <span>{(o.formats || []).join(" / ")}</span>
                <span>{o.city}, {o.state || "CA"}</span>
                {o.premier && <span className="price-chip job-premier-chip">PREMIER</span>}
              </div>
            </div>
          </div>

          <div className="event-icon-bar">
            <IconButton name="select" tip={saved ? "In My Selection — click to remove" : "Add listing to My Selection"} onClick={toggle} className={saved ? "on" : ""} />
            <IconButton name="like" tip="Like (coming soon)" />
            <IconButton name="share" onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => say("Link copied"))} />
            <IconButton name="pdf" onClick={() => window.print()} />
            <IconButton name="print" onClick={() => window.print()} />
          </div>
          {flash && <div className="fp-flash fp-flash-block">{flash}</div>}

          <div className="org-stats">
            <div><b>{Number(o.members || 0).toLocaleString()}</b><span>Members</span></div>
            <div><b>{Number(o.dues) > 0 ? `$${Number(o.dues).toLocaleString()}` : "Free"}</b><span>Annual Dues</span></div>
            <div><b>{shortDate(o.posted)}</b><span>Posted / Revised</span></div>
          </div>

          <h4 className="section-label">WHY <em className="nt-hint">Big picture, vision, mission</em></h4>
          <p>{o.why || "—"}</p>

          <h4 className="section-label">BENEFITS <em className="nt-hint">How they help members</em></h4>
          <p>{o.benefits || "—"}</p>

          <h4 className="section-label">Categories • Industry</h4>
          <p>{[...(o.categories || []), o.industry].filter(Boolean).join(" • ")}</p>

          <h4 className="section-label">Contact</h4>
          <p>
            {o.contactName || "—"}
            {o.phone ? ` · ${o.phone}` : ""}
            {o.email ? <> · <a href={`mailto:${o.email}`}>{o.email}</a></> : ""}
            {o.url ? <> · <a href={o.url} target="_blank" rel="noreferrer">Website</a></> : ""}
            {o.profileUrl ? <> · <a href={o.profileUrl} target="_blank" rel="noreferrer">Full profile</a></> : ""}
          </p>

          <h4 className="section-label">Members</h4>
          {canSeeRoster ? (
            <p><a href={`/organizations/${o.id}/members`}>View Leadership, Staff and Members →</a> <span className="nt-hint">({(o.roster || []).length} listed)</span></p>
          ) : (
            <p className="nt-hint">
              {o.memberList === "members" ? "Member list is visible to members only — set your status to Member to view it." :
                o.memberList === "registered" ? <>Member list is visible to registered users. <a href="/login">Sign Up / Log In</a></> :
                  "This organization keeps its member list private."}
            </p>
          )}
        </div>

        <aside className="disc-detail-side">
          <div className="host-card org-status-card">
            <OrgStatusPicker value={status} onChange={setStatus} />
          </div>
          <div className="qr-card">
            {qr ? <img src={qr} alt={`QR code for ${o.name}`} /> : <div style={{ padding: 40 }}>Generating QR code…</div>}
            <div className="qr-card-label"><b>Organization QR Code</b> — share this page at events.</div>
          </div>
          <a className="btn-ghost btn-sm" href={`/organizations/submit?id=${o.id}`}>EDIT Organization Details</a>
        </aside>
      </div>
    </PageTemplate>
  );
}
