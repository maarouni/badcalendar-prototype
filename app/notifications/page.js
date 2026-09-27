"use client";

import { useState } from "react";
import { REGION_GROUPS, CATEGORY_GROUPS } from "../lib/taxonomy";
import {
  NOTIFICATION_FILTERS,
  DELIVERY_CHANNELS,
  DELIVERY_FREQUENCY,
  DELIVERY_DAYS,
  BUSINESS_SECTIONS,
  MAX_LISTINGS_PER_NOTIFICATION,
  MAX_BUSINESSES_PER_USER,
  SAMPLE_NOTIFICATION_CARDS,
} from "../lib/notificationConfig";

const TABS = [
  { id: "browse", label: "Browse Notifications" },
  { id: "mine", label: "My Notifications" },
  { id: "business", label: "Create Business Notification" },
];

// Renders the label if filled in, otherwise a dashed "to be filled" slot.
function Slot({ text, link, placeholder = "Label — to be filled" }) {
  if (!text) return <span className="nt-slot">{placeholder}</span>;
  return link ? <a href={link} className="title-link">{text}</a> : <span>{text}</span>;
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

function BrowseTab() {
  return (
    <div className="layout-with-sidebar">
      <aside className="sidebar filter-panel">
        <div className="fp-top"><h4>Notification filters</h4></div>
        {NOTIFICATION_FILTERS.map((g) => (
          <Group key={g.id} title={g.title} hint={g.hint}>
            {g.options.map((o, i) => (
              <label key={i} className="fp-option">
                <input type={g.type} name={`nt-${g.id}`} disabled={!o.label} />
                <span className="fp-label"><Slot text={o.label} link={o.link} /></span>
              </label>
            ))}
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
          {SAMPLE_NOTIFICATION_CARDS.map((c, i) => (
            <div key={i} className="nt-card">
              <div className="nt-card-title"><Slot text={c.label} link={c.link} placeholder="Notification name" /></div>
              <div className="nt-card-row"><span className="nt-slot sm">Publisher</span></div>
              <div className="nt-card-row">
                <span className="nt-slot sm">Subscribers</span>
                <span className="nt-slot sm">Frequency</span>
              </div>
              <div className="nt-card-row"><span className="nt-slot sm">Region · Category</span></div>
              <button type="button" className="btn nt-sub-btn" disabled>Subscribe</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MineTab() {
  const [channel, setChannel] = useState("Email");
  const [days, setDays] = useState(["Wed"]);
  const toggleDay = (d) => setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  return (
    <div className="nt-two-col">
      <div>
        <h4 className="section-label">My subscriptions</h4>
        <table className="nt-table">
          <thead>
            <tr><th>Notification</th><th>Publisher</th><th>Frequency</th><th>Filter set</th><th></th></tr>
          </thead>
          <tbody>
            {[0, 1, 2].map((i) => (
              <tr key={i}>
                <td><span className="nt-slot sm">Notification name</span></td>
                <td><span className="nt-slot sm">Publisher</span></td>
                <td><span className="nt-slot sm">Frequency</span></td>
                <td>
                  <select disabled defaultValue="">
                    <option value="">Set A / B / C</option>
                  </select>
                </td>
                <td><button type="button" className="remove-link" disabled title="Unsubscribe">✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="nt-hint" style={{ marginTop: 8 }}>
          Attaching a Filter Set (A/B/C) auto-fills a notification with matching listings.
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
        {DELIVERY_FREQUENCY.map((o, i) => (
          <label key={i} className="fp-option">
            <input type="radio" name="nt-freq" disabled={!o.label} />
            <span className="fp-label"><Slot text={o.label} /></span>
          </label>
        ))}

        <div className="nt-field-label">Deliver on these days (batched)</div>
        <div className="nt-days">
          {DELIVERY_DAYS.map((d) => (
            <label key={d} className="nt-day">
              <input type="checkbox" checked={days.includes(d)} onChange={() => toggleDay(d)} />
              {d}
            </label>
          ))}
        </div>

        <button type="button" className="btn" disabled style={{ marginTop: 14 }}>Save preferences</button>
      </div>
    </div>
  );
}

function BusinessTab() {
  const [tier, setTier] = useState("Free");
  return (
    <div className="nt-two-col">
      <div>
        <div className="nt-builder-top">
          <label className="nt-field">
            <span className="nt-field-label">Business</span>
            <select disabled defaultValue="">
              <option value="">Select business (up to {MAX_BUSINESSES_PER_USER})</option>
            </select>
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

        {BUSINESS_SECTIONS.map((s) => (
          <div key={s.id} className="nt-section">
            <div className="nt-section-head">
              <b>{s.title}</b>
              <span className="nt-hint">{s.hint}</span>
            </div>
            {s.kind === "text" ? (
              <textarea className="nt-textarea" placeholder="Description text…" disabled />
            ) : (
              <>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="nt-listing-slot">
                    <span className="nt-slot sm">Event listing</span>
                    <span className="nt-slot sm">RSVP link</span>
                  </div>
                ))}
                <button type="button" className="nt-add" disabled>+ Add listing</button>
              </>
            )}
          </div>
        ))}

        <div className="nt-footer-row">
          <span className="nt-counter">0 / {MAX_LISTINGS_PER_NOTIFICATION} listings (premier + regular)</span>
          <button type="button" className="btn" disabled>Add to shopping cart</button>
        </div>
      </div>

      <div className="nt-panel nt-preview">
        <h4 className="section-label">Preview</h4>
        <div className="nt-preview-box">
          <div className="nt-slot" style={{ display: "block", marginBottom: 10 }}>Header / business logo</div>
          <div className="nt-preview-sec">A · Information</div>
          <div className="nt-preview-sec">B · RSVP Today</div>
          <div className="nt-preview-sec">C · Other Events</div>
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
  return (
    <div className="page nt-page">
      <div className="hint">
        Prototype framework: layout and controls only. Grey dashed boxes are
        labels/links still to be filled in. Nothing is emailed or texted.
      </div>
      <h2 style={{ margin: "6px 0 14px" }}>Notifications</h2>
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
      {tab === "browse" && <BrowseTab />}
      {tab === "mine" && <MineTab />}
      {tab === "business" && <BusinessTab />}
    </div>
  );
}
