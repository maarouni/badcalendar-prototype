"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const USER_KEY = "mc_user_v1";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState("signup"); // "signup" | "login"
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function isEmail(v) {
    return v.includes("@");
  }

  function isPhone(v) {
    return /^[0-9()+\-\s]{7,}$/.test(v);
  }

  function submit(e) {
    e.preventDefault();
    setError("");

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!identifier.trim()) {
      setError("Enter an email address or a mobile number — either works.");
      return;
    }
    if (!isEmail(identifier) && !isPhone(identifier)) {
      setError("That doesn't look like an email or a phone number.");
      return;
    }
    if (!password || password.length < 4) {
      setError("Password must be at least 4 characters (prototype — no real security here).");
      return;
    }

    const user = {
      name: name.trim() || identifier.split("@")[0],
      identifier: identifier.trim(),
      method: isEmail(identifier) ? "email" : "mobile",
      joined: new Date().toISOString(),
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("mc-auth-changed"));
    router.push("/profile");
  }

  return (
    <div className="page">
      <div className="auth-wrap">
        <div className="auth-card">
          <h1 className="auth-title">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="auth-sub">
            {mode === "signup"
              ? "Registration is optional to browse — you only need this to save events, get notifications, or submit your own."
              : "Log in to see your calendar and settings."}
          </p>

          <div className="auth-tabs">
            <button
              type="button"
              className={mode === "signup" ? "auth-tab active" : "auth-tab"}
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
            <button
              type="button"
              className={mode === "login" ? "auth-tab active" : "auth-tab"}
              onClick={() => setMode("login")}
            >
              Log in
            </button>
          </div>

          <form onSubmit={submit} className="auth-form">
            {mode === "signup" && (
              <label className="auth-field">
                Full name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masoud Arouni"
                />
              </label>
            )}

            <label className="auth-field">
              Email or mobile number
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com or (925) 555-0100"
              />
            </label>

            <label className="auth-field">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn-primary auth-submit">
              {mode === "signup" ? "Create account" : "Continue"}
            </button>

            <div className="auth-divider"><span>or</span></div>

            <button
              type="button"
              className="btn secondary auth-google"
              title="Google sign-in — not wired up in this prototype"
              disabled
            >
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.35-1.7 3.96-5.5 3.96-3.3 0-6-2.73-6-6.1s2.7-6.1 6-6.1c1.88 0 3.14.8 3.86 1.49l2.63-2.53C16.9 3.02 14.7 2 12 2 6.98 2 2.9 6.1 2.9 11s4.08 9 9.1 9c5.25 0 8.73-3.7 8.73-8.9 0-.6-.07-1.05-.15-1.5H12Z"/></svg>
              Continue with Google
            </button>
          </form>

          <p className="auth-fineprint">
            Prototype only — verification emails/texts, real passwords, and Google
            sign-in aren't wired up yet. This just saves a name + email/mobile to
            this browser so the rest of the app has someone to be signed in as.
          </p>
        </div>
      </div>
    </div>
  );
}
