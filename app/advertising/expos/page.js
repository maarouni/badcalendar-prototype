"use client";

import { AdPage, RateCard } from "../../components/AdPages";

export default function ExpoRatesPage() {
  return (
    <AdPage title="Business & Technology Networking Expos">
      <RateCard slug="expos">
        <div className="ad-detail">
          <p>Typical attendance 200 – 800+ · 5-Star Hospitality · Upscale Ambiance · Caterers · Exhibitors · Music · Prizes</p>
          <p>Your mini-card on the event page links to your profile on calendarGold or directly to your website. Bring your banner, giveaways and marketing collateral, and prizes for the drawing. Discounts available for participating in multiple events.</p>
          <h3>Caterer, Beverage Provider (Spirits, Wine)</h3>
          <p>Includes a 6 ft or 8 ft table with linen.</p>
          <h3>Entertainment</h3>
          <p>DJ, live music, performer, photographer, videographer. Includes a round cocktail table with linen.</p>
          <h3>Exhibitor</h3>
          <p>Option A: 6 ft or 8 ft table with linen. Option B: round cocktail table with linen.</p>
          <h3>Sponsor</h3>
          <p>Package deal — contact us for details.</p>
          <p><a href="/info#contact">Click here to participate</a></p>
        </div>
      </RateCard>
    </AdPage>
  );
}
