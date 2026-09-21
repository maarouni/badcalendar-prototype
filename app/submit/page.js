"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubmitEvent() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    hostedBy: "",
    date: "",
    time: "",
    city: "",
    type: "In Person",
    category: "Networking",
    cost: "Free",
  });
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
        <label>
          Category
          <input
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          />
        </label>
        <label>
          Cost
          <input value={form.cost} onChange={(e) => update("cost", e.target.value)} />
        </label>
        <button className="btn" type="submit">
          Submit to Master Calendar
        </button>
        {saved && <div className="hint">Saved — redirecting to Super Calendar…</div>}
      </form>
    </div>
  );
}
