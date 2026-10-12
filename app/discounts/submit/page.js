"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageTemplate from "../../components/PageTemplate";
import PremierCalculator from "../../components/PremierCalculator";
import { REGION_GROUPS, INDUSTRIES, REDEEM_OPTIONS, saveLocalDiscount } from "../../lib/discounts";

// Cesar's "EDIT My Discount / Gift Certificates Details" (Figma Rev 261012).
const ALL_REGIONS = REGION_GROUPS.flatMap((g) => g.options);
const todayIso = () => new Date().toISOString().slice(0, 10);

const EMPTY = {
  offer: "", description: "", value: "", expires: "", instructions: "",
  redeem: ["In-Person"], company: "", industry: INDUSTRIES[0], city: "", state: "CA", region: ALL_REGIONS[0],
  about: "", contact: "", phone: "", email: "", url: "", premier: false,
};

export default function PostCertificatePage() {
  const router = useRouter();
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [paid, setPaid] = useState(null);
  const set = (k, v) => setF((c) => ({ ...c, [k]: v }));
  const toggleRedeem = (r) => setF((c) => ({ ...c, redeem: c.redeem.includes(r) ? c.redeem.filter((x) => x !== r) : [...c.redeem, r] }));

  function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!f.offer.trim()) errs.offer = "Required";
    if (!f.company.trim()) errs.company = "Required";
    if (!f.expires) errs.expires = "Required";
    if (!f.redeem.length) errs.redeem = "Pick at least one";
    if (f.redeem.includes("In-Person") && !f.city.trim()) errs.city = "Where can it be redeemed?";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    saveLocalDiscount({
      ...f,
      id: `local-d-${Date.now()}`,
      offer: f.offer.trim(), company: f.company.trim(), city: f.city.trim(),
      value: Number(f.value) || 0,
      posted: todayIso(),
      premierCost: f.premier && paid ? paid.total : null,
    });
    router.push("/discounts");
  }

  const F = ({ k, label, req, wide, type = "text", ...rest }) => (
    <label className={`ed-field ${wide ? "wide" : ""} ${errors[k] ? "has-error" : ""}`}>
      <span className="ed-label">{label} {req && <em>Required</em>}</span>
      <input type={type} value={f[k]} onChange={(e) => set(k, e.target.value)} {...rest} />
      {errors[k] && <span className="ed-error">{errors[k]}</span>}
    </label>
  );

  return (
    <PageTemplate
      section="discounts"
      mode="edit"
      narrow
      title="Discount / Gift Certificates"
      subtitle="Post a Certificate"
      intro="What is your cost of acquiring a new client, customer or member? Promote your business or organization with a discount / gift certificate."
      actions={<a href="/discounts" className="tpl-action">View certificates</a>}
    >
      <form className="job-form" onSubmit={submit}>
        {F({ k: "offer", label: "Offer (product or service)", req: true, wide: true, placeholder: "e.g. $25 off a 60-minute massage" })}
        {F({ k: "description", label: "One-line description", wide: true, maxLength: 140 })}
        {F({ k: "value", label: "Discount value ($) — 0 if free", type: "number", min: 0 })}
        {F({ k: "expires", label: "Expires", req: true, type: "date", min: todayIso() })}

        <div className={`ed-field wide ${errors.redeem ? "has-error" : ""}`}>
          <span className="ed-label">Redeem Certificate <em>Required</em></span>
          <div className="job-type-grid">
            {REDEEM_OPTIONS.map((r) => (
              <label key={r} className="fp-option">
                <input type="checkbox" checked={f.redeem.includes(r)} onChange={() => toggleRedeem(r)} />
                <span className="fp-label">{r}</span>
              </label>
            ))}
          </div>
          {errors.redeem && <span className="ed-error">{errors.redeem}</span>}
        </div>

        <label className="ed-field wide">
          <span className="ed-label">Instructions</span>
          <textarea rows={2} value={f.instructions} onChange={(e) => set("instructions", e.target.value)} placeholder="How to redeem: code, show at the register, book online…" />
        </label>

        {F({ k: "company", label: "Business / Organization", req: true })}
        <label className="ed-field">
          <span className="ed-label">Industry</span>
          <select value={f.industry} onChange={(e) => set("industry", e.target.value)}>
            {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
          </select>
        </label>
        {F({ k: "city", label: "City", req: f.redeem.includes("In-Person") })}
        <label className="ed-field">
          <span className="ed-label">Region</span>
          <select value={f.region} onChange={(e) => set("region", e.target.value)}>
            {REGION_GROUPS.map((g) => (
              <optgroup key={g.group} label={g.group}>{g.options.map((o) => <option key={o}>{o}</option>)}</optgroup>
            ))}
          </select>
        </label>

        <label className="ed-field wide">
          <span className="ed-label">Description of Business / Organization</span>
          <textarea rows={2} value={f.about} onChange={(e) => set("about", e.target.value)} placeholder="Tagline, product(s) or service(s)" />
        </label>
        {F({ k: "contact", label: "Contact name, title" })}
        {F({ k: "phone", label: "Phone", type: "tel" })}
        {F({ k: "email", label: "Email", type: "email" })}
        {F({ k: "url", label: "Website", type: "url", placeholder: "https://" })}

        <label className="fp-option wide">
          <input type="checkbox" checked={f.premier} onChange={(e) => set("premier", e.target.checked)} />
          <span className="fp-label">Submit as a Premier listing <em>(top placement)</em></span>
        </label>
        {f.premier && <PremierCalculator onConfirm={setPaid} />}

        <button type="submit" className="btn-primary" style={{ marginTop: 10 }}>Post Certificate</button>
        <p className="proto-note">Until the shared database is set up, certificates you post show only on this computer. After posting, use <b>Send my certificates to Masoud</b> on the Discount / Gift Certificates page to make them permanent for everyone.</p>
      </form>
    </PageTemplate>
  );
}
