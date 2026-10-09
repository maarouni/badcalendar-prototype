"use client";

import { useMemo, useState } from "react";
import { REGION_GROUPS, CATEGORY_GROUPS } from "../lib/taxonomy";
import { saveLocalEvent } from "../lib/events";
import { Poster, HostAvatar, Icon, fmtTime, startTime, shortDate, isoOf, parseDate } from "../components/EventVisuals";

// Cesar's spec "EDIT My Events" (rev 260924): preview strip on top, filter
// attributes on the left, the event form on the right, and — for Premier
// listings — "Calculate My Advertising Budget".

const RATE_VIEW = 0.005; // $ per view per week (spec)
const RATE_CLICK = 0.35; // $ per click per week (spec)
const BIG_COUNTIES = new Set(["Santa Clara", "San Francisco", "Alameda"]);
const MAX_DESC = 1250;
const MAX_EXTRA_DATES = 6;

const EMPTY = {
  premier: false,
  type: "In Person",
  region: "Alameda",
  categories: ["Networking"],
  title: "",
  tagline: "",
  date: "",
  endDate: "",
  startT: "18:00",
  endT: "21:00",
  extraDates: [],
  venue: "",
  address: "",
  city: "",
  state: "CA",
  zip: "",
  country: "USA",
  hostedBy: "",
  url: "",
  price: 0,
  description: "",
  display: { qr: true, rsvpCount: true, rsvpList: false },
  contact: { name: "", phone: "", email: "" },
  adStart: "",
  adEnd: "",
  adFormat: "views",
};

function money(n) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Prototype reach estimate — stands in for the real "matching filters" count.
function estimateReach(f) {
  const base = 900 + 140 * Math.min(f.categories.length, 6);
  const mult = f.type === "Online" ? 1.5 : BIG_COUNTIES.has(f.region) ? 1.3 : 1;
  const big = Math.round(base * mult);
  const mine = Math.round(big * 0.18);
  const notif = Math.round(big * 0.6);
  const views = big + mine + notif;
  return { big, mine, notif, views, clicks: Math.round(views * 0.025) };
}

function weeksBetween(a, b) {
  const s = parseDate(a), e = parseDate(b);
  if (!s || !e || e < s) return 1;
  return Math.max(1, Math.ceil((Math.round((e - s) / 86400000) + 1) / 7));
}

function Field({ label, hint, required, error, children, wide }) {
  return (
    <label className={`ed-field ${wide ? "wide" : ""} ${error ? "has-error" : ""}`}>
      <span className="ed-label">
        {label}
        {required && <em>Required</em>}
        {hint && <i>{hint}</i>}
      </span>
      {children}
      {error && <span className="ed-error">{error}</span>}
    </label>
  );
}

function Toggle({ on, onChange, label }) {
  return (
    <button type="button" className={`ed-toggle ${on ? "on" : ""}`} onClick={() => onChange(!on)} aria-pressed={on}>
      <span className="ed-toggle-dot" />
      {label}: <b>{on ? "Display" : "Hide"}</b>
    </button>
  );
}

