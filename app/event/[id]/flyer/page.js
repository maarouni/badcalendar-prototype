"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { slugify } from "../../../lib/slug";

export default function EventFlyer() {
  const { id } = useParams();
  const [event, setEvent] = useState(undefined);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((events) => setEvent(events.find((e) => e.id === id) || null));
  }, [id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/event/${id}`;
    QRCode.toDataURL(url, { width: 320, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [id]);

  const eventUrl = typeof window !== "undefined" ? `${window.location.origin}/event/${id}` : "";

  const emailTemplate = useMemo(() => {
    if (!event) return "";
    return `Subject: You're invited — ${event.title}

Hi {{first_name}},

You're invited to ${event.title}, hosted by ${event.hostedBy}.

🗓️  ${event.date}${event.time ? ` · ${event.time}` : ""}
${event.type === "Online" ? "💻  Online — link sent after you RSVP" : `📍  ${event.city}`}
💵  ${event.cost}

${event.description || ""}

Reserve your spot here:
${eventUrl}

See you there!
${event.hostedBy}

—
Sent via badcalendar.com. Scan the flyer QR code or click the link above to view full event details and add it to your calendar.`;
  }, [event, eventUrl]);

  function copyEmail() {
    navigator.clipboard?.writeText(emailTemplate).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function printFlyer() {
    window.print();
  }

  if (event === undefined) {
    return <div className="page"><p>Loading…</p></div>;
  }

  if (event === null) {
    return (
      <div className="page">
        <div className="empty-state">
          Couldn't find that event. <a href="/">Back to Super Calendar</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flyer-page">
      <div className="flyer-toolbar">
        <a href={`/event/${id}`} className="btn-ghost">← Back to event</a>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn secondary" onClick={printFlyer}>
            🖨️ Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="flyer-sheet">
        <div className="flyer-sheet-header">
          <div>
            <h1 className="flyer-sheet-title">{event.title}</h1>
            <div className="flyer-sheet-meta">
              🗓️ {event.date}{event.time ? ` · ${event.time}` : ""}<br />
              {event.type === "Online" ? "💻 Online event" : `📍 ${event.city}`}<br />
              💵 {event.cost}<br />
              Hosted by {event.hostedBy}
            </div>
          </div>
          <div className="flyer-sheet-qr">
            {qrDataUrl && <img src={qrDataUrl} alt="QR code" />}
            <div>Scan for details &amp; RSVP</div>
          </div>
        </div>
        <p className="flyer-sheet-desc">{event.description || "No description provided yet."}</p>
        <p className="flyer-sheet-desc" style={{ marginTop: 16, fontSize: "0.85rem", color: "#8a8a94" }}>
          {eventUrl}
        </p>
      </div>

      <div className="email-template-block">
        <h3>Email invite template</h3>
        <p style={{ marginTop: -8, color: "#6b6b76", fontSize: "0.88rem" }}>
          Prefilled from this event's details — copy it into your email tool and
          swap in your recipient list. <code>{"{{first_name}}"}</code> is a placeholder
          for a mail-merge field if your sender supports one.
        </p>
        <textarea readOnly value={emailTemplate} onFocus={(e) => e.target.select()} />
        <div style={{ marginTop: 12 }}>
          <button type="button" className="btn-primary" onClick={copyEmail}>
            {copied ? "✓ Copied" : "Copy email template"}
          </button>
        </div>
      </div>
    </div>
  );
}
