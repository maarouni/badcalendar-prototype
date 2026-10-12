// Prototype shopping cart (Cesar's "Account Shopping Cart": one cart for
// event tickets, discounts, employment listings and notifications).
// Browser-only until there are accounts + payments.
const KEY = "mc_cart_v1";

export const CART_KINDS = [
  { id: "events", label: "My Events" },
  { id: "tickets", label: "My Events Tickets" },
  { id: "discounts", label: "My Discount / Gift Certificates" },
  { id: "employment", label: "My Employment Listings" },
  { id: "notifications", label: "My Notifications" },
];

export function readCart() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

function write(items) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  try { window.dispatchEvent(new Event("mc-cart-changed")); } catch {}
}

export function addToCart(item) {
  const items = readCart();
  const i = items.findIndex((x) => x.kind === item.kind && x.refId === item.refId);
  if (i >= 0) items[i] = { ...items[i], qty: (items[i].qty || 1) + (item.qty || 1) };
  else items.push({ ...item, qty: item.qty || 1, added: new Date().toISOString() });
  write(items);
}

export function removeFromCart(kind, refId) {
  write(readCart().filter((x) => !(x.kind === kind && x.refId === refId)));
}

export function setQty(kind, refId, qty) {
  write(readCart().map((x) => (x.kind === kind && x.refId === refId ? { ...x, qty: Math.max(1, qty) } : x)));
}

export function clearCart() { write([]); }

export function cartCount() {
  return readCart().reduce((s, x) => s + (x.qty || 1), 0);
}
