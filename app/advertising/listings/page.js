"use client";

import { AdPage, RateCard } from "../../components/AdPages";

export default function ListingRatesPage() {
  return (
    <AdPage title="calendarGold Listings">
      <RateCard slug="listings">
        <div className="ad-detail">
          <h3>Free Listing</h3>
          <p>Calendar <i>Events</i> · Organizations · Notifications</p>
          <h3>Premier Listing</h3>
          <p>
            <b><i>Save $$$ !</i></b> <a href="/advertising/calculate">Calculate and Manage your Advertising Cost</a> based on
            # weeks and # views OR # clicks. <i>Full transparency:</i> the system calculates the approximate # of times your
            listing may be displayed, based on every user&rsquo;s matching filters in Calendar, Discount / Gift
            Certificates, Organizations, Employment and Notifications.
          </p>
        </div>
      </RateCard>
    </AdPage>
  );
}
