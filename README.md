# Master Calendar — Local Prototype (v0)

This is a throwaway local prototype, not the production build. No accounts,
no real database, no Cesar-facing deployment. Purpose: prove the core loop
works before committing to the full engineering plan in the feasibility doc.

## What's here
- **Super Calendar** (`/`) — public event list with Type/Category filters,
  matching the "gold = public view" mode from Cesar's Figma spec. Select
  events to add them to My Calendar.
- **My Calendar** (`/my-calendar`) — your selected events with a per-event
  attendance status (Interested / Going / Not Going), matching the "gray =
  private edit mode" concept.
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
