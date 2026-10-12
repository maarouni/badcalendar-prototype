"use client";

import { useEffect, useState } from "react";
import PageTemplate from "../components/PageTemplate";
import { Glyph, IconButton } from "../components/Icons";
import { CART_KINDS, readCart, removeFromCart, setQty, clearCart } from "../lib/cart";

// Cesar's "Account Shopping Cart" (Dashboards, Figma Rev 261012): one cart for
// event tickets, discounts, employment listings and notifications.
// Prototype: items live in this browser; checkout comes with payments.
const TICKET_FEE = 0.8; // his spec: $0.80 per-ticket fee

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [kind, setKind] = useState("all");

  useEffect(() => {
    const load = () => setItems(readCart());
    load();
    window.addEventListener("mc-cart-changed", load);
    return () => window.removeEventListener("mc-cart-changed", load);
  }, []);

  const shown = kind === "all" ? items : items.filter((i) => i.kind === kind);
  const sub = shown.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
  const fees = shown.filter((i) => i.kind === "tickets" && i.price > 0).reduce((s, i) => s + TICKET_FEE * (i.qty || 1), 0);
  const money = (n) => `$${n.toFixed(2)}`;

  return (
    <PageTemplate
      section={null}
      status="construction"
      title="Account Shopping Cart"
      subtitle="My Dashboards"
      intro="One cart for everything: event tickets, Premier listings, discount / gift certificates, employment listings and notifications. Checkout and payments come in the next build."
      actions={items.length > 0 && <IconButton name="clearAll" tip="Clear All" onClick={clearCart} />}
    >
      <div className="cart-kinds" role="radiogroup" aria-label="Cart section">
        <span className="ed-label">Select one at a time</span>
        <label className="fp-option"><input type="radio" name="cart-kind" checked={kind === "all"} onChange={() => setKind("all")} /><span className="fp-label">All items <em>(default)</em></span></label>
        {CART_KINDS.map((k) => (
          <label key={k.id} className="fp-option">
            <input type="radio" name="cart-kind" checked={kind === k.id} onChange={() => setKind(k.id)} />
            <span className="fp-label">{k.label}</span>
            <span className="fp-count">{items.filter((i) => i.kind === k.id).length}</span>
          </label>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="cart-empty">
          <Glyph name="cart" size={40} strokeWidth={1.4} />
          <p>Your cart is empty. Use <Glyph name="cartAdd" size={15} /> <b>Add item to My Shopping Cart</b> on a ticketed event to add one.</p>
          <a href="/" className="btn-primary btn-sm">Browse One Big Calendar</a>
        </div>
      ) : (
        <table className="cart-table">
          <thead>
            <tr><th>Item</th><th>Qty</th><th>$ Each</th><th>$ Subtotal</th><th aria-label="Remove" /></tr>
          </thead>
          <tbody>
            {shown.map((i) => (
              <tr key={i.kind + i.refId}>
                <td>
                  <div className="cart-item-title">{i.title}</div>
                  <div className="nt-hint">{CART_KINDS.find((k) => k.id === i.kind)?.label}{i.when ? ` · ${i.when}` : ""}</div>
                </td>
                <td>
                  <input type="number" min="1" className="cart-qty" value={i.qty || 1} onChange={(e) => setQty(i.kind, i.refId, Number(e.target.value) || 1)} aria-label="Quantity" />
                </td>
                <td>{money(i.price || 0)}</td>
                <td>{money((i.price || 0) * (i.qty || 1))}</td>
                <td><IconButton name="delete" tip="Delete" size={16} onClick={() => removeFromCart(i.kind, i.refId)} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={3}>Ticket fees <span className="nt-hint">($0.80 per ticket)</span></td><td>{money(fees)}</td><td /></tr>
            <tr className="cart-total"><td colSpan={3}>$ Total Cost</td><td>{money(sub + fees)}</td><td /></tr>
          </tfoot>
        </table>
      )}
      {shown.length > 0 && (
        <button type="button" className="btn-primary" disabled title="Payments aren't wired up yet">
          Checkout — coming with payments
        </button>
      )}
    </PageTemplate>
  );
}
