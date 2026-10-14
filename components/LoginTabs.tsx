"use client";

import { useState } from "react";

/** Sign In / Create Account tabs — UI only, no real auth. */
export default function LoginTabs() {
  const [tab, setTab] = useState<"in" | "up">("in");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="auth">
      <div className="auth__tabs" role="tablist">
        <button role="tab" aria-selected={tab === "in"} className={tab === "in" ? "is-active" : ""} onClick={() => { setTab("in"); setSent(false); }}>Sign In</button>
        <button role="tab" aria-selected={tab === "up"} className={tab === "up" ? "is-active" : ""} onClick={() => { setTab("up"); setSent(false); }}>Create Account</button>
      </div>

      {sent ? (
        <p className="auth__sent">This is a UI demo — authentication isn&apos;t connected yet.</p>
      ) : tab === "in" ? (
        <form onSubmit={onSubmit} className="auth__form" role="tabpanel">
          <div className="field"><label htmlFor="si-email">Email</label><input id="si-email" type="email" required autoComplete="email" /></div>
          <div className="field"><label htmlFor="si-pass">Password</label><input id="si-pass" type="password" required autoComplete="current-password" /></div>
          <a href="#" className="link-underline" onClick={(e) => e.preventDefault()}>Forgot your password?</a>
          <button className="btn btn--dark btn--block" type="submit">Sign In</button>
        </form>
      ) : (
        <form onSubmit={onSubmit} className="auth__form" role="tabpanel">
          <div className="field-row">
            <div className="field"><label htmlFor="su-first">First name</label><input id="su-first" required autoComplete="given-name" /></div>
            <div className="field"><label htmlFor="su-last">Last name</label><input id="su-last" required autoComplete="family-name" /></div>
          </div>
          <div className="field"><label htmlFor="su-email">Email</label><input id="su-email" type="email" required autoComplete="email" /></div>
          <div className="field"><label htmlFor="su-pass">Password</label><input id="su-pass" type="password" required minLength={8} autoComplete="new-password" /></div>
          <label className="check"><input type="checkbox" /> Email me about new arrivals and offers</label>
          <button className="btn btn--dark btn--block" type="submit">Create Account</button>
        </form>
      )}
    </div>
  );
}

