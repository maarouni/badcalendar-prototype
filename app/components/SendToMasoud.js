"use client";

import { useEffect, useState } from "react";
import { Glyph } from "./Icons";

// Until there's a shared database, anything posted through the forms lives
// only in the poster's browser. This block lets Cesar send what he entered
// to Masoud (email / copy / file) so it can be added to the site for everyone.
export const MASOUD_EMAIL = "maarouni@gmail.com";
const MAILTO_LIMIT = 1800; // long mailto bodies get cut off by some mail apps

export default function SendToMasoud({ load, noun = "listings", format, subject }) {
  const [items, setItems] = useState([]);
  const [flash, setFlash] = useState("");

  useEffect(() => { setItems(load()); }, [load]);

  if (!items.length) return null;

  const readable = items.map((x, i) => `${i + 1}. ${format(x)}`).join("\n\n");
  const full = `${readable}\n\n---- data (for Masoud) ----\n${JSON.stringify(items, null, 2)}`;

  function say(msg) { setFlash(msg); setTimeout(() => setFlash(""), 3500); }

  function email() {
    const body = full.length > MAILTO_LIMIT
      ? `${readable}\n\n(Full data is attached separately: use "Download file" and attach it.)`
      : full;
    window.location.href =
      `mailto:${encodeURIComponent(MASOUD_EMAIL)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (full.length > MAILTO_LIMIT) say(`Long list — please also click "Download file" and attach it to the email.`);
  }

  async function copy() {
    try { await navigator.clipboard.writeText(full); say(`Copied. Paste it into an email to ${MASOUD_EMAIL}.`); }
    catch { say("Couldn't copy — use Download file instead."); }
  }

  function download() {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `calendargold-${noun.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="send-masoud">
      <div className="send-masoud-text">
        <b>You&rsquo;ve posted {items.length} {items.length === 1 ? noun.replace(/s$/, "") : noun} from this computer.</b>{" "}
        They only show on this computer until we set up the shared database. Send them to Masoud so he can make them
        permanent for everyone.
      </div>
      <div className="send-masoud-actions">
        <button type="button" className="btn-primary btn-sm" onClick={email}><Glyph name="email" size={15} /> Send my {noun} to Masoud</button>
        <button type="button" className="btn-ghost btn-sm" onClick={copy}>Copy</button>
        <button type="button" className="btn-ghost btn-sm" onClick={download}><Glyph name="pdf" size={14} /> Download file</button>
      </div>
      {flash && <div className="fp-flash fp-flash-block">{flash}</div>}
    </div>
  );
}
