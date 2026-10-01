import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "events.json");

export async function GET() {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return NextResponse.json(JSON.parse(raw));
}

export async function POST(request) {
  const body = await request.json();
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  const events = JSON.parse(raw);

  const text = (v, max = 2000) => (typeof v === "string" ? v.slice(0, max) : "");
  const newEvent = {
    id: String(Date.now()),
    title: text(body.title, 140) || "Untitled Event",
    hostedBy: text(body.hostedBy, 120) || "You",
    date: text(body.date, 10),
    endDate: text(body.endDate, 10),
    extraDates: Array.isArray(body.extraDates) ? body.extraDates.slice(0, 6).map((d) => text(d, 10)) : [],
    time: text(body.time, 20),
    city: text(body.city, 80),
    region: body.type === "Online" ? "" : text(body.region, 60),
    type: body.type === "Online" ? "Online" : "In Person",
    category: text(body.category, 60) || "Networking",
    categories: Array.isArray(body.categories) ? body.categories.slice(0, 20).map((c) => text(c, 60)) : [],
    cost: text(body.cost, 60) || "Free",
    price: Number(body.price) || 0,
    premier: !!body.premier,
    tagline: text(body.tagline, 140),
    venue: text(body.venue, 120),
    address: text(body.address, 160),
    state: text(body.state, 40),
    zip: text(body.zip, 12),
    country: text(body.country, 60),
    url: text(body.url, 300),
    description: text(body.description, 1250),
    contact: body.contact && typeof body.contact === "object"
      ? { name: text(body.contact.name, 120), phone: text(body.contact.phone, 40), email: text(body.contact.email, 120) }
      : null,
    display: body.display && typeof body.display === "object"
      ? { qr: !!body.display.qr, rsvpCount: !!body.display.rsvpCount, rsvpList: !!body.display.rsvpList }
      : null,
    adBudget: body.adBudget && typeof body.adBudget === "object" ? body.adBudget : null,
    createdAt: new Date().toISOString(),
  };

  events.push(newEvent);
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(events, null, 2));
    return NextResponse.json({ ...newEvent, persisted: true }, { status: 201 });
  } catch {
    // Hosted previews have a read-only filesystem — the browser keeps a copy.
    return NextResponse.json({ ...newEvent, persisted: false }, { status: 201 });
  }
}