export default function SubmitEvent() {
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);
  const today = useMemo(() => isoOf(new Date()), []);

  const clearError = (k) =>
    setErrors((e) => {
      if (!e[k]) return e;
      const n = { ...e };
      delete n[k];
      return n;
    });
  const set = (k, v) => {
    setF((x) => ({ ...x, [k]: v }));
    clearError(k);
  };
  const setIn = (k, sub, v) => setF((x) => ({ ...x, [k]: { ...x[k], [sub]: v } }));

  function toggleCat(c) {
    clearError("categories");
    setF((x) => ({
      ...x,
      categories: x.categories.includes(c) ? x.categories.filter((y) => y !== c) : [...x.categories, c],
    }));
  }

  const cost = f.price > 0 ? `$${f.price}` : "Free";
  const time = f.startT && f.endT ? `${f.startT}-${f.endT}` : "";
  const preview = {
    id: "preview",
    title: f.title || "Your event title",
    hostedBy: f.hostedBy || "Your business",
    date: f.date || today,
    time,
    city: f.city || "City",
    region: f.type === "Online" ? "" : f.region,
    type: f.type,
    category: f.categories[0] || "Networking",
    categories: f.categories,
    cost,
    premier: f.premier,
  };

  const reach = estimateReach(f);
  const adStart = f.adStart || today;
  const adEnd = f.adEnd || f.date || today;
  const weeks = weeksBetween(adStart, adEnd);
  const totalViews = reach.views * weeks * RATE_VIEW;
  const totalClicks = reach.clicks * weeks * RATE_CLICK;
  const budget = f.adFormat === "views" ? totalViews : totalClicks;

  function validate() {
    const e = {};
    if (!f.title.trim()) e.title = "Give your event a title.";
    if (!f.date) e.date = "Pick the event date.";
    if (f.endDate && f.date && f.endDate < f.date) e.endDate = "End date is before the start date.";
    if (!f.hostedBy.trim()) e.hostedBy = "Who is hosting?";
    if (f.type !== "Online" && !f.city.trim()) e.city = "Which city?";
    if (!f.categories.length) e.categories = "Pick at least one category.";
    setErrors(e);
    if (Object.keys(e).length) {
      document.querySelector(".has-error, .ed-cat-error")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return !Object.keys(e).length;
  }

  async function submit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true);
    const payload = {
      ...f,
      time,
      cost,
      category: f.categories[0],
      extraDates: f.extraDates.filter(Boolean),
      city: f.type === "Online" ? "" : f.city,
      adBudget: f.premier
        ? { start: adStart, end: adEnd, weeks, format: f.adFormat, estViewsPerWeek: reach.views, estClicksPerWeek: reach.clicks, total: Number(budget.toFixed(2)) }
        : null,
    };
    let saved;
    try {
      const r = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      saved = await r.json();
    } catch {
      saved = { ...payload, id: String(Date.now()) };
    }
    saveLocalEvent(saved);
    setBusy(false);
    setDone(saved);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <div className="page ed-page">
        <div className="ed-done">
          <div className="ed-done-circle"><Icon name="check" /></div>
          <h1>{done.premier ? "Added to your shopping cart" : "Your event is listed"}</h1>
          <p>
            {done.premier
              ? `Premier listing, ${money(done.adBudget?.total || 0)} advertising budget. Checkout and payment come with the next build — for this demo it's live on One Big Calendar as Premier.`
              : "It's on One Big Calendar now, as a free Regular listing."}
          </p>
          <div className="ed-done-actions">
            <a className="btn-primary" href="/#timeline">See it on One Big Calendar</a>
            <button type="button" className="btn-ghost" onClick={() => { setF(EMPTY); setDone(null); }}>Add another event</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <form className="page ed-page" onSubmit={submit} noValidate>
      <header className="ed-head">
        <div>
          <h1>Add an Event</h1>
          <p>Free Regular listing, or Premier for top placement with a budget you control.</p>
        </div>
        <div className="ed-steps" aria-hidden="true">
          <span><b>1</b>Preview</span>
          <span><b>2</b>Attributes</span>
          <span><b>3</b>Details</span>
          {f.premier && <span><b>4</b>Budget</span>}
        </div>
      </header>

      {/* 1 — live preview, both formats (spec: Regular Format / Premier Format strip) */}
      <section className="ed-preview">
        <div className="ed-section-title"><b>1</b> How it will look on One Big Calendar</div>
        <div className={`ed-pv-row ${!f.premier ? "chosen" : ""}`}>
          <span className="ed-pv-label">Regular</span>
          <article className="tl-card regular">
            <div className="tl-main">
              <div className="tl-reg-1">
                <span className="tl-time">{startTime(preview.time)}</span>
                <span className="tl-title">{preview.title}</span>
              </div>
              <div className="tl-reg-2">
                {shortDate(preview.date)} · {preview.type === "Online" ? "Online" : preview.city} · {preview.hostedBy} · {preview.cost}
              </div>
            </div>
          </article>
        </div>
        <div className={`ed-pv-row ${f.premier ? "chosen" : ""}`}>
          <span className="ed-pv-label">Premier</span>
          <article className="tl-card premier">
            <div className="tl-thumb"><Poster event={preview} label={false} /></div>
            <div className="tl-main">
              <div className="tl-kicker">Premier</div>
              <span className="tl-title">{preview.title}</span>
              <div className="tl-line"><Icon name="clock" />{shortDate(preview.date)} · {fmtTime(preview.time)}</div>
              <div className="tl-line"><Icon name={preview.type === "Online" ? "globe" : "pin"} />{preview.type === "Online" ? "Online" : `${preview.city}${preview.region ? `, ${preview.region}` : ""}`}</div>
              <div className="tl-line tl-host"><HostAvatar name={preview.hostedBy} size={18} /><b>{preview.hostedBy}</b><span className="tl-sep">·</span><Icon name="tag" />{preview.cost}</div>
            </div>
          </article>
        </div>
      </section>

      <div className="ed-grid">
        {/* 2 — attributes (spec: left "Filters" column) */}
        <aside className="ed-attrs">
          <div className="ed-section-title"><b>2</b> Attributes</div>
          <p className="ed-help">These decide who sees your event — they match the filters people use on One Big Calendar.</p>

          <div className="ed-group">
            <div className="ed-group-title">Listing</div>
            <div className="ed-tier">
              <button type="button" className={!f.premier ? "on" : ""} onClick={() => set("premier", false)}>
                <b>Regular</b><span>Free · 2-line listing</span>
              </button>
              <button type="button" className={f.premier ? "on" : ""} onClick={() => set("premier", true)}>
                <b>Premier</b><span>Top placement · poster · paid by results</span>
              </button>
            </div>
          </div>

          <div className="ed-group">
            <div className="ed-group-title">Event type</div>
            <div className="ed-seg">
              {["In Person", "Online"].map((t) => (
                <button key={t} type="button" className={f.type === t ? "on" : ""} onClick={() => set("type", t)}>{t}</button>
              ))}
            </div>
          </div>

          {f.type !== "Online" && (
            <div className="ed-group">
              <div className="ed-group-title">Region</div>
              <select value={f.region} onChange={(e) => set("region", e.target.value)}>
                {REGION_GROUPS.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.options.map((o) => <option key={o}>{o}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          <div className={`ed-group ${errors.categories ? "ed-cat-error" : ""}`}>
            <div className="ed-group-title">Categories <i>{f.categories.length} selected</i></div>
            {errors.categories && <span className="ed-error">{errors.categories}</span>}
            {CATEGORY_GROUPS.map((g, gi) => (
              <details key={g.group} className="ed-cats" open={gi === 0 || g.options.some((o) => f.categories.includes(o))}>
                <summary>{g.group}</summary>
                <div className="ed-chips">
                  {g.options.map((o) => (
                    <button key={o} type="button" className={`ed-chip ${f.categories.includes(o) ? "on" : ""}`} onClick={() => toggleCat(o)}>
                      {o}
                    </button>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </aside>

        {/* 3 — details (spec: "My Events" column) */}
        <section className="ed-form">
          <div className="ed-section-title"><b>3</b> Event details</div>

          <div className="ed-card">
            <Field label="Event title" required error={errors.title} wide>
              <input type="text" maxLength={140} value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. East Bay Founders Mixer" />
            </Field>
            <Field label="Tagline" hint="one line" wide>
              <input type="text" maxLength={140} value={f.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="What makes it worth going?" />
            </Field>
          </div>

          <div className="ed-card ed-cols">
            <Field label="Date" required error={errors.date}>
              <input type="date" value={f.date} min={today} onChange={(e) => set("date", e.target.value)} />
            </Field>
            <Field label="Ends" hint="multi-day only" error={errors.endDate}>
              <input type="date" value={f.endDate} min={f.date || today} onChange={(e) => set("endDate", e.target.value)} />
            </Field>
            <Field label="Starts">
              <input type="time" value={f.startT} onChange={(e) => set("startT", e.target.value)} />
            </Field>
            <Field label="Ends at">
              <input type="time" value={f.endT} onChange={(e) => set("endT", e.target.value)} />
            </Field>
            <div className="ed-field wide">
              <span className="ed-label">Recurring event <i>up to {MAX_EXTRA_DATES} more dates</i></span>
              <div className="ed-dates">
                {f.extraDates.map((d, i) => (
                  <span key={i} className="ed-date-pill">
                    <input type="date" value={d} min={f.date || today} onChange={(e) => set("extraDates", f.extraDates.map((x, j) => (j === i ? e.target.value : x)))} />
                    <button type="button" aria-label="Remove date" onClick={() => set("extraDates", f.extraDates.filter((_, j) => j !== i))}>✕</button>
                  </span>
                ))}
                {f.extraDates.length < MAX_EXTRA_DATES && (
                  <button type="button" className="ed-add" onClick={() => set("extraDates", [...f.extraDates, ""])}>
                    <Icon name="plus" /> Add a date
                  </button>
                )}
              </div>
            </div>
          </div>

          {f.type !== "Online" ? (
            <div className="ed-card ed-cols">
              <Field label="Venue / location name" wide>
                <input type="text" value={f.venue} onChange={(e) => set("venue", e.target.value)} placeholder="e.g. The Hatch, 2nd floor" />
              </Field>
              <Field label="Address" wide>
                <input type="text" value={f.address} onChange={(e) => set("address", e.target.value)} />
              </Field>
              <Field label="City" required error={errors.city}>
                <input type="text" value={f.city} onChange={(e) => set("city", e.target.value)} />
              </Field>
              <Field label="State">
                <input type="text" value={f.state} onChange={(e) => set("state", e.target.value)} />
              </Field>
              <Field label="ZIP code">
                <input type="text" inputMode="numeric" maxLength={10} value={f.zip} onChange={(e) => set("zip", e.target.value)} />
              </Field>
              <Field label="Country">
                <input type="text" value={f.country} onChange={(e) => set("country", e.target.value)} />
              </Field>
            </div>
          ) : (
            <div className="ed-card">
              <Field label="Online link" hint="shared with people who RSVP" wide>
                <input type="url" value={f.url} onChange={(e) => set("url", e.target.value)} placeholder="https://" />
              </Field>
            </div>
          )}

          <div className="ed-card ed-cols">
            <Field label="Hosted by" required error={errors.hostedBy}>
              <input type="text" value={f.hostedBy} onChange={(e) => set("hostedBy", e.target.value)} placeholder="Business or organization" />
            </Field>
            <Field label="Lowest ticket price" hint="$ · 0 = free">
              <input type="number" min="0" step="1" value={f.price} onChange={(e) => set("price", Math.max(0, Number(e.target.value)))} />
            </Field>
            {f.type !== "Online" && (
              <Field label="External URL" hint="if applicable" wide>
                <input type="url" value={f.url} onChange={(e) => set("url", e.target.value)} placeholder="https://" />
              </Field>
            )}
            <Field label="Full description" hint="details, instructions, refund policy…" wide>
              <textarea rows={6} maxLength={MAX_DESC} value={f.description} onChange={(e) => set("description", e.target.value)} />
              <span className="ed-count">{f.description.length} / {MAX_DESC}</span>
            </Field>
          </div>

          <div className="ed-card">
            <div className="ed-label">Gallery <i>document, icon, image or video · up to 10</i></div>
            <div className="ed-drop">
              <div className="ed-drop-circles" aria-hidden="true"><i /><i /><i /></div>
              Image upload arrives with the storage step. For now, Premier listings get a generated poster.
            </div>
            <div className="ed-toggles">
              <Toggle label="Event QR code" on={f.display.qr} onChange={(v) => setIn("display", "qr", v)} />
              <Toggle label="# of RSVPs" on={f.display.rsvpCount} onChange={(v) => setIn("display", "rsvpCount", v)} />
              <Toggle label="List of RSVPs" on={f.display.rsvpList} onChange={(v) => setIn("display", "rsvpList", v)} />
            </div>
          </div>

          <div className="ed-card ed-cols">
            <div className="ed-label wide-label">Event contact</div>
            <Field label="Name / organization">
              <input type="text" value={f.contact.name} onChange={(e) => setIn("contact", "name", e.target.value)} />
            </Field>
            <Field label="Phone">
              <input type="tel" value={f.contact.phone} onChange={(e) => setIn("contact", "phone", e.target.value)} />
            </Field>
            <Field label="Email" wide>
              <input type="email" value={f.contact.email} onChange={(e) => setIn("contact", "email", e.target.value)} />
            </Field>
          </div>

          {/* 4 — Calculate My Advertising Budget (Premier only) */}
          {f.premier && (
            <section className="ed-card ed-budget">
              <div className="ed-section-title"><b>4</b> Calculate my advertising budget</div>
              <p className="ed-budget-pitch">
                <strong>Results-based marketing.</strong> You pay for the people your listing actually reaches — not a flat fee.
              </p>
              <div className="ed-cols">
                <Field label="Advertise from">
                  <input type="date" value={adStart} min={today} onChange={(e) => set("adStart", e.target.value)} />
                </Field>
                <Field label="Until">
                  <input type="date" value={adEnd} min={adStart} onChange={(e) => set("adEnd", e.target.value)} />
                </Field>
              </div>
              <table className="ed-calc">
                <thead>
                  <tr><th>Where it shows</th><th>Views / week</th><th>Clicks / week</th></tr>
                </thead>
                <tbody>
                  <tr><td>One Big Calendar</td><td>{reach.big.toLocaleString()}</td><td /></tr>
                  <tr><td>My Calendars</td><td>{reach.mine.toLocaleString()}</td><td /></tr>
                  <tr><td>Notifications</td><td>{reach.notif.toLocaleString()}</td><td /></tr>
                  <tr className="ed-calc-sum"><td><b>A</b> Estimated weekly reach</td><td>{reach.views.toLocaleString()}</td><td>{reach.clicks.toLocaleString()}</td></tr>
                  <tr><td><b>B</b> Weeks advertised</td><td colSpan={2}>{weeks}</td></tr>
                  <tr><td><b>C</b> Rate</td><td>${RATE_VIEW} / view</td><td>{money(RATE_CLICK)} / click</td></tr>
                  <tr className="ed-calc-total"><td><b>D</b> Total = A × B × C</td><td>{money(totalViews)}</td><td>{money(totalClicks)}</td></tr>
                </tbody>
              </table>
              <div className="ed-seg ed-pay">
                <button type="button" className={f.adFormat === "views" ? "on" : ""} onClick={() => set("adFormat", "views")}>
                  Pay per view · {money(totalViews)}
                </button>
                <button type="button" className={f.adFormat === "clicks" ? "on" : ""} onClick={() => set("adFormat", "clicks")}>
                  Pay per click · {money(totalClicks)}
                </button>
              </div>
              <p className="ed-note">
                Your Premier listing runs until the end date or until the budget is used up, then becomes a Regular listing.
                Any unused budget stays in your account. Reach numbers are prototype estimates.
              </p>
            </section>
          )}

          <div className="ed-submit">
            <button type="submit" className="btn-primary ed-submit-btn" disabled={busy}>
              {busy ? "Saving…" : f.premier ? `Add event to shopping cart · ${money(budget)}` : "Submit free listing"}
            </button>
          </div>
        </section>
      </div>
    </form>

    <section id="skeleton" style={{ maxWidth: 1180, margin: "40px auto 0", padding: "0 16px" }}>
      <h2>Page skeleton (from Oct 8 Figma review)</h2>
      <p className="sub" style={{ marginBottom: 12 }}>
        Every calendarGold page as empty boxes, in the order Cesar laid them out.
        Masoud builds the boxes; Cesar fills in labels, filter lists and copy.
        Red HOLD boxes wait on payments, email/SMS sending or the signed agreement.{" "}
        <a href="/skeleton.html" target="_blank" rel="noopener noreferrer">Open full screen</a>
      </p>
      <iframe
        src="/skeleton.html"
        title="calendarGold page skeleton"
        style={{ width: "100%", height: 920, border: "1px solid #ddd", borderRadius: 12 }}
        loading="lazy"
      />
    </section>
    </>
  );
}
