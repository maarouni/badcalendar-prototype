"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { slugify, categoryIcon } from "../../lib/slug";
import { googleCalendarUrl, eventCategories } from "../../lib/taxonomy";
import { fetchEvents } from "../../lib/events";
import { fmtWhen, dateFormatOf } from "../../components/EventVisuals";
import { Glyph, IconButton } from "../../components/Icons";
import { addToCart } from "../../lib/cart";

const STORAGE_KEY = "mc_my_calendar_v1";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(undefined);
  const [saved, setSaved] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [qty, setQty] = useState(1);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    fetchEvents()
      .then((events) => {
        setEvent(events.find((e) => e.id === id) || null);
      });
    const sel = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    setSaved(!!sel[id]);
  }, [id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/event/${id}`;
    QRCode.toDataURL(url, { width: 280, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [id]);

  function toggleSaved() {
    const sel = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    sel[id] = !sel[id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sel));
    setSaved(!!sel[id]);
  }

  if (event === undefined) {
    return <div className="page"><p>Loading…</p></div>;
  }

  if (event === null) {
    return (
      <div className="page">
        <div className="empty-state">
          Couldn't find that event. <a href="/">Back to One Big Calendar</a>
        </div>
      </div>
    );
  }

  const privacy = event.privacy === "Private" ? "Private" : "Public";
  const mapQuery = [event.venue, event.address, event.city, event.state || "CA"].filter(Boolean).join(", ");
  const paid = (event.price || 0) > 0;

  function share() {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: event.title, url }).catch(() => {});
    else navigator.clipboard?.writeText(url).then(() => { setFlash("Link copied"); setTimeout(() => setFlash(""), 1800); });
  }

  function addTickets() {
    addToCart({ kind: "tickets", refId: event.id, title: event.title, when: fmtWhen(event), price: event.price || 0, qty });
    setFlash(`${qty} ticket${qty > 1 ? "s" : ""} added to My Shopping Cart`);
    setTimeout(() => setFlash(""), 2400);
  }
  const ctaLabel = event.cost.toLowerCase().includes("free") && !event.cost.includes("$")
    ? "RSVP"
    : "Get Tickets";

  return (
    <div className="page event-detail">
      <div className={`event-cover cover-${slugify(event.category)}`}>
        {event.premier && <span className="cover-premier">★ PREMIER EVENT</span>}
        <span className="cover-icon">{categoryIcon(event.category)}</span>
      </div>

      <div className="event-detail-grid">
        <div className="event-detail-main">
          <span className="badge" style={{ marginBottom: 10, display: "inline-block" }}>
            {event.category}
          </span>
          {eventCategories(event).length > 1 && (
            <div className="sub" style={{ marginBottom: 6 }}>
              {eventCategories(event).join(" · ")}
            </div>
          )}
          <h1>{event.title}</h1>
          <div className="event-meta-row">
            <span data-tip={`Date format ${dateFormatOf(event)}`}><Glyph name="calendar" size={16} /> {fmtWhen(event)}</span>
            <span><Glyph name={event.type === "Online" ? "share" : "map"} size={16} /> {event.type === "Online" ? "Online / Virtual" : `${event.city}${event.region ? ` · ${event.region}` : ""}`}</span>
            <span className={`privacy-pill ${privacy === "Private" ? "private" : ""}`} data-tip={privacy === "Private" ? "Hide, Private — only you see this event" : "Display, Public — anyone can see this event"}>
              <Glyph name={privacy === "Private" ? "private" : "public"} size={16} /> {privacy}
            </span>
            <span className="tier-pill">{event.premier ? "Premier (Ad) Listing" : "Regular (Free) Listing"}</span>
          </div>

          <div className="event-icon-bar">
            <IconButton name="select" tip={saved ? "In My Selection — click to remove" : "Add listing to My Selection"} onClick={toggleSaved} className={saved ? "on" : ""} />
            <IconButton name="gcal" href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" />
            <IconButton name="like" tip="Like (coming soon)" />
            <IconButton name="share" onClick={share} />
            <IconButton name="comments" tip="Comments (coming soon)" />
            <IconButton name="gallery" tip="Gallery (coming soon)" />
            <IconButton name="pdf" onClick={() => window.print()} />
            <IconButton name="print" onClick={() => window.print()} />
          </div>
          {flash && <div className="fp-flash fp-flash-block">{flash}</div>}

          <h4 className="section-label" style={{ marginTop: 24 }}>About this event</h4>
          <p className="event-description">{event.description || "No description provided yet."}</p>

          {event.type !== "Online" && event.city && (
            <>
              <h4 className="section-label" style={{ marginTop: 24 }}><Glyph name="map" size={15} /> Location</h4>
              <div className="map-embed">
                <iframe
                  title={`Map of ${mapQuery}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=12&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a className="map-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noopener noreferrer">
                Open in Google Maps →
              </a>
            </>
          )}

          <h4 className="section-label" style={{ marginTop: 24 }}>Who's going</h4>
          <div className="attendee-placeholder">
            <span className="coming-soon-tag" style={{ position: "static" }}>Coming soon</span>
            <p>Attendee lists and RSVP counts aren't wired up in this prototype yet.</p>
          </div>
        </div>

        <aside className="event-detail-side">
          <div className="rsvp-card" id="tickets">
            <div className="rsvp-cost">{event.cost}</div>
            {paid ? (
              <>
                <label className="rsvp-qty">
                  <span><Glyph name="ticket" size={15} /> Tickets</span>
                  <input type="number" min="1" max="20" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
                </label>
                <button type="button" className="btn-primary rsvp-btn" onClick={addTickets}>
                  <Glyph name="cartAdd" size={17} /> Add Ticket(s) to My Shopping Cart
                </button>
                <a href="/cart" className="rsvp-hint rsvp-cart-link"><Glyph name="cart" size={13} /> View My Shopping Cart</a>
              </>
            ) : (
              <>
                <button type="button" className="btn-primary rsvp-btn" onClick={toggleSaved}>
                  <Glyph name="ticket" size={17} /> {saved ? "RSVP'd — on My Calendar" : "RSVP (free)"}
                </button>
                <div className="rsvp-hint">Free event — RSVP adds it to My Calendar Digest</div>
              </>
            )}
            <button
              type="button"
              className={`btn secondary rsvp-save ${saved ? "saved" : ""}`}
              onClick={toggleSaved}
            >
              <Glyph name="select" size={15} /> {saved ? "In My Selection" : "Add to My Selection"}
            </button>
            <a
              className="btn secondary rsvp-save"
              style={{ display: "block", textAlign: "center", textDecoration: "none", marginTop: 8 }}
              href={googleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Glyph name="gcal" size={15} /> Add to My Google Calendar
            </a>
          </div>

          <a href={`/organizer/${slugify(event.hostedBy)}`} className="host-card">
            <div className="nav-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
              {event.hostedBy.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="host-card-label">Hosted by</div>
              <div className="host-card-name">{event.hostedBy}</div>
            </div>
          </a>

          <div className="qr-card">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt={`QR code linking to ${event.title}`} />
            ) : (
              <div style={{ padding: 40 }}>Generating QR code…</div>
            )}
            <div className="qr-card-label">
              <b>Event QR Code</b> — created automatically. Scan to open this event page — print it on flyers or table signs.
            </div>
            <a href={`/event/${id}/flyer`} className="qr-card-link">
              → Get flyer &amp; email template
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
