"use client";

import { AdPage, AD_LINKS } from "../components/AdPages";
import { Glyph } from "../components/Icons";

// Earn with Advertising — the hub. Each box opens its own page (Oct 15 call:
// the combined page is split into separate pages).
export default function AdvertisingPage() {
  return (
    <AdPage title="Earn with Advertising">
      <section className="ad-box">
        <p>
          calendarGold offers various <b>free and paid opportunities</b> to promote your events, businesses, and
          organizations, online and in-person. Please <a href="/info#contact">contact us</a> to discuss win-win package deals.
        </p>
      </section>
      <section className="ad-box">
        <h2>Save $$$ ! Results-Based Marketing</h2>
        <p>
          Calculate and manage your advertising cost based on <b># weeks</b> and <b># views OR # clicks</b>.{" "}
          <i>Full transparency:</i> the system calculates the approximate number of times your listing may be displayed,
          based on every user&rsquo;s matching filters in Calendar, Discount / Gift Certificates, Organizations,
          Employment and Notifications.
        </p>
        <p><b>NOTE:</b> <i>This is NOT the typical pay-and-pray, shotgun, push-marketing approach!</i></p>
      </section>
      <div className="ad-hub">
        {AD_LINKS.map((l) => (
          <a key={l.href} href={l.href} className="ad-box ad-hub-item">
            <Glyph name={l.icon} size={34} strokeWidth={1.4} />
            <span>{l.label}</span>
          </a>
        ))}
      </div>
    </AdPage>
  );
}
