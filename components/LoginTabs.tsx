"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { insforge } from "@/lib/insforge";

function LoginTabsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/profile";

  const [tab, setTab] = useState<"in" | "up">("in");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sign In state
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");

  // Sign Up state
  const [suFirst, setSuFirst] = useState("");
  const [suLast, setSuLast] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email: siEmail.trim(),
        password: siPassword,
      });

      if (error) {
        setErrorMsg(error.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      router.push(redirectUrl);
      router.refresh();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const fullName = [suFirst.trim(), suLast.trim()].filter(Boolean).join(" ");
      const { data, error } = await insforge.auth.signUp({
        email: suEmail.trim(),
        password: suPassword,
        name: fullName || undefined,
      });

      if (error) {
        setErrorMsg(error.message || "Failed to create account");
        setLoading(false);
        return;
      }

      router.push(redirectUrl);
      router.refresh();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "in"}
          className={tab === "in" ? "is-active" : ""}
          onClick={() => {
            setTab("in");
            setErrorMsg(null);
          }}
        >
          Sign In
        </button>
        <button
          role="tab"
          aria-selected={tab === "up"}
          className={tab === "up" ? "is-active" : ""}
          onClick={() => {
            setTab("up");
            setErrorMsg(null);
          }}
        >
          Create Account
        </button>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "1rem",
            fontSize: "13px",
            color: "#b91c1c",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
          }}
          role="alert"
        >
          {errorMsg}
        </div>
      )}

      {tab === "in" ? (
        <form onSubmit={handleSignIn} className="auth__form" role="tabpanel">
          <div className="field">
            <label htmlFor="si-email">Email</label>
            <input
              id="si-email"
              type="email"
              required
              autoComplete="email"
              value={siEmail}
              onChange={(e) => setSiEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="field">
            <label htmlFor="si-pass">Password</label>
            <input
              id="si-pass"
              type="password"
              required
              autoComplete="current-password"
              value={siPassword}
              onChange={(e) => setSiPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button className="btn btn--dark btn--block" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignUp} className="auth__form" role="tabpanel">
          <div className="field-row">
            <div className="field">
              <label htmlFor="su-first">First name</label>
              <input
                id="su-first"
                required
                autoComplete="given-name"
                value={suFirst}
                onChange={(e) => setSuFirst(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="field">
              <label htmlFor="su-last">Last name</label>
              <input
                id="su-last"
                required
                autoComplete="family-name"
                value={suLast}
                onChange={(e) => setSuLast(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="su-email">Email</label>
            <input
              id="su-email"
              type="email"
              required
              autoComplete="email"
              value={suEmail}
              onChange={(e) => setSuEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="field">
            <label htmlFor="su-pass">Password</label>
            <input
              id="su-pass"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={suPassword}
              onChange={(e) => setSuPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button className="btn btn--dark btn--block" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginTabs() {
  return (
    <Suspense fallback={<div className="auth"><p style={{ padding: "2rem", textAlign: "center" }}>Loading…</p></div>}>
      <LoginTabsContent />
    </Suspense>
  );
}
