"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  COMP_OPTIONS, EMPLOYMENT_LEVELS, EMPLOYMENT_TYPES, REGION_GROUPS, INDUSTRIES,
} from "../../lib/employmentTaxonomy";
import { saveLocalJob } from "../../lib/jobs";
import IconNav from "../../components/IconNav";

const ALL_REGIONS = REGION_GROUPS.flatMap((g) => g.options);
const todayIso = () => new Date().toISOString().slice(0, 10);

const EMPTY = {
  title: "", company: "", industry: INDUSTRIES[0],
  city: "", region: ALL_REGIONS[0], level: EMPLOYMENT_LEVELS[0],
  types: [], compType: "none", compMin: "", compMax: "", premier: false,
};

export default function PostJobPage() {
  const router = useRouter();
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  function set(key, value) {
    setF((cur) => ({ ...cur, [key]: value }));
  }

  function toggleType(t) {
    setF((cur) => ({
      ...cur,
      types: cur.types.includes(t) ? cur.types.filter((x) => x !== t) : [...cur.types, t],
    }));
  }

  function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!f.title.trim()) errs.title = "Required";
    if (!f.company.trim()) errs.company = "Required";
    if (!f.city.trim()) errs.city = "Required";
    if (!f.types.length) errs.types = "Pick at least one";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const job = {
      id: `local-${Date.now()}`,
      title: f.title.trim(),
      company: f.company.trim(),
      industry: f.industry,
      city: f.city.trim(),
      region: f.region,
      level: f.level,
      types: f.types,
      compType: f.compType,
      compMin: Number(f.compMin) || 0,
      compMax: Number(f.compMax) || 0,
      posted: todayIso(),
      premier: f.premier,
    };
    saveLocalJob(job);
    router.push("/employment");
  }

  return (
    <>
      <section className="section-intro">
        <IconNav active="employment" />
        <p className="section-intro-line">
          <strong>Post a Listing.</strong> This is where real job postings go in — fill this out and it appears on the Employment page right away.
        </p>
      </section>

      <div className="page" style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px 48px" }}>
        <form className="job-form" onSubmit={submit}>
          <label className={`ed-field wide ${errors.title ? "has-error" : ""}`}>
            <span className="ed-label">Position Title <em>Required</em></span>
            <input type="text" value={f.title} onChange={(e) => set("title", e.target.value)} />
            {errors.title && <span className="ed-error">{errors.title}</span>}
          </label>

          <label className={`ed-field ${errors.company ? "has-error" : ""}`}>
            <span className="ed-label">Company <em>Required</em></span>
            <input type="text" value={f.company} onChange={(e) => set("company", e.target.value)} />
            {errors.company && <span className="ed-error">{errors.company}</span>}
          </label>

          <label className="ed-field">
            <span className="ed-label">Industry</span>
            <select value={f.industry} onChange={(e) => set("industry", e.target.value)}>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </label>

          <label className={`ed-field ${errors.city ? "has-error" : ""}`}>
            <span className="ed-label">City <em>Required</em></span>
            <input type="text" value={f.city} onChange={(e) => set("city", e.target.value)} />
            {errors.city && <span className="ed-error">{errors.city}</span>}
          </label>

          <label className="ed-field">
            <span className="ed-label">Region</span>
            <select value={f.region} onChange={(e) => set("region", e.target.value)}>
              {ALL_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>

          <label className="ed-field">
            <span className="ed-label">Employment Level</span>
            <select value={f.level} onChange={(e) => set("level", e.target.value)}>
              {EMPLOYMENT_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>

          <div className={`ed-field wide ${errors.types ? "has-error" : ""}`}>
            <span className="ed-label">Employment Type(s) <em>Required</em></span>
            <div className="job-type-grid">
              {EMPLOYMENT_TYPES.map((t) => (
                <label key={t} className="fp-option">
                  <input type="checkbox" checked={f.types.includes(t)} onChange={() => toggleType(t)} />
                  <span className="fp-label">{t}</span>
                </label>
              ))}
            </div>
            {errors.types && <span className="ed-error">{errors.types}</span>}
          </div>

          <label className="ed-field">
            <span className="ed-label">Compensation</span>
            <select value={f.compType} onChange={(e) => set("compType", e.target.value)}>
              {COMP_OPTIONS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>

          {(f.compType === "hourly" || f.compType === "monthly" || f.compType === "yearly") && (
            <label className="ed-field">
              <span className="ed-label">Range ({f.compType === "hourly" ? "$/hr" : f.compType === "monthly" ? "$/mo" : "$/yr"})</span>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="number" placeholder="Min" value={f.compMin} onChange={(e) => set("compMin", e.target.value)} />
                <input type="number" placeholder="Max" value={f.compMax} onChange={(e) => set("compMax", e.target.value)} />
              </div>
            </label>
          )}

          <label className="fp-option wide">
            <input type="checkbox" checked={f.premier} onChange={(e) => set("premier", e.target.checked)} />
            <span className="fp-label">Premier listing <em>(top placement)</em></span>
          </label>

          <button type="submit" className="btn-primary" style={{ marginTop: 10 }}>Post Listing</button>
          <p className="proto-note">Prototype: posted listings are saved in this browser only, same as My Calendar.</p>
        </form>
      </div>
    </>
  );
}
