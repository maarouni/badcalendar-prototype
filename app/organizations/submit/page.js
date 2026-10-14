"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageTemplate from "../../components/PageTemplate";
import OrgSubNav from "../../components/OrgSubNav";
import PremierCalculator from "../../components/PremierCalculator";
import {
  REGION_GROUPS, CATEGORY_GROUPS, INDUSTRIES, ORG_FORMATS, MEMBER_LIST_VISIBILITY, ROSTER_GROUPS,
  fetchOrgs, saveLocalOrg,
} from "../../lib/organizations";

// Cesar's "EDIT My Organization Details" (Figma, Oct 14).
const ALL_REGIONS = REGION_GROUPS.flatMap((g) => g.options);
const todayIso = () => new Date().toISOString().slice(0, 10);

const EMPTY = {
  name: "", tagline: "", formats: ["In-Person"], premier: false,
  categories: [], industry: INDUSTRIES[0], city: "", state: "CA", region: ALL_REGIONS[0],
  members: "", dues: "", profileUrl: "", why: "", benefits: "", memberList: "hide",
  contactName: "", phone: "", email: "", url: "", roster: [],
};
const EMPTY_PERSON = { role: "leadership", name: "", title: "", org: "", city: "" };

function EditOrgInner() {
  const router = useRouter();
  const editId = useSearchParams().get("id");
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [paid, setPaid] = useState(null);
  const [loadedFrom, setLoadedFrom] = useState(null);
  const set = (k, v) => setF((c) => ({ ...c, [k]: v }));
  const toggleList = (k, v) => setF((c) => ({ ...c, [k]: c[k].includes(v) ? c[k].filter((x) => x !== v) : [...c[k], v] }));

  // Editing an existing org: start from its current details.
  useEffect(() => {
    if (!editId) return;
    fetchOrgs().then((list) => {
      const o = list.find((x) => x.id === editId);
      if (o) { setF({ ...EMPTY, ...o, members: o.members ?? "", dues: o.dues ?? "", roster: o.roster || [] }); setLoadedFrom(o.name); }
    });
  }, [editId]);

  const setPerson = (i, k, v) => setF((c) => ({ ...c, roster: c.roster.map((p, j) => (j === i ? { ...p, [k]: v } : p)) }));
  const addPerson = () => setF((c) => ({ ...c, roster: [...c.roster, { ...EMPTY_PERSON, org: c.name }] }));
  const removePerson = (i) => setF((c) => ({ ...c, roster: c.roster.filter((_, j) => j !== i) }));

  function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!f.name.trim()) errs.name = "Required";
    if (!f.tagline.trim()) errs.tagline = "Required";
    if (!f.formats.length) errs.formats = "Pick at least one";
    if (f.formats.includes("In-Person") && !f.city.trim()) errs.city = "Where does the organization meet?";
    if (f.members !== "" && Number(f.members) < 0) errs.members = "Can't be negative";
    if (f.dues !== "" && Number(f.dues) < 0) errs.dues = "Can't be negative";
    setErrors(errs);
    if (Object.keys(errs).length) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const id = editId || `local-o-${Date.now()}`;
    saveLocalOrg({
      ...f,
      id,
      name: f.name.trim(), tagline: f.tagline.trim(), city: f.city.trim(),
      members: Number(f.members) || 0, dues: Number(f.dues) || 0,
      roster: f.roster.filter((p) => p.name.trim()),
      posted: todayIso(),
      premierCost: f.premier && paid ? paid.total : null,
    });
    router.push(`/organizations/${id}`);
  }

  const F = ({ k, label, req, wide, type = "text", ...rest }) => (
    <label className={`ed-field ${wide ? "wide" : ""} ${errors[k] ? "has-error" : ""}`}>
      <span className="ed-label">{label} {req && <em>Required</em>}</span>
      <input type={type} value={f[k]} onChange={(e) => set(k, e.target.value)} {...rest} />
      {errors[k] && <span className="ed-error">{errors[k]}</span>}
    </label>
  );
  const T = ({ k, label, hint, rows = 3 }) => (
    <label className="ed-field wide">
      <span className="ed-label">{label} {hint && <em className="ed-hint">{hint}</em>}</span>
      <textarea rows={rows} value={f[k]} onChange={(e) => set(k, e.target.value)} />
    </label>
  );

  return (
    <PageTemplate
      section="organizations"
      mode="edit"
      narrow
      title="EDIT Organization Details"
      subtitle={loadedFrom ? `Editing: ${loadedFrom}` : "Add an Organization"}
      subnav={<OrgSubNav active="edit" orgId={editId} />}
      intro="What is your cost of acquisition of a new member? Manage and promote your organization here."
      actions={<a href="/organizations" className="tpl-action">View organizations</a>}
    >
      <form className="job-form" onSubmit={submit}>
        {F({ k: "name", label: "Organization Name", req: true, wide: true })}
        {F({ k: "tagline", label: "Tagline or one-line description", req: true, wide: true, maxLength: 140 })}

        <div className={`ed-field wide ${errors.formats ? "has-error" : ""}`}>
          <span className="ed-label">Organization Type <em>Required</em></span>
          <div className="job-type-grid">
            {ORG_FORMATS.map((t) => (
              <label key={t} className="fp-option">
                <input type="checkbox" checked={f.formats.includes(t)} onChange={() => toggleList("formats", t)} />
                <span className="fp-label">{t}</span>
              </label>
            ))}
          </div>
          {errors.formats && <span className="ed-error">{errors.formats}</span>}
        </div>

        {F({ k: "city", label: "City", req: f.formats.includes("In-Person"), maxLength: 60 })}
        <label className="ed-field">
          <span className="ed-label">Region</span>
          <select value={f.region} onChange={(e) => set("region", e.target.value)}>
            {REGION_GROUPS.map((g) => (
              <optgroup key={g.group} label={g.group}>{g.options.map((o) => <option key={o}>{o}</option>)}</optgroup>
            ))}
          </select>
        </label>
        <label className="ed-field">
          <span className="ed-label">Industry</span>
          <select value={f.industry} onChange={(e) => set("industry", e.target.value)}>
            {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
          </select>
        </label>
        {F({ k: "profileUrl", label: "Full profile URL", type: "url", placeholder: "https://" })}

        <details className="ed-field wide org-cat-picker">
          <summary className="ed-label">Categories <em className="ed-hint">{f.categories.length ? `${f.categories.length} selected` : "Select all that apply"}</em></summary>
          {CATEGORY_GROUPS.map((g) => (
            <fieldset key={g.group} className="org-cat-group">
              <legend>{g.group}</legend>
              {g.options.map((c) => (
                <label key={c} className="fp-option">
                  <input type="checkbox" checked={f.categories.includes(c)} onChange={() => toggleList("categories", c)} />
                  <span className="fp-label">{c}</span>
                </label>
              ))}
            </fieldset>
          ))}
        </details>

        {T({ k: "why", label: "WHY", hint: "Big picture, vision, mission…" })}
        {T({ k: "benefits", label: "BENEFITS", hint: "How you help others • Benefits of joining / working with you…" })}

        {F({ k: "members", label: "# Members", type: "number", min: 0, step: 1 })}
        {F({ k: "dues", label: "$ Annual Dues — 0 if free", type: "number", min: 0 })}

        <div className="ed-field wide">
          <span className="ed-label">Member List <em className="ed-hint">Mini-cards — who can see them</em></span>
          <div className="job-type-grid">
            {MEMBER_LIST_VISIBILITY.map((v) => (
              <label key={v.id} className="fp-option">
                <input type="radio" name="member-list" checked={f.memberList === v.id} onChange={() => set("memberList", v.id)} />
                <span className="fp-label">{v.label}{v.def && <em> (default)</em>}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="ed-field wide">
          <span className="ed-label">Leadership, Staff and Members <em className="ed-hint">Shown on the Organization Members page</em></span>
          {f.roster.map((p, i) => (
            <div key={i} className="org-roster-row">
              <select value={p.role} onChange={(e) => setPerson(i, "role", e.target.value)} aria-label="Group">
                {ROSTER_GROUPS.map((g) => <option key={g.id} value={g.id}>{g.label.replace("Organization ", "")}</option>)}
              </select>
              <input placeholder="Name" value={p.name} onChange={(e) => setPerson(i, "name", e.target.value)} aria-label="Name" />
              <input placeholder="Title" value={p.title} onChange={(e) => setPerson(i, "title", e.target.value)} aria-label="Title" />
              <input placeholder="City, State" value={p.city} onChange={(e) => setPerson(i, "city", e.target.value)} aria-label="City" />
              <button type="button" className="btn-ghost btn-sm" onClick={() => removePerson(i)} aria-label={`Remove ${p.name || "row"}`}>✕</button>
            </div>
          ))}
          <button type="button" className="btn-ghost btn-sm" onClick={addPerson} style={{ alignSelf: "flex-start" }}>+ Add a person</button>
        </div>

        {F({ k: "contactName", label: "Contact name, title" })}
        {F({ k: "phone", label: "Phone", type: "tel" })}
        {F({ k: "email", label: "Email", type: "email" })}
        {F({ k: "url", label: "Website", type: "url", placeholder: "https://" })}

        <p className="proto-note wide">Logo, poster, QR code upload and the Gallery (up to 10 documents, images or videos) come with image uploads in the next phase. The organization&rsquo;s own QR code is generated automatically on its details page.</p>

        <label className="fp-option wide">
          <input type="checkbox" checked={f.premier} onChange={(e) => set("premier", e.target.checked)} />
          <span className="fp-label">Submit as a Premier listing <em>(full details + top placement)</em></span>
        </label>
        {f.premier && <PremierCalculator onConfirm={setPaid} />}

        <button type="submit" className="btn-primary" style={{ marginTop: 10 }}>{editId ? "Save Organization" : "Add Organization"}</button>
        <p className="proto-note">Until the shared database is set up, organizations you add show only on this computer. After saving, use <b>Send my organizations to Masoud</b> on the Organization Digest page to make them permanent for everyone.</p>
      </form>
    </PageTemplate>
  );
}

export default function EditOrgPage() {
  return <Suspense fallback={null}><EditOrgInner /></Suspense>;
}
