"use client";

import { AdPage, RateCard } from "../../components/AdPages";

export default function WorkshopRatesPage() {
  return (
    <AdPage title="Workshops">
      <RateCard slug="workshops">
        <div className="ad-detail">
          <p>Typical attendance 10 – 40+ · 5-Star Hospitality · Upscale Ambiance · Prizes</p>
          <h3>Presenter</h3>
          <p>Subject to approval and availability. Your mini-card on the event page links to your profile on calendarGold or directly to your website. Bring prizes for the drawing.</p>
          <p><a href="/info#contact">Click here to participate</a></p>
        </div>
      </RateCard>
    </AdPage>
  );
}
