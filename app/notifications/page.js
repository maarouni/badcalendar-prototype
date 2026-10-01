"use client";

import { useEffect, useMemo, useState } from "react";
import { REGION_GROUPS, CATEGORY_GROUPS } from "../lib/taxonomy";
import {
  DEFAULT_LABELS,
  LABELS_VERSION,
  DELIVERY_CHANNELS,
  DELIVERY_DAYS,
  MAX_LISTINGS_PER_NOTIFICATION,
  MAX_BUSINESSES_PER_USER,
} from "../lib/notificationConfig";
import { fetchEvents } from "../lib/events";

const LABELS_KEY = "cg_notification_labels_v2";
const SUBS_KEY = "cg_subscriptions_v1";
const DRAFT_KEY = "cg_business_draft_v1";
const MASOUD_EMAIL = "maarouni@gmail.com";

const clone = (x) => JSON.parse(JSON.stringify(x));
const ALL_REGIONS = REGION_GROUPS.flatMap((g) => g.options);
const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap((g) => g.options);

const TABS = [
  { id: "browse", label: "Browse Notifications" },
  { id: "mine", label: "My Notifications" },
  { id: "business", label: "Create Business Notification" },
];

function load(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "null");
    return v ?? fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function mailto(to, subject, body) {
  window.location.href =
    `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

const optLabel = (labels, gid, idx) => {
  const g = labels.filters.find((f) => f.id === gid);
  return g?.options[idx]?.label || "";
};

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function Group({ title, hint, badge, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="fp-section">
      <button type="button" className="fp-section-head" onClick={() => setOpen((o) => !o)}>
        <span>
          {title}
          {badge > 0 && <span className="fp-badge">{badge}</span>}
        </span>
        <span className="fp-caret">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="fp-section-body">
          {hint && <div className="nt-hint">{hint}</div>}
          {children}
        </div>
      )}
    </div>
  );
}

function CheckOption({ checked, onChange, label, count, disabled }) {
  const empty = count === 0 && !checked;
  return (
    <label className={`fp-option ${empty ? "fp-empty" : ""} ${checked ? "fp-checked" : ""}`}>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
      <span className="fp-label">{label}</span>
      {typeof count === "number" && <span className="fp-count">{count}</span>}
    </label>
  );
}

function SubGroup({ title, options, selected, onToggle, countOf }) {
  const picked = options.filter((o) => selected.includes(o)).length;
  const total = options.reduce((n, o) => n + countOf(o), 0);
  const [open, setOpen] = useState(picked > 0);
  return (
    <div className="fp-subgroup">
      <button type="button" className="fp-subgroup-head" onClick={() => setOpen((o) => !o)}>
        <span>
          {title} <span className="fp-count">({total})</span>
          {picked > 0 && <span className="fp-badge">{picked}</span>}
        </span>
        <span className="fp-caret">{open ? "−" : "+"}</span>
      </button>
      {open &&
        options.map((o) => (
          <CheckOption key={o} checked={selected.includes(o)} onChange={() => onToggle(o)} label={o} count={countOf(o)} />
        ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Browse tab — sample notifications, working filters, Subscribe
// ---------------------------------------------------------------------------

const EMPTY_SEL = { subscribers: [], frequency: [], additions: [], ntype: [], regions: [], categories: [] };

function cardMatches(card, sel, except) {
  for (const gid of ["subscribers", "frequency", "additions", "ntype"]) {
    if (gid === except || !sel[gid].length) continue;
    if (!sel[gid].includes(card.tags?.[gid])) return false;
  }
  if (except !== "regions" && sel.regions.length && !sel.regions.includes(card.region)) return false;
  if (except !== "categories" && sel.categories.length && !sel.categories.includes(card.category)) return false;
  return true;
}

function BrowseTab({ edit, labels, update, subs, toggleSub }) {
  const [sel, setSel] = useState(EMPTY_SEL);
  const toggle = (key, v) =>
    setSel((s) => ({ ...s, [key]: s[key].includes(v) ? s[key].filter((x) => x !== v) : [...s[key], v] }));
  const anySel = Object.values(sel).some((a) => a.length);

  const shown = edit ? labels.cards : labels.cards.filter((c) => cardMatches(c, sel));
  const count = (key, v) =>
    labels.cards.filter((c) => cardMatches(c, sel, key) && (key === "regions" ? c.region === v : key === "categories" ? c.category === v : c.tags?.[key] === v)).length;

  const setCard = (i, k) => (e) => update((L) => { L.cards[i][k] = e.target.value; });
  const setTag = (i, gid) => (e) =>
    update((L) => { L.cards[i].tags = { ...L.cards[i].tags, [gid]: e.target.value === "" ? null : Number(e.target.value) }; });

  return (
    <div className="layout-with-sidebar">
      <aside className="sidebar filter-panel">
        <div className="fp-top">
          <h4>Notification filters</h4>
          {anySel && !edit && (
            <button type="button" className="fp-clear" onClick={() => setSel(EMPTY_SEL)}>✕ Clear all</button>
          )}
        </div>

        {labels.filters.map((g, gi) => (
          <Group key={g.id} title={g.title} hint={edit ? "Rename, add or remove options." : g.hint} badge={edit ? 0 : sel[g.id].length}>
            {edit ? (
              <>
                {g.options.map((o, i) => (
                  <div key={i} className="nt-edit-row">
                    <input className="nt-input sm" value={o.label} placeholder={`Option ${i + 1}`}
                      onChange={(e) => update((L) => { L.filters[gi].options[i].label = e.target.value; })} />
                    <button type="button" className="remove-link" title="Remove option"
                      onClick={() => update((L) => { L.filters[gi].options.splice(i, 1); })}>✕</button>
                  </div>
                ))}
                <button type="button" className="nt-add"
                  onClick={() => update((L) => { L.filters[gi].options.push({ label: "", link: "" }); })}>+ Add option</button>
              </>
            ) : (
              g.options.map((o, i) =>
                o.label ? (
                  <CheckOption key={i} checked={sel[g.id].includes(i)} onChange={() => toggle(g.id, i)} label={o.label} count={count(g.id, i)} />
                ) : null
              )
            )}
          </Group>
        ))}

        <Group title="Regions" badge={sel.regions.length} defaultOpen={false}>
          {REGION_GROUPS.map((g) => (
            <SubGroup key={g.group} title={g.group} options={g.options} selected={sel.regions}
              onToggle={(o) => toggle("regions", o)} countOf={(o) => count("regions", o)} />
          ))}
        </Group>
        <Group title="Categories" badge={sel.categories.length} defaultOpen={false}>
          {CATEGORY_GROUPS.map((g) => (
            <SubGroup key={g.group} title={g.group} options={g.options} selected={sel.categories}
              onToggle={(o) => toggle("categories", o)} countOf={(o) => count("categories", o)} />
          ))}
        </Group>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="results-bar">
          {edit ? "Editing notification cards" : `${shown.length} of ${labels.cards.length} notifications match your filters`}
        </div>
        {!edit && shown.length === 0 && (
          <div className="empty-state">
            No notifications match. <button type="button" className="clear-filters-link" onClick={() => setSel(EMPTY_SEL)}>Clear filters</button>
          </div>
        )}
        <div className="nt-card-grid">
          {shown.map((c) => {
            const i = labels.cards.indexOf(c);
            if (edit) {
              return (
                <div key={c.id} className="nt-card">
                  <input className="nt-input" value={c.name} placeholder="Notification name" onChange={setCard(i, "name")} />
                  <input className="nt-input sm" value={c.publisher} placeholder="Publisher" onChange={setCard(i, "publisher")} />
                  <input className="nt-input sm" value={c.subscriberCount} placeholder="Subscriber count" onChange={setCard(i, "subscriberCount")} />
                  <select className="nt-input sm" value={c.region} onChange={setCard(i, "region")}>
                    <option value="">Region…</option>
                    {ALL_REGIONS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                  <select className="nt-input sm" value={c.category} onChange={setCard(i, "category")}>
                    <option value="">Category…</option>
                    {ALL_CATEGORIES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                  {labels.filters.map((g) => (
                    <select key={g.id} className="nt-input sm" value={c.tags?.[g.id] ?? ""} onChange={setTag(i, g.id)}>
                      <option value="">{g.title}…</option>
                      {g.options.map((o, k) => o.label && <option key={k} value={k}>{o.label}</option>)}
                    </select>
                  ))}
                  <button type="button" className="remove-link" style={{ alignSelf: "flex-end" }}
                    onClick={() => update((L) => { L.cards.splice(i, 1); })}>Remove card</button>
                </div>
              );
            }
            const subbed = subs.includes(c.id);
            return (
              <div key={c.id} className={`nt-card ${subbed ? "nt-subbed" : ""}`}>
                <div className="nt-card-title">{c.name || <span className="nt-slot">Notification name</span>}</div>
                <div className="nt-card-pub">by {c.publisher || "—"}</div>
                <div className="nt-card-row">
                  {c.subscriberCount && <span className="nt-chip">👥 {c.subscriberCount}</span>}
                  {optLabel(labels, "frequency", c.tags?.frequency) && <span className="nt-chip">🗓 {optLabel(labels, "frequency", c.tags.frequency)}</span>}
                  {optLabel(labels, "ntype", c.tags?.ntype) && <span className="nt-chip">{optLabel(labels, "ntype", c.tags.ntype)}</span>}
                </div>
                <div className="nt-card-meta">{[c.region, c.category].filter(Boolean).join(" · ")}</div>
                <button type="button" className={`btn nt-sub-btn ${subbed ? "secondary" : ""}`} onClick={() => toggleSub(c.id)}>
                  {subbed ? "Subscribed ✓" : "Subscribe"}
                </button>
              </div>
            );
          })}
          {edit && (
            <button type="button" className="nt-card nt-add-card"
              onClick={() => update((L) => {
                L.cards.push({ id: `c${Date.now()}`, name: "", publisher: "", subscriberCount: "", region: "", category: "", tags: {} });
              })}>
              + Add card
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// My Notifications tab
// ---------------------------------------------------------------------------

function MineTab({ edit, labels, update, subs, toggleSub, goBrowse }) {
  const [channel, setChannel] = useState("Email");
  const [freq, setFreq] = useState(0);
  const [days, setDays] = useState(["Wed"]);
  const toggleDay = (d) => setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));
  const mine = labels.cards.filter((c) => subs.includes(c.id));

  return (
    <div className="nt-two-col">
      <div>
        <h4 className="section-label">My subscriptions ({mine.length})</h4>
        {mine.length === 0 ? (
          <div className="empty-state" style={{ padding: 24 }}>
            You haven't subscribed to anything yet.{" "}
            <button type="button" className="clear-filters-link" onClick={goBrowse}>Browse notifications</button>
          </div>
        ) : (
          <table className="nt-table">
            <thead>
              <tr><th>Notification</th><th>Publisher</th><th>Frequency</th><th>Filter set</th><th></th></tr>
            </thead>
            <tbody>
              {mine.map((c) => (
                <tr key={c.id}>
                  <td><b>{c.name}</b></td>
                  <td>{c.publisher}</td>
                  <td>{optLabel(labels, "frequency", c.tags?.frequency) || "—"}</td>
                  <td>
                    <select defaultValue="">
                      <option value="">None</option>
                      <option>Set A</option><option>Set B</option><option>Set C</option>
                    </select>
                  </td>
                  <td>
                    <button type="button" className="remove-link" title="Unsubscribe" onClick={() => toggleSub(c.id)}>Unsubscribe</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="nt-hint" style={{ marginTop: 8 }}>
          Attaching a Filter Set (A/B/C) will auto-fill a notification with matching listings.
        </div>
      </div>

      <div className="nt-panel">
        <h4 className="section-label">Delivery preferences</h4>

        <div className="nt-field-label">Send to me by</div>
        {DELIVERY_CHANNELS.map((c) => (
          <label key={c} className="fp-option">
            <input type="radio" name="nt-channel" checked={channel === c} onChange={() => setChannel(c)} />
            <span className="fp-label">{c}</span>
          </label>
        ))}

        <div className="nt-field-label">How often</div>
        {labels.deliveryFrequency.map((o, i) =>
          edit ? (
            <div key={i} className="nt-edit-row">
              <input className="nt-input sm" value={o.label} placeholder={`Choice ${i + 1}`}
                onChange={(e) => update((L) => { L.deliveryFrequency[i].label = e.target.value; })} />
              <button type="button" className="remove-link"
                onClick={() => update((L) => { L.deliveryFrequency.splice(i, 1); })}>✕</button>
            </div>
          ) : o.label ? (
            <label key={i} className="fp-option">
              <input type="radio" name="nt-freq" checked={freq === i} onChange={() => setFreq(i)} />
              <span className="fp-label">{o.label}</span>
            </label>
          ) : null
        )}
        {edit && (
          <button type="button" className="nt-add"
            onClick={() => update((L) => { L.deliveryFrequency.push({ label: "", link: "" }); })}>+ Add choice</button>
        )}

        <div className="nt-field-label">Deliver on these days (batched)</div>
        <div className="nt-days">
          {DELIVERY_DAYS.map((d) => (
            <label key={d} className="nt-day">
              <input type="checkbox" checked={days.includes(d)} onChange={() => toggleDay(d)} />
              {d}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create Business Notification tab — builder, newsletter download, test email
// ---------------------------------------------------------------------------

const EMPTY_DRAFT = { business: "", tier: "Free", info: "", B: [{ event: "", link: "" }], C: [{ event: "", link: "" }] };

function esc(s) {
  return String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function newsletterText(d, b) {
  const lines = [];
  lines.push(`${d.business || "Your business"}${d.tier === "Premier" ? " (Premier)" : ""}`, "");
  if (d.info) lines.push(b.sectionA.toUpperCase(), d.info, "");
  for (const [key, title] of [["B", b.sectionB], ["C", b.sectionC]]) {
    const items = d[key].filter((x) => x.event);
    if (!items.length) continue;
    lines.push(title.toUpperCase());
    items.forEach((x) => lines.push(`- ${x.event}${x.link ? `\n  ${x.link}` : ""}`));
    lines.push("");
  }
  lines.push("--", b.footer, "Sent via calendarGold");
  return lines.join("\n");
}

function newsletterHtml(d, b) {
  const gold = "#d97a00";
  const list = (items) =>
    items
      .filter((x) => x.event)
      .map(
        (x) => `<tr><td style="padding:8px 0;border-top:1px solid #eee;font-size:15px;color:#1a1a1a">${esc(x.event)}</td>
<td style="padding:8px 0;border-top:1px solid #eee;text-align:right">${x.link ? `<a href="${esc(x.link)}" style="color:${gold};font-weight:700;text-decoration:none">RSVP →</a>` : ""}</td></tr>`
      )
      .join("");
  const section = (title, body) =>
    body ? `<h3 style="margin:22px 0 6px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#999">${esc(title)}</h3>${body}` : "";
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(d.business || "Notification")}</title></head>
<body style="margin:0;background:#faf8f4;font-family:Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f4;padding:24px 0"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid ${d.tier === "Premier" ? "#ff9500" : "#ececec"};padding:28px">
<tr><td>
<div style="font-size:13px;font-weight:800;color:${gold}">calendarGold</div>
<h1 style="margin:10px 0 0;font-size:24px;color:#1a1a1a">${esc(d.business || "Your business")}${d.tier === "Premier" ? ` <span style="font-size:11px;background:#fff1de;color:${gold};padding:3px 8px;border-radius:9px;vertical-align:middle">PREMIER</span>` : ""}</h1>
${section(b.sectionA, d.info ? `<p style="margin:0;font-size:15px;line-height:1.5;color:#333;white-space:pre-wrap">${esc(d.info)}</p>` : "")}
${section(b.sectionB, list(d.B) ? `<table width="100%" cellpadding="0" cellspacing="0">${list(d.B)}</table>` : "")}
${section(b.sectionC, list(d.C) ? `<table width="100%" cellpadding="0" cellspacing="0">${list(d.C)}</table>` : "")}
<p style="margin:28px 0 0;font-size:11px;color:#aaa;text-align:center">${esc(b.footer)}</p>
</td></tr></table></td></tr></table></body></html>`;
}

