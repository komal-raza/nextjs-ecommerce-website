"use client";

import { useEffect, useState } from "react";

/**
 * Minimalist luxury loading indicator that provides instant visual feedback
 * during route transitions and initial asset buffering.
 */
export default function PageLoader() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Dismiss the initial poster loading screen smoothly once hydrated
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`app-loader ${!loading ? "is-complete" : ""}`}
      aria-hidden="true"
    >
      <div className="app-loader__bar" />
    </div>
  );
}

