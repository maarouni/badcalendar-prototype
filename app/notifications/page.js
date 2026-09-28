"use client";

import { useEffect, useState } from "react";
import { REGION_GROUPS, CATEGORY_GROUPS } from "../lib/taxonomy";
import {
  DEFAULT_LABELS,
  DELIVERY_CHANNELS,
  DELIVERY_DAYS,
  MAX_LISTINGS_PER_NOTIFICATION,
  MAX_BUSINESSES_PER_USER,
} from "../lib/notificationConfig";

const LABELS_KEY = "cg_notification_labels_v1";
const MASOUD_EMAIL = "maarouni@gmail.com";
const clone = (x) => JSON.parse(JSON.stringify(x));

const TABS = [
  { id: "browse", label: "Browse Notifications" },
  { id: "mine", label: "My Notifications" },
  { id: "business", label: "Create Business Notification" },
];

// A text value that is a typing box in Edit mode, and plain text (or a dashed
// "to be filled" box if still empty) otherwise.
function Field({ edit, value, onChange, placeholder, small, link }) {
  if (edit) {
    return (
      <input
        className={`nt-input ${small ? "sm" : ""}`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (!value) return <span className={`nt-slot ${small ? "sm" : ""}`}>{placeholder}</span>;
  return link ? <a href={link} className="title-link" target="_blank" rel="noreferrer">{value}</a> : <span>{value}</span>;
}

function Group({ title, hint, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="fp-section">
      <button type="button" className="fp-section-head" onClick={() => setOpen((o) => !o)}>
        <span>{title}</span>
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

function BrowseTab({ edit, labels, update }) {
  const [picked, setPicked] = useState({});
  const togglePick = (gid, i, type) =>
    setPicked((p) => {
      const cur = p[gid] || [];
      if (type === "radio") return { ...p, [gid]: [i] };
      return { ...p, [gid]: cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i] };
    });

  return (
    <div className="layout-with-sidebar">
      <aside className="sidebar filter-panel">
        <div className="fp-top"><h4>Notification filters</h4></div>
        {labels.filters.map((g, gi) => (
          <Group key={g.id} title={g.title} hint={edit ? "Type the option text. Link is optional." : g.hint}>
            {g.options.map((o, i) =>
              edit ? (
                <div key={i} className="nt-edit-row">
                  <input
                    className="nt-input sm"
                    value={o.label}
                    placeholder={`Option ${i + 1}`}
                    onChange={(e) => update((L) => { L.filters[gi].options[i].label = e.target.value; })}
                  />
                  <input
                    className="nt-input sm nt-link"
                    value={o.link}
                    placeholder="link (optional)"
                    onChange={(e) => update((L) => { L.filters[gi].options[i].link = e.target.value; })}
                  />
                  <button
                    type="button"
                    className="remove-link"
                    title="Remove option"
                    onClick={() => update((L) => { L.filters[gi].options.splice(i, 1); })}
                  >✕</button>
                </div>
              ) : (
                <label key={i} className="fp-option">
                  <input
                    type={g.type}
                    name={`nt-${g.id}`}
                    disabled={!o.label}
                    checked={(picked[g.id] || []).includes(i)}
                    onChange={() => togglePick(g.id, i, g.type)}
                  />
                  <span className="fp-label">
                    <Field edit={false} value={o.label} link={o.link} placeholder="Label — to be filled" small />
                  </span>
                </label>
              )
            )}
            {edit && (
              <button
                type="button"
                className="nt-add"
                onClick={() => update((L) => { L.filters[gi].options.push({ label: "", link: "" }); })}
              >+ Add option</button>
            )}
          </Group>
        ))}
        <Group title="Regions" hint="Same list as One Big Calendar">
          {REGION_GROUPS.map((g) => (
            <div key={g.group} className="nt-subhead">{g.group} <span>({g.options.length})</span></div>
          ))}
        </Group>
        <Group title="Categories" hint="Same list as One Big Calendar">
          {CATEGORY_GROUPS.map((g) => (
            <div key={g.group} className="nt-subhead">{g.group} <span>({g.options.length})</span></div>
          ))}
        </Group>
      </aside>

      <div style={{ flex: 1 }}>
        <div className="results-bar">Notifications you can subscribe to</div>
        <div className="nt-card-grid">
          {labels.cards.map((c, i) => {
            const set = (k) => (v) => update((L) => { L.cards[i][k] = v; });
            return (
              <div key={i} className="nt-card">
                <div className="nt-card-title">
                  <Field edit={edit} value={c.name} onChange={set("name")} placeholder="Notification name" />
                </div>
                <div className="nt-card-row">
                  <Field edit={edit} value={c.publisher} onChange={set("publisher")} placeholder="Publisher" small />
                </div>
                <div className="nt-card-row">
                  <Field edit={edit} value={c.subscribers} onChange={set("subscribers")} placeholder="Subscribers" small />
                  <Field edit={edit} value={c.frequency} onChange={set("frequency")} placeholder="Frequency" small />
                </div>
                <div className="nt-card-row">
                  <Field edit={edit} value={c.area} onChange={set("area")} placeholder="Region · Category" small />
                </div>
                {edit ? (
                  <button type="button" className="remove-link" style={{ alignSelf: "flex-end" }}
                    onClick={() => update((L) => { L.cards.splice(i, 1); })}>Remove card</button>
                ) : (
                  <button type="button" className="btn nt-sub-btn">Subscribe</button>
                )}
              </div>
            );
          })}
          {edit && (
            <button type="button" className="nt-card nt-add-card"
              onClick={() => update((L) => { L.cards.push({ name: "", publisher: "", subscribers: "", frequency: "", area: "" }); })}>
              + Add card
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MineTab({ edit, labels, update }) {
  const [channel, setChannel] = useState("Email");
  const [freq, setFreq] = useState(null);
  const [days, setDays] = useState(["Wed"]);
  const toggleDay = (d) => setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));
  const subs = labels.cards.filter((c) => c.name).slice(0, 3);

  return (
    <div className="nt-two-col">
      <div>
        <h4 className="section-label">My subscriptions</h4>
        <table className="nt-table">
          <thead>
            <tr><th>Notification</th><th>Publisher</th><th>Frequency</th><th>Filter set</th></tr>
          </thead>
          <tbody>
            {(subs.length ? subs : [{}, {}, {}]).map((c, i) => (
              <tr key={i}>
                <td>{c.name || <span className="nt-slot sm">Notification name</span>}</td>
                <td>{c.publisher || <span className="nt-slot sm">Publisher</span>}</td>
                <td>{c.frequency || <span className="nt-slot sm">Frequency</span>}</td>
                <td>
                  <select defaultValue="">
                    <option value="">None</option>
                    <option>Set A</option><option>Set B</option><option>Set C</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="nt-hint" style={{ marginTop: 8 }}>
          Rows fill in from the cards on the Browse tab. Attaching a Filter Set (A/B/C) auto-fills a notification with matching listings.
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
              <input className="nt-input sm" value={o.label} placeholder={`Choice ${i + 1} (e.g. Weekly digest)`}
                onChange={(e) => update((L) => { L.deliveryFrequency[i].label = e.target.value; })} />
              <button type="button" className="remove-link"
                onClick={() => update((L) => { L.deliveryFrequency.splice(i, 1); })}>✕</button>
            </div>
          ) : (
            <label key={i} className="fp-option">
              <input type="radio" name="nt-freq" disabled={!o.label} checked={freq === i} onChange={() => setFreq(i)} />
              <span className="fp-label"><Field edit={false} value={o.label} placeholder="Label — to be filled" small /></span>
            </label>
          )
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

function BusinessTab() {
  const [tier, setTier] = useState("Free");
  const [business, setBusiness] = useState("");
  const [info, setInfo] = useState("");
  const [lists, setLists] = useState({ B: [{ event: "", link: "" }], C: [{ event: "", link: "" }] });
  const total = lists.B.length + lists.C.length;

  const setItem = (sec, i, k, v) =>
    setLists((L) => ({ ...L, [sec]: L[sec].map((x, j) => (j === i ? { ...x, [k]: v } : x)) }));
  const addItem = (sec) =>
    total < MAX_LISTINGS_PER_NOTIFICATION &&
    setLists((L) => ({ ...L, [sec]: [...L[sec], { event: "", link: "" }] }));
  const removeItem = (sec, i) => setLists((L) => ({ ...L, [sec]: L[sec].filter((_, j) => j !== i) }));

  const Listings = ({ sec, title, hint }) => (
    <div className="nt-section">
      <div className="nt-section-head"><b>{title}</b><span className="nt-hint">{hint}</span></div>
      {lists[sec].map((x, i) => (
        <div key={i} className="nt-edit-row">
          <input className="nt-input sm" placeholder="Event name" value={x.event} onChange={(e) => setItem(sec, i, "event", e.target.value)} />
          <input className="nt-input sm nt-link" placeholder="RSVP link" value={x.link} onChange={(e) => setItem(sec, i, "link", e.target.value)} />
          <button type="button" className="remove-link" onClick={() => removeItem(sec, i)}>✕</button>
        </div>
      ))}
      <button type="button" className="nt-add" onClick={() => addItem(sec)} disabled={total >= MAX_LISTINGS_PER_NOTIFICATION}>
        + Add listing
      </button>
    </div>
  );

  const previewList = (sec) => lists[sec].filter((x) => x.event);

  return (
    <div className="nt-two-col">
      <div>
        <div className="nt-builder-top">
          <label className="nt-field">
            <span className="nt-field-label">Business name</span>
            <input className="nt-input" placeholder={`Your business (up to ${MAX_BUSINESSES_PER_USER})`} value={business} onChange={(e) => setBusiness(e.target.value)} />
          </label>
          <div className="nt-field">
            <span className="nt-field-label">Listing type</span>
            <div style={{ display: "flex", gap: 14 }}>
              {["Free", "Premier"].map((t) => (
                <label key={t} className="fp-option">
                  <input type="radio" name="nt-tier" checked={tier === t} onChange={() => setTier(t)} />
                  <span className="fp-label">{t}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="nt-section">
          <div className="nt-section-head"><b>Section A — Information</b><span className="nt-hint">Free-text description box</span></div>
          <textarea className="nt-textarea" placeholder="Description text…" value={info} onChange={(e) => setInfo(e.target.value)} />
        </div>
        {Listings({ sec: "B", title: "Section B — RSVP Today", hint: "Featured events with RSVP links" })}
        {Listings({ sec: "C", title: "Section C — Other Events", hint: "Additional events feed" })}

        <div className="nt-footer-row">
          <span className="nt-counter">{total} / {MAX_LISTINGS_PER_NOTIFICATION} listings (premier + regular)</span>
          <button type="button" className="btn" disabled title="Checkout comes with the shopping cart phase">Add to shopping cart</button>
        </div>
      </div>

      <div className="nt-panel nt-preview">
        <h4 className="section-label">Preview</h4>
        <div className={`nt-preview-box ${tier === "Premier" ? "premier" : ""}`}>
          <div className="nt-preview-head">
            {business || <span className="nt-slot">Business name</span>}
            {tier === "Premier" && <span className="badge" style={{ marginLeft: 8 }}>PREMIER</span>}
          </div>
          <div className="nt-preview-sec">
            <div className="nt-preview-label">A · Information</div>
            {info ? <div className="nt-preview-text">{info}</div> : null}
          </div>
          {["B", "C"].map((sec) => (
            <div key={sec} className="nt-preview-sec">
              <div className="nt-preview-label">{sec === "B" ? "B · RSVP Today" : "C · Other Events"}</div>
              {previewList(sec).map((x, i) => (
                <div key={i} className="nt-preview-item">
                  <span>{x.event}</span>
                  {x.link && <a href={x.link} target="_blank" rel="noreferrer">RSVP</a>}
                </div>
              ))}
            </div>
          ))}
          <div className="nt-preview-foot">Unsubscribe · Manage preferences</div>
        </div>
        <div className="nt-hint" style={{ marginTop: 10 }}>
          Sent only to people who opted in to this notification. Every message
          carries an unsubscribe link (CAN-SPAM / TCPA). Views and clicks are
          tracked per listing.
        </div>
      </div>
    </div>
  );
}

export default function Notifications() {
  const [tab, setTab] = useState("browse");
  const [edit, setEdit] = useState(false);
  const [labels, setLabels] = useState(() => clone(DEFAULT_LABELS));
  const [flash, setFlash] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LABELS_KEY) || "null");
      if (saved && saved.filters) setLabels(saved);
    } catch {}
  }, []);

  const update = (fn) =>
    setLabels((prev) => {
      const next = clone(prev);
      fn(next);
      try { localStorage.setItem(LABELS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });

  function download() {
    const blob = new Blob([JSON.stringify(labels, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "calendarGold-notification-labels.json";
    a.click();
    URL.revokeObjectURL(a.href);
    setFlash(`Downloaded. Attach it to an email to ${MASOUD_EMAIL}.`);
    setTimeout(() => setFlash(""), 3000);
  }

  const hasEntries =
    labels.filters.some((g) => g.options.some((o) => o.label)) ||
    labels.cards.some((c) => Object.values(c).some(Boolean)) ||
    labels.deliveryFrequency.some((o) => o.label);

  function entriesText() {
    const lines = ["calendarGold - Notification labels", ""];
    labels.filters.forEach((g) => {
      const opts = g.options.filter((o) => o.label);
      if (!opts.length) return;
      lines.push(`${g.title}:`);
      opts.forEach((o) => lines.push(`  - ${o.label}${o.link ? ` (${o.link})` : ""}`));
    });
    const cards = labels.cards.filter((c) => Object.values(c).some(Boolean));
    if (cards.length) {
      lines.push("", "Notification cards:");
      cards.forEach((c) =>
        lines.push(`  - ${[c.name, c.publisher, c.subscribers, c.frequency, c.area].filter(Boolean).join(" | ")}`)
      );
    }
    const freq = labels.deliveryFrequency.filter((o) => o.label);
    if (freq.length) {
      lines.push("", "How often (delivery choices):");
      freq.forEach((o) => lines.push(`  - ${o.label}`));
    }
    lines.push("", "--- data for Masoud (do not edit) ---", JSON.stringify(labels));
    return lines.join("\n");
  }

  function emailMasoud() {
    const subject = "calendarGold - my notification labels";
    window.location.href =
      `mailto:${MASOUD_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(entriesText())}`;
    setFlash("Your email app should open. If it didn't, use Copy entries and paste into an email.");
    setTimeout(() => setFlash(""), 6000);
  }

  async function copyEntries() {
    try {
      await navigator.clipboard.writeText(entriesText());
      setFlash(`Copied. Paste it into an email to ${MASOUD_EMAIL}.`);
    } catch {
      setFlash("Copy failed. Use Download my entries instead.");
    }
    setTimeout(() => setFlash(""), 5000);
  }

  function reset() {
    setLabels(clone(DEFAULT_LABELS));
    try { localStorage.removeItem(LABELS_KEY); } catch {}
  }

  return (
    <div className="page nt-page">
      <div className="hint">
        {edit ? (
          <>
            <b>Edit mode:</b> type directly into the boxes. Your entries save
            automatically in this browser. When done, click <b>📧 Email to Masoud</b>. It
            opens your email with everything you typed, ready to send.
          </>
        ) : (
          <>
            Prototype. Click <b>✏️ Edit labels</b> (top right) to fill in the grey
            boxes, then <b>📧 Email to Masoud</b> to send them. The <b>Create Business
            Notification</b> tab works as-is: type in it and watch the preview. No
            newsletters are sent to subscribers yet.
          </>
        )}
      </div>

      <div className="nt-title-row">
        <h2 style={{ margin: "6px 0 14px" }}>Notifications</h2>
        <div className="nt-edit-bar">
          {flash && <span className="fp-flash">{flash}</span>}
          {edit && <button type="button" className="btn secondary" onClick={reset}>Reset</button>}
          {hasEntries && (
            <>
              <button type="button" className="btn secondary" onClick={download}>Download</button>
              <button type="button" className="btn secondary" onClick={copyEntries}>Copy entries</button>
              <button type="button" className="btn" onClick={emailMasoud}>📧 Email to Masoud</button>
            </>
          )}
          <button type="button" className="btn" onClick={() => setEdit((e) => !e)}>
            {edit ? "✓ Done editing" : "✏️ Edit labels"}
          </button>
        </div>
      </div>

      <div className="status-legend">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`status-pill ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "browse" && <BrowseTab edit={edit} labels={labels} update={update} />}
      {tab === "mine" && <MineTab edit={edit} labels={labels} update={update} />}
      {tab === "business" && <BusinessTab />}
    </div>
  );
}
