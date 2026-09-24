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

  const newEvent = {
    id: String(Date.now()),
    title: body.title || "Untitled Event",
    hostedBy: body.hostedBy || "You",
    date: body.date || "",
    time: body.time || "",
    city: body.city || "",
    region: body.type === "Online" ? "" : body.region || "",
    type: body.type || "In Person",
    category: body.category || "Networking",
    categories: Array.isArray(body.categories) ? body.categories : [],
    cost: body.cost || "Free",
    price: Number(body.price) || 0,
    premier: false,
  };

  events.push(newEvent);
  await fs.writeFile(DATA_PATH, JSON.stringify(events, null, 2));
  return NextResponse.json(newEvent, { status: 201 });
}
