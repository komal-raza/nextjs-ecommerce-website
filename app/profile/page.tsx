"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { money } from "@/lib/format";
import { insforge } from "@/lib/insforge";

interface OrderItemSnapshot {
  id: string;
  name: string;
  size: string;
  qty: number;
  price: number;
}

interface OrderRecord {
  id: string;
  user_id: string;
  items: OrderItemSnapshot[];
  subtotal: number | string;
  shipping: number | string;
  total: number | string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | string;
  payment_status?: "paid" | "unpaid" | string;
  payment_method?: string;
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  shipping_address?: {
    address?: string;
    city?: string;
    zip?: string;
    country?: string;
  };
  payment_receipt_url?: string | null;
  created_at: string;
}

const ORDER_STEPS = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function StatusTracker({ currentStatus }: { currentStatus: string }) {
  const normStatus = (currentStatus || "pending").toLowerCase();
  const currentIndex = ORDER_STEPS.findIndex((s) => s.key === normStatus);
  const activeIdx = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="status-tracker" style={{ marginBlock: "1.5rem 1rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${ORDER_STEPS.length}, 1fr)`,
          position: "relative",
          gap: "0.5rem",
        }}
      >
        {ORDER_STEPS.map((step, idx) => {
          const isDone = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div
              key={step.key}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "3px",
                  backgroundColor: isDone || isCurrent ? "var(--ink)" : "var(--line)",
                  marginBottom: "0.6rem",
                  transition: "background-color 0.3s ease",
                }}
              />
              <span
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: isCurrent ? 600 : 400,
                  color: isCurrent
                    ? "var(--ink)"
                    : isDone
                    ? "var(--ink-soft)"
                    : "var(--stone)",
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [signingOut, setSigningOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    insforge.auth.getCurrentUser().then(async ({ data, error }) => {
      if (!isMounted) return;
      if (error || !data?.user) {
        router.replace("/login");
        return;
      }

      setUser(data.user);

      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "razaa.komal@gmail.com";
      if (data.user?.email && data.user.email.toLowerCase() === adminEmail.toLowerCase()) {
        setIsAdmin(true);
      }

      // Fetch user's orders
      const { data: orderData, error: orderErr } = await insforge.database
        .from("orders")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false });

      if (isMounted) {
        if (!orderErr && orderData) {
          setOrders(orderData as unknown as OrderRecord[]);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await insforge.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="container page-head" style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <p className="micro">Loading your account…</p>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingBlock: "clamp(2.5rem, 5vw, 4rem)" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "1.5rem",
          paddingBottom: "2rem",
          borderBottom: "1px solid var(--line)",
          marginBottom: "3rem",
        }}
      >
        <div>
          <p className="micro">Account Overview</p>
          <h1 className="h1" style={{ marginBlock: "0.3rem 0.5rem" }}>
            My Account
          </h1>
          <p style={{ color: "var(--ink-soft)", fontSize: "14px" }}>
            Signed in as <strong>{user?.email}</strong>
          </p>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="btn btn--outline"
          style={{ padding: "0.6rem 1.4rem" }}
        >
          {signingOut ? "Signing out…" : "Sign Out"}
        </button>
      </header>

      {isAdmin && (
        <div
          style={{
            background: "var(--ink)",
            color: "#ffffff",
            padding: "1.25rem 1.5rem",
            marginBottom: "2.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            borderRadius: "2px",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-block",
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 700,
                background: "rgba(255,255,255,0.2)",
                padding: "0.2rem 0.5rem",
                marginBottom: "0.4rem",
                borderRadius: "2px",
              }}
            >
              Verified Store Owner
            </span>
            <h3 style={{ margin: 0, fontSize: "16px", color: "#ffffff", fontWeight: 500 }}>
              Store Management Dashboard
            </h3>
            <p style={{ margin: "0.25rem 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
              Manage product listings, pricing, and live website content.
            </p>
          </div>
          <Link
            href="/admin"
            style={{
              background: "#ffffff",
              color: "var(--ink)",
              padding: "0.6rem 1.25rem",
              fontSize: "12px",
              fontWeight: 600,
              textDecoration: "none",
              letterSpacing: "0.05em",
              borderRadius: "2px",
            }}
          >
            Open Dashboard &rarr;
          </Link>
        </div>
      )}

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.5rem" }}>
          <h2 className="h3">Order History</h2>
          <span className="micro" style={{ color: "var(--stone)" }}>
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </span>
        </div>

        {orders.length === 0 ? (
          <div
            style={{
              padding: "4rem 2rem",
              textAlign: "center",
              background: "var(--bg-alt)",
              border: "1px solid var(--line)",
            }}
          >
            <p className="h3" style={{ marginBottom: "0.5rem" }}>No orders yet</p>
            <p style={{ color: "var(--ink-soft)", fontSize: "14px", marginBottom: "1.5rem" }}>
              When you place an order, its details and delivery status will appear here.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <Link href="/women" className="btn btn--dark">Shop Women</Link>
              <Link href="/men" className="btn btn--outline">Shop Men</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "2rem" }}>
            {orders.map((ord) => {
              const dateStr = ord.created_at
                ? new Date(ord.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Recent";

              const isPaid = ord.payment_status === "paid";
              const isUnpaid = !isPaid && (ord.payment_status === "unpaid" || ord.status === "pending");

              return (
                <article
                  key={ord.id}
                  style={{
                    background: "var(--white)",
                    border: "1px solid var(--line)",
                    padding: "clamp(1.2rem, 3vw, 2rem)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "1rem",
                      paddingBottom: "1.2rem",
                      borderBottom: "1px solid var(--line)",
                    }}
                  >
                    <div>
                      <p className="micro" style={{ color: "var(--stone)" }}>
                        Order ID
                      </p>
                      <p style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: 600 }}>
                        {ord.id}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "flex-start" }}>
                      <div>
                        <p className="micro" style={{ color: "var(--stone)" }}>Date</p>
                        <p style={{ fontSize: "13px" }}>{dateStr}</p>
                      </div>

                      <div>
                        <p className="micro" style={{ color: "var(--stone)" }}>Payment</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.2rem" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "0.15rem 0.5rem",
                              borderRadius: "2px",
                              fontSize: "11px",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              backgroundColor: isPaid ? "#dcfce7" : "#fef3c7",
                              color: isPaid ? "#15803d" : "#b45309",
                            }}
                          >
                            {isPaid ? "Paid" : "Unpaid"}
                          </span>
                          <span className="micro" style={{ color: "var(--ink-soft)" }}>
                            ({ord.payment_method || "Stripe"})
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="micro" style={{ color: "var(--stone)" }}>Total</p>
                        <p style={{ fontSize: "13px", fontWeight: 600 }}>{money(Number(ord.total))}</p>
                      </div>

                      {isUnpaid && (
                        <div style={{ alignSelf: "center" }}>
                          <Link
                            href={`/payment/${ord.id}`}
                            className="btn btn--dark"
                            style={{ padding: "0.45rem 1rem", fontSize: "12px" }}
                          >
                            Pay Now &rarr;
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status tracker: Pending -> Confirmed -> Shipped -> Delivered */}
                  <StatusTracker currentStatus={ord.status} />

                  {/* Items snapshot */}
                  <div style={{ marginTop: "1.5rem" }}>
                    <p className="micro" style={{ color: "var(--stone)", marginBottom: "0.75rem" }}>
                      Items
                    </p>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
                      {(ord.items || []).map((item, idx) => (
                        <li
                          key={idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "13px",
                            paddingBlock: "0.4rem",
                            borderBottom: "1px dashed var(--line)",
                          }}
                        >
                          <span>
                            <strong>{item.name}</strong> · Size {item.size} × {item.qty}
                          </span>
                          <span>{money(item.price * item.qty)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Shipping address summary */}
                  {ord.shipping_address && (
                    <div style={{ marginTop: "1rem", fontSize: "12px", color: "var(--ink-soft)" }}>
                      Ship to: {ord.contact?.name || "Customer"}, {ord.shipping_address.address},{" "}
                      {ord.shipping_address.city}, {ord.shipping_address.zip},{" "}
                      {ord.shipping_address.country}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
