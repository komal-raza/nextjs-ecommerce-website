"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getClientAuthToken, insforge } from "@/lib/insforge";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [adminUser, setAdminUser] = useState<{ id: string; email?: string } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const { data: userData } = await insforge.auth.getCurrentUser();
        if (!isMounted) return;

        if (!userData?.user) {
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        const token = getClientAuthToken();
        const res = await fetch("/api/admin/check", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const checkData = await res.json();
        if (!isMounted) return;

        if (res.ok && checkData.isAdmin) {
          setAdminUser(checkData.user);
          setAuthorized(true);
        } else {
          setAuthorized(false);
          setAuthError(
            checkData.error ||
              "Access restricted. This admin dashboard is only accessible to the verified store owner."
          );
        }
      } catch (err: unknown) {
        if (isMounted) {
          setAuthorized(false);
          setAuthError((err as Error).message || "Authentication check failed.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  const handleSignOut = async () => {
    await insforge.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div
        className="container"
        style={{
          minHeight: "70vh",
          display: "grid",
          placeItems: "center",
          paddingBlock: "4rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p className="micro" style={{ letterSpacing: "0.15em", color: "var(--ink-soft)" }}>
            SECURITY CHECK
          </p>
          <p style={{ marginTop: "0.5rem", fontSize: "14px" }}>Verifying store owner credentials…</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div
        className="container empty-state"
        style={{
          minHeight: "65vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingBlock: "4rem",
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "0.3rem 0.8rem",
            background: "#fee2e2",
            color: "#991b1b",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "1rem",
            borderRadius: "2px",
          }}
        >
          Access Restricted
        </span>
        <h1 className="h2" style={{ marginBottom: "0.5rem" }}>
          Store Owner Only
        </h1>
        <p
          style={{
            color: "var(--ink-soft)",
            maxWidth: "520px",
            marginInline: "auto",
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          {authError ||
            "This dashboard is reserved exclusively for the store owner. Your current account does not have store management permissions."}
        </p>
        <div className="empty-state__cta" style={{ marginTop: "2rem" }}>
          <Link href="/" className="btn btn--dark">
            Return to Store
          </Link>
          <Link href="/login?redirect=/admin" className="btn btn--outline">
            Switch Account
          </Link>
        </div>
      </div>
    );
  }

  const isProducts = pathname === "/admin" || pathname.startsWith("/admin/products");
  const isSettings = pathname === "/admin/settings";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Admin Top Navigation */}
      <header
        style={{
          background: "var(--ink)",
          color: "var(--bg)",
          paddingBlock: "1rem",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <Link
              href="/admin"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.3rem",
                letterSpacing: "0.18em",
                fontWeight: 600,
                color: "#ffffff",
                textDecoration: "none",
              }}
            >
              ELUARA
            </Link>
            <span
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                padding: "0.2rem 0.5rem",
                borderRadius: "2px",
                textTransform: "uppercase",
              }}
            >
              Store Owner
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
              {adminUser?.email}
            </span>
            <Link
              href="/"
              target="_blank"
              style={{
                color: "#ffffff",
                fontSize: "13px",
                textDecoration: "none",
                opacity: 0.85,
              }}
            >
              View Store &rarr;
            </Link>
            <button
              onClick={handleSignOut}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#ffffff",
                padding: "0.35rem 0.8rem",
                fontSize: "12px",
                cursor: "pointer",
                borderRadius: "2px",
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Admin 2-Route Tabs */}
      <nav
        style={{
          background: "var(--white)",
          borderBottom: "1px solid var(--line)",
          paddingInline: "1rem",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            gap: "2.5rem",
            alignItems: "center",
          }}
        >
          <Link
            href="/admin"
            style={{
              paddingBlock: "1rem",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: isProducts ? "var(--ink)" : "var(--ink-soft)",
              borderBottom: isProducts ? "2px solid var(--ink)" : "2px solid transparent",
              transition: "all 0.2s ease",
            }}
          >
            1. Products Management
          </Link>
          <Link
            href="/admin/settings"
            style={{
              paddingBlock: "1rem",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: isSettings ? "var(--ink)" : "var(--ink-soft)",
              borderBottom: isSettings ? "2px solid var(--ink)" : "2px solid transparent",
              transition: "all 0.2s ease",
            }}
          >
            2. Website Settings
          </Link>
        </div>
      </nav>

      {/* Admin Content */}
      <main className="container" style={{ paddingBlock: "2.5rem 4rem" }}>
        {children}
      </main>
    </div>
  );
}

