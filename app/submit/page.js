"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REGION_GROUPS, CATEGORY_GROUPS } from "../lib/taxonomy";

export default function SubmitEvent() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    hostedBy: "",
    date: "",
    time: "",
    city: "",
    region: "Alameda",
    type: "In Person",
    category: "Networking",
    categories: ["Networking"],
    cost: "Free",
    price: 0,
  });

  function toggleCat(c) {
    setForm((f) => {
      const has = f.categories.includes(c);
      const categories = has ? f.categories.filter((x) => x !== c) : [...f.categories, c];
      return { ...f, categories, category: categories[0] || "Networking" };
    });
  }
  const [saved, setSaved] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaved(true);
    setTimeout(() => router.push("/"), 800);
  }

  return (
    <div className="page">
      <h2>Submit an Event (free listing)</h2>
      <p className="sub" style={{ marginBottom: 16 }}>
        Prototype only — no moderation queue, no image upload yet. Writes
        straight to the mock event list.
      </p>
      <form className="event-form" onSubmit={submit}>
        <label>
          Event Title
          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </label>
        <label>
          Hosted By
          <input
            value={form.hostedBy}
            onChange={(e) => update("hostedBy", e.target.value)}
          />
        </label>
        <label>
          Date
          <input
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
          />
        </label>
        <label>
          Time
          <input
            placeholder="18:00-21:00"
            value={form.time}
            onChange={(e) => update("time", e.target.value)}
          />
        </label>
        <label>
          City
          <input value={form.city} onChange={(e) => update("city", e.target.value)} />
        </label>
        <label>
          Type
          <select value={form.type} onChange={(e) => update("type", e.target.value)}>
            <option>In Person</option>
            <option>Online</option>
          </select>
        </label>
        {form.type !== "Online" && (
          <label>
            Region
            <select value={form.region} onChange={(e) => update("region", e.target.value)}>
              {REGION_GROUPS.map((g) => (
                <optgroup key={g.group} label={g.group}>
                  {g.options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        )}
        <div>
          <label>Categories <span className="sub">(select all that apply)</span></label>
          <div className="cats-grid">
            {CATEGORY_GROUPS.map((g) => (
              <div key={g.group} style={{ display: "contents" }}>
                <div className="cats-group-title">{g.group}</div>
                {g.options.map((c) => (
                  <label key={c}>
                    <input type="checkbox" checked={form.categories.includes(c)} onChange={() => toggleCat(c)} /> {c}
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>
        <label>
          Cost (as shown to attendees)
          <input value={form.cost} onChange={(e) => update("cost", e.target.value)} />
        </label>
        <label>
          Lowest ticket price in $ (used by the Cost filter)
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => update("price", Number(e.target.value))}
          />
        </label>
        <button className="btn" type="submit">
          Submit to Master Calendar
        </button>
        {saved && <div className="hint">Saved — redirecting to Super Calendar…</div>}
      </form>
    </div>
  );
}
