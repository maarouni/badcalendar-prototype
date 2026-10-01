// Loads the event list. Events submitted from this browser are kept locally
// too, so the prototype still works where the server can't write its data
// file (e.g. the Vercel preview).
const LOCAL_KEY = "mc_submitted_events_v1";

export function localEvents() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveLocalEvent(ev) {
  try {
    const list = localEvents().filter((e) => e.id !== ev.id);
    list.push(ev);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {}
}

export async function fetchEvents() {
  let server = [];
  try {
    const r = await fetch("/api/events");
    server = await r.json();
  } catch {}
  const ids = new Set(server.map((e) => e.id));
  return [...server, ...localEvents().filter((e) => !ids.has(e.id))];
}
