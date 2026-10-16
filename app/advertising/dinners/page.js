"use client";

import { AdPage, RateCard } from "../../components/AdPages";

export default function DinnerRatesPage() {
  return (
    <AdPage title="Dinners & Networking">
      <RateCard slug="dinners">
        <div className="ad-detail">
          <p>Connect · Pay-it-Forward · Invite Others · 5-Star Hospitality · 3-Course Prix Fixe Dinner · Upscale Ambiance · Prizes</p>
          <h3>Restaurant Owner</h3>
          <p>Showcase your cuisine, promote your business, and earn money.</p>
          <p><a href="/info#contact">Click here to participate</a></p>
        </div>
      </RateCard>
    </AdPage>
  );
}
