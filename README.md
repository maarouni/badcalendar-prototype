# Master Calendar — Local Prototype (v0)

This is a throwaway local prototype, not the production build. No accounts,
no real database, no Cesar-facing deployment. Purpose: prove the core loop
works before committing to the full engineering plan in the feasibility doc.

## What's here
- **Super Calendar** (`/`) — public event list with the full filter panel
  from Cesar's spec (rev 260923): Event Types (In-Person/Online,
  Premier/Regular), Dates, Costs, Regions (Bay Area counties, CA regions,
  National/International) and Categories (6 groups). Multi-select; AND across
  sections, OR within a section (spec "Matchmaking Algorithm"). Options with no
  results are grayed out, "Online only" grays out Regions, and filters can be
  saved as Filter Sets A/B/C. Premier events list first, then by date/time.
  Taxonomy lives in `app/lib/taxonomy.js`.
- **My Calendar** (`/my-calendar`) — your selected events with the spec's
  8-state attendance status, a status filter bar, and "Add to Google Calendar".
- **Submit Event** (`/submit`) — free event submission form, writes
  straight into the mock data file.

## What's intentionally NOT here yet
- No auth/accounts — "My Calendar" is saved to your browser's localStorage
  only, per-device, not per-user.
- No real database — events live in `data/events.json` on disk.
- No ticketing, Stripe, referral tracking, or newsletter engine — that's
  Phase 2+ per the feasibility doc.
- No image upload/compression.

## Run it
```
npm install
npm run dev
```
Then open http://localhost:3000

## Stack
Next.js 14 (App Router), plain CSS — same stack recommended in the
feasibility doc, so this prototype's code carries forward into the real
build rather than being thrown away.
