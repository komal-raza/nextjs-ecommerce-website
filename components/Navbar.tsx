"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getProducts } from "@/lib/api";
import type { Product } from "@/lib/data";
import { money } from "@/lib/format";
import { insforge } from "@/lib/insforge";
import { useCart } from "@/lib/store";
import { BagIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from "./Icons";
import SafeImage from "./SafeImage";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/women", label: "Women" },
  { href: "/men", label: "Men" },
];

export default function Navbar() {
  const router = useRouter();
  const { count } = useCart();
  const [mounted, setMounted] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [announcement, setAnnouncement] = useState("Free worldwide shipping on orders over $75");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.announcement_bar) {
          setAnnouncement(data.settings.announcement_bar);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    insforge.auth.getCurrentUser().then(({ data }) => {
      setUser(data?.user ?? null);
    });

    const unsubscribe = insforge.auth.onAuthStateChange(() => {
      insforge.auth.getCurrentUser().then(({ data }) => {
        setUser(data?.user ?? null);
      });
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scroll while an overlay is open; Esc closes overlays.
  useEffect(() => {
    document.body.style.overflow = drawer || searchOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawer(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawer, searchOpen]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  // Live suggestions via the server search API
  useEffect(() => {
    const trimmed = q.trim();
    if (!trimmed) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=5`)
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(Array.isArray(data.results) ? data.results : []);
        })
        .catch(() => {
          setSuggestions([]);
        });
    }, 150);

    return () => clearTimeout(timer);
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleSignOut = async () => {
    try {
      await insforge.auth.signOut();
      setUser(null);
      setDrawer(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <header className={`header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="announce">{announcement}</div>
      <div className="container nav">
        <button className="icon-btn nav__burger" aria-label="Open menu" onClick={() => setDrawer(true)}>
          <MenuIcon />
        </button>

        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
        </nav>

        <Link href="/" className="logo" aria-label="ELUARA home">ELUARA</Link>

        <div className="nav__actions">
          <button className="icon-btn" aria-label="Search" onClick={() => setSearchOpen(true)}>
            <SearchIcon />
          </button>
          <Link
            href={user ? "/profile" : "/login"}
            className={`icon-btn nav__account ${user ? "is-signed-in" : ""}`}
            aria-label={user ? "My Profile & Orders" : "Sign In / Register"}
            title={user ? "My Profile & Orders" : "Sign in to save order history"}
            style={{ position: "relative" }}
          >
            <UserIcon />
            {user && (
              <span
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "var(--ink)",
                  boxShadow: "0 0 0 1.5px var(--bg)",
                }}
                aria-hidden="true"
              />
            )}
          </Link>
          <Link href="/cart" className="icon-btn nav__cart" aria-label={`Cart, ${count} items`}>
            <BagIcon />
            {count > 0 && <span className="badge-count">{count}</span>}
          </Link>
        </div>
      </div>

      {/* Portaled overlays: mounted directly to document.body to prevent backdrop-filter containing block entrapment */}
      {mounted && typeof document !== "undefined" && createPortal(
        <>
          {/* Mobile drawer */}
          <div className={`drawer ${drawer ? "is-open" : ""}`} aria-hidden={!drawer}>
            <div className="drawer__scrim" onClick={() => setDrawer(false)} />
            <aside className="drawer__panel">
              <div className="drawer__head">
                <span className="logo">ELUARA</span>
                <button className="icon-btn" aria-label="Close menu" onClick={() => setDrawer(false)}>
                  <CloseIcon />
                </button>
              </div>

              {/* Quick Search inside Drawer */}
              <button
                type="button"
                className="drawer__search-btn"
                onClick={() => {
                  setDrawer(false);
                  setSearchOpen(true);
                }}
              >
                <SearchIcon size={16} />
                <span>Search coats, dresses, knitwear…</span>
              </button>

              <nav className="drawer__links">
                {LINKS.map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setDrawer(false)}>
                    <span>{l.label}</span>
                  </Link>
                ))}
                <Link href="/search" onClick={() => setDrawer(false)}>
                  <span>Search</span>
                </Link>
                <Link href="/cart" onClick={() => setDrawer(false)}>
                  <span>Cart</span>
                  <span className="drawer__badge">{count} {count === 1 ? "item" : "items"}</span>
                </Link>
              </nav>

              {/* Prominent Account / Profile Section for Mobile Users */}
              <div className="drawer__account-box">
                {user ? (
                  <div className="drawer__user-card">
                    <div className="drawer__user-head">
                      <span className="drawer__user-label">Logged In</span>
                      <span className="drawer__user-email">{user.email || "Customer"}</span>
                    </div>
                    <div className="drawer__user-actions">
                      <Link
                        href="/profile"
                        className="btn btn--secondary btn--sm"
                        style={{ width: "100%", justifyContent: "center" }}
                        onClick={() => setDrawer(false)}
                      >
                        My Profile &amp; Orders
                      </Link>
                      <button
                        type="button"
                        className="drawer__signout-btn"
                        onClick={handleSignOut}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="drawer__guest-card">
                    <p className="drawer__guest-title">Save Your Order History</p>
                    <p className="drawer__guest-sub">Sign in or create an account to view and track your orders anytime.</p>
                    <Link
                      href="/login"
                      className="btn btn--primary btn--sm"
                      style={{ width: "100%", justifyContent: "center", marginTop: "0.6rem" }}
                      onClick={() => setDrawer(false)}
                    >
                      Sign In / Register
                    </Link>
                  </div>
                )}
              </div>

              <div className="drawer__foot">
                <div className="drawer__foot-links">
                  <Link href="/about" onClick={() => setDrawer(false)}>About</Link>
                  <Link href="/contact" onClick={() => setDrawer(false)}>Contact</Link>
                  <Link href="/privacy" onClick={() => setDrawer(false)}>Privacy</Link>
                </div>
                <p className="drawer__foot-tagline">Quiet luxury, made to last.</p>
              </div>
            </aside>
          </div>

          {/* Full-screen search overlay */}
          <div className={`search ${searchOpen ? "is-open" : ""}`} aria-hidden={!searchOpen}>
            <button className="icon-btn search__close" aria-label="Close search" onClick={() => setSearchOpen(false)}>
              <CloseIcon size={26} />
            </button>
            <form className="search__form container" onSubmit={submit}>
              <label className="micro" htmlFor="site-search">Search ELUARA</label>
              <input
                id="site-search"
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Coats, knitwear, dresses…"
                autoComplete="off"
                tabIndex={searchOpen ? 0 : -1}
              />
              {suggestions.length > 0 && (
                <ul className="search__results">
                  {suggestions.map((p) => (
                    <li key={p.id}>
                      <Link href={`/product/${p.id}`} onClick={() => setSearchOpen(false)}>
                        <span className="search__thumb"><SafeImage src={p.images[0]} alt="" sizes="56px" /></span>
                        <span className="search__name">{p.name}<small>{p.subcategory} · {p.category}</small></span>
                        <span>{money(p.price)}</span>
                      </Link>
                    </li>
                  ))}
                  <li className="search__all">
                    <button type="submit" className="link-underline">See all results for “{q.trim()}”</button>
                  </li>
                </ul>
              )}
              {q.trim() && suggestions.length === 0 && <p className="search__empty">No matches for “{q.trim()}”.</p>}
            </form>
          </div>
        </>,
        document.body
      )}
    </header>
  );
}