function BusinessTab({ edit, labels, update, flash }) {
  const b = labels.business;
  const [d, setD] = useState(EMPTY_DRAFT);
  const [events, setEvents] = useState([]);
  const [sendTo, setSendTo] = useState(MASOUD_EMAIL);

  useEffect(() => {
    setD(load(DRAFT_KEY, EMPTY_DRAFT));
    fetchEvents().then(setEvents).catch(() => {});
  }, []);
  const change = (fn) =>
    setD((prev) => {
      const next = clone(prev);
      fn(next);
      save(DRAFT_KEY, next);
      return next;
    });

  const total = d.B.length + d.C.length;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const addFromCalendar = (sec, id) => {
    const e = events.find((x) => x.id === id);
    if (!e || total >= MAX_LISTINGS_PER_NOTIFICATION) return;
    change((n) => {
      const item = { event: `${e.title} — ${e.date}${e.city ? `, ${e.city}` : ""}`, link: `${origin}/event/${e.id}` };
      const blankIdx = n[sec].findIndex((x) => !x.event && !x.link);
      if (blankIdx >= 0) n[sec][blankIdx] = item; else n[sec].push(item);
    });
  };

  const setB = (k) => (e) => update((L) => { L.business[k] = e.target.value; });
  const title = (key, hintKey, letter) =>
    edit ? (
      <div className="nt-edit-row" style={{ marginBottom: 8 }}>
        <b>{letter} —</b>
        <input className="nt-input" value={b[key]} onChange={setB(key)} placeholder="Section title" />
        <input className="nt-input sm nt-link" value={b[hintKey]} onChange={setB(hintKey)} placeholder="Hint" />
      </div>
    ) : (
      <div className="nt-section-head"><b>Section {letter} — {b[key]}</b><span className="nt-hint">{b[hintKey]}</span></div>
    );

  const Listings = (sec, letter) => (
    <div className="nt-section">
      {title(`section${sec}`, `section${sec}Hint`, letter)}
      {d[sec].map((x, i) => (
        <div key={i} className="nt-edit-row">
          <input className="nt-input sm" placeholder="Event name" value={x.event}
            onChange={(e) => change((n) => { n[sec][i].event = e.target.value; })} />
          <input className="nt-input sm nt-link" placeholder="RSVP link" value={x.link}
            onChange={(e) => change((n) => { n[sec][i].link = e.target.value; })} />
          <button type="button" className="remove-link" onClick={() => change((n) => { n[sec].splice(i, 1); })}>✕</button>
        </div>
      ))}
      <div className="nt-edit-row" style={{ marginTop: 8 }}>
        <button type="button" className="nt-add" style={{ marginTop: 0 }} disabled={total >= MAX_LISTINGS_PER_NOTIFICATION}
          onClick={() => change((n) => { n[sec].push({ event: "", link: "" }); })}>+ Add listing</button>
        <select className="nt-input sm" value="" disabled={total >= MAX_LISTINGS_PER_NOTIFICATION}
          onChange={(e) => addFromCalendar(sec, e.target.value)}>
          <option value="">+ Add from One Big Calendar…</option>
          {events.map((e) => <option key={e.id} value={e.id}>{e.date} · {e.title}</option>)}
        </select>
      </div>
    </div>
  );

  const hasContent = d.business || d.info || d.B.some((x) => x.event) || d.C.some((x) => x.event);
  const fileBase = (d.business || "notification").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();

  function downloadNewsletter() {
    downloadFile(`${fileBase}-newsletter.html`, newsletterHtml(d, b), "text/html");
    flash("Newsletter downloaded. Open the file to see it as subscribers would.");
  }
  function sendTest() {
    if (!/^\S+@\S+\.\S+$/.test(sendTo)) return flash("Enter a valid email address first.");
    mailto(sendTo, `[Test] ${d.business || "Business"} notification`, newsletterText(d, b));
    flash("Your email app should open with the test notification. Press Send.");
  }
  async function copyText() {
    try { await navigator.clipboard.writeText(newsletterText(d, b)); flash("Newsletter text copied."); }
    catch { flash("Copy failed. Use Download instead."); }
  }

  return (
    <div className="nt-two-col">
      <div>
        <div className="nt-builder-top">
          <label className="nt-field" style={{ flex: 1, minWidth: 220 }}>
            <span className="nt-field-label">Business name</span>
            <input className="nt-input" placeholder={`Your business (up to ${MAX_BUSINESSES_PER_USER})`} value={d.business}
              onChange={(e) => change((n) => { n.business = e.target.value; })} />
          </label>
          <div className="nt-field">
            <span className="nt-field-label">Listing type</span>
            <div style={{ display: "flex", gap: 14 }}>
              {["Free", "Premier"].map((t) => (
                <label key={t} className="fp-option">
                  <input type="radio" name="nt-tier" checked={d.tier === t} onChange={() => change((n) => { n.tier = t; })} />
                  <span className="fp-label">{t}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="nt-section">
          {title("sectionA", "sectionAHint", "A")}
          <textarea className="nt-textarea" placeholder="Description text…" value={d.info}
            onChange={(e) => change((n) => { n.info = e.target.value; })} />
        </div>
        {Listings("B", "B")}
        {Listings("C", "C")}

        {edit && (
          <div className="nt-section">
            <div className="nt-section-head"><b>Footer text</b></div>
            <input className="nt-input" value={b.footer} onChange={setB("footer")} />
          </div>
        )}

        <div className="nt-footer-row">
          <span className="nt-counter">{total} / {MAX_LISTINGS_PER_NOTIFICATION} listings (premier + regular)</span>
          <button type="button" className="btn secondary" onClick={() => { change((n) => Object.assign(n, clone(EMPTY_DRAFT))); }}>
            Clear draft
          </button>
        </div>
      </div>

      <div className="nt-preview-col">
        <div className="nt-panel">
          <h4 className="section-label">Preview</h4>
          <div className={`nt-preview-box ${d.tier === "Premier" ? "premier" : ""}`}>
            <div className="nt-preview-head">
              {d.business || <span className="nt-slot">Business name</span>}
              {d.tier === "Premier" && <span className="badge" style={{ marginLeft: 8 }}>PREMIER</span>}
            </div>
            <div className="nt-preview-sec">
              <div className="nt-preview-label">A · {b.sectionA}</div>
              {d.info && <div className="nt-preview-text">{d.info}</div>}
            </div>
            {[["B", b.sectionB], ["C", b.sectionC]].map(([sec, t]) => (
              <div key={sec} className="nt-preview-sec">
                <div className="nt-preview-label">{sec} · {t}</div>
                {d[sec].filter((x) => x.event).map((x, i) => (
                  <div key={i} className="nt-preview-item">
                    <span>{x.event}</span>
                    {x.link && <a href={x.link} target="_blank" rel="noreferrer">RSVP</a>}
                  </div>
                ))}
              </div>
            ))}
            <div className="nt-preview-foot">{b.footer}</div>
          </div>
        </div>

        <div className="nt-panel" style={{ marginTop: 14 }}>
          <h4 className="section-label">Send a test</h4>
          <label className="nt-field">
            <span className="nt-field-label">Send test to</span>
            <input className="nt-input" type="email" value={sendTo} onChange={(e) => setSendTo(e.target.value)} placeholder="you@example.com" />
          </label>
          <div className="nt-send-row">
            <button type="button" className="btn" disabled={!hasContent} onClick={sendTest}>📧 Send test email</button>
            <button type="button" className="btn secondary" disabled={!hasContent} onClick={downloadNewsletter}>Download newsletter</button>
            <button type="button" className="btn secondary" disabled={!hasContent} onClick={copyText}>Copy text</button>
          </div>
          <div className="nt-hint" style={{ marginTop: 8 }}>
            The test email opens in your own email app as plain text. <b>Download newsletter</b> saves the
            formatted version. Real subscribers are only emailed once the platform goes live. Every message
            carries an unsubscribe link (CAN-SPAM / TCPA).
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Notifications() {
  const [tab, setTab] = useState("browse");
  const [edit, setEdit] = useState(false);
  const [labels, setLabels] = useState(() => clone(DEFAULT_LABELS));
  const [subs, setSubs] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const saved = load(LABELS_KEY, null);
    if (saved && saved.version === LABELS_VERSION && saved.filters && saved.cards && saved.business) setLabels(saved);
    setSubs(load(SUBS_KEY, []));
  }, []);

  const flash = (m) => {
    setMsg(m);
    clearTimeout(flash.t);
    flash.t = setTimeout(() => setMsg(""), 6000);
  };

  const update = (fn) =>
    setLabels((prev) => {
      const next = clone(prev);
      fn(next);
      save(LABELS_KEY, next);
      return next;
    });

  const toggleSub = (id) =>
    setSubs((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      save(SUBS_KEY, next);
      return next;
    });

  const labelsText = useMemo(() => {
    const L = labels;
    const lines = ["calendarGold - Notification labels", ""];
    L.filters.forEach((g) => {
      lines.push(`${g.title}:`);
      g.options.filter((o) => o.label).forEach((o) => lines.push(`  - ${o.label}`));
    });
    lines.push("", "Notification cards:");
    L.cards.forEach((c) =>
      lines.push(`  - ${[c.name, c.publisher, c.subscriberCount, c.region, c.category].filter(Boolean).join(" | ")}`)
    );
    lines.push("", "How often:", ...L.deliveryFrequency.filter((o) => o.label).map((o) => `  - ${o.label}`));
    lines.push("", "Business notification sections:",
      `  A - ${L.business.sectionA}`, `  B - ${L.business.sectionB}`, `  C - ${L.business.sectionC}`,
      `  Footer - ${L.business.footer}`);
    lines.push("", "--- data for Masoud (do not edit) ---", JSON.stringify(L));
    return lines.join("\n");
  }, [labels]);

  const emailLabels = () => {
    mailto(MASOUD_EMAIL, "calendarGold - my notification labels", labelsText);
    flash("Your email app should open. If it didn't, use Copy labels and paste into an email.");
  };
  const copyLabels = async () => {
    try { await navigator.clipboard.writeText(labelsText); flash(`Copied. Paste it into an email to ${MASOUD_EMAIL}.`); }
    catch { flash("Copy failed. Use Download labels instead."); }
  };
  const downloadLabels = () => {
    downloadFile("calendarGold-notification-labels.json", JSON.stringify(labels, null, 2), "application/json");
    flash(`Downloaded. Attach it to an email to ${MASOUD_EMAIL}.`);
  };
  const resetLabels = () => {
    setLabels(clone(DEFAULT_LABELS));
    try { localStorage.removeItem(LABELS_KEY); } catch {}
    flash("Labels reset to the sample content.");
  };

  return (
    <div className="page nt-page">
      <div className="hint">
        {edit ? (
          <>
            <b>Edit mode:</b> rename filters, cards, delivery choices and business section titles. Changes save
            in this browser as you type. When done, click <b>📧 Email labels to Masoud</b>.
          </>
        ) : (
          <>
            Prototype with <b>sample</b> notifications. Filter and subscribe on <b>Browse</b>, see them under{" "}
            <b>My Notifications</b>, and build and test-send one under <b>Create Business Notification</b>.
            Click <b>✏️ Edit labels</b> to change any wording.
          </>
        )}
      </div>

      <div className="nt-title-row">
        <h2 style={{ margin: "6px 0 14px" }}>Notifications</h2>
        <div className="nt-edit-bar">
          {edit && (
            <>
              <button type="button" className="btn secondary" onClick={resetLabels}>Reset</button>
              <button type="button" className="btn secondary" onClick={downloadLabels}>Download labels</button>
              <button type="button" className="btn secondary" onClick={copyLabels}>Copy labels</button>
              <button type="button" className="btn" onClick={emailLabels}>📧 Email labels to Masoud</button>
            </>
          )}
          <button type="button" className={`btn ${edit ? "nt-done" : ""}`} onClick={() => setEdit((e) => !e)}>
            {edit ? "✓ Done editing" : "✏️ Edit labels"}
          </button>
        </div>
      </div>
      {msg && <div className="nt-flash">{msg}</div>}

      <div className="status-legend">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`status-pill ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
            {t.id === "mine" && subs.length > 0 && <span>{subs.length}</span>}
          </button>
        ))}
      </div>

      {tab === "browse" && <BrowseTab edit={edit} labels={labels} update={update} subs={subs} toggleSub={toggleSub} />}
      {tab === "mine" && (
        <MineTab edit={edit} labels={labels} update={update} subs={subs} toggleSub={toggleSub} goBrowse={() => setTab("browse")} />
      )}
      {tab === "business" && <BusinessTab edit={edit} labels={labels} update={update} flash={flash} />}
    </div>
  );
}
