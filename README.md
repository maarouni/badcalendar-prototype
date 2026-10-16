# calendarGold — Prototype

**Live:** https://calendargold.vercel.app · **All pages:** https://calendargold.vercel.app/pages

calendarGold is a Bay Area events, discounts, organizations, employment and notifications platform —
an innovative, results-based marketing and revenue-sharing system (*Connect • Promote • Earn*).
This repository is the working prototype used to review page designs and flows before
the production build.

## What's built

| Section | Pages |
|---|---|
| **One Big Calendar** | Home (`/`): Bay Area county map, 4-step filters (Event Types, Dates incl. custom range, Costs, Regions, Categories), Filter Sets, Premier / Regular listings, selection + Next Step |
| **Event Details** | `/event/[id]`: date formats A–D, Public/Private, Google map, QR code, tickets → cart |
| **Create Event** | `/submit`: Regular or Premier listing with advertising budget |
| **My Calendar Digest** | `/my-calendar`: selected events, attendance status, Google Calendar |
| **Discount / Gift Certificates** | `/discounts`, `/discounts/[id]`, `/discounts/submit` |
| **Organizations** | `/organizations` (digest: # Members, Annual Dues, My Membership Status filters), `/organizations/[id]`, `/organizations/[id]/members`, `/organizations/submit` |
| **Employment Listings** | `/employment`, `/employment/submit` |
| **Notifications** | `/notifications` (Browse, My Notifications, Create Business Notification) |
| **Earn with Advertising** | `/advertising` hub, `/advertising/calculate` (views vs. clicks side by side, D = A × B × C), rate pages `/advertising/listings`, `/expos`, `/dinners`, `/workshops`. All rates live in `app/lib/adRates.js` |
| **Earn / Invite & Refer** | `/refer`: referral QR code + link, 5% / 3% / 2% revenue share |
| **Shopping Cart** | `/cart`: tickets, certificates and listings in one cart |
| **Account** | `/login` (sign up / log in), `/dashboards`, `/profile` |
| **Info** | `/info`: About, Contact, Legend Icons, color code, site index |

**Design conventions** (from the Figma reviews): page template with the 4-section icon row;
color code — yellow = under construction, gray = edit / input, white = output;
one shared icon set with hover tooltips (`app/components/Icons.js`).

## Prototype limits (next phase)

- **No shared database yet.** Listings posted from a browser stay in that browser; the
  "Send my … to Masoud" buttons export them so they can be added for everyone.
- **Payments / checkout on hold** — cart, tickets, Premier budgets and referral payouts
  are shown but not charged.
- **Not yet built:** email/SMS notification delivery, image uploads, location detection,
  real accounts.

## Run locally

```
npm install
npm run dev
```

Then open http://localhost:3000.

**Stack:** Next.js 14 (App Router), React 18, plain CSS (`app/globals.css`).
Sample data: `data/events.json`, `app/lib/jobs.js`, `app/lib/discounts.js`, `app/lib/organizations.js`.
