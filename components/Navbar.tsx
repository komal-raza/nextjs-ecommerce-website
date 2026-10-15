"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [announcement, setAnnouncement] = useState("Free worldwide shipping on orders over $75");
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Live suggestions via the service layer (lib/api.ts).
  useEffect(() => {
    let cancelled = false;
    getProducts({ query: q, limit: 5 }).then((res) => {
      if (!cancelled) setSuggestions(q.trim() ? res : []);
    });
    return () => {
      cancelled = true;
    };
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
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

        <Link href="/" className="logo" aria-label="VELOUR home">VELOUR</Link>

        <div className="nav__actions">
          <button className="icon-btn" aria-label="Search" onClick={() => setSearchOpen(true)}>
            <SearchIcon />
          </button>
          <Link
            href={user ? "/profile" : "/login"}
            className={`icon-btn nav__account ${user ? "is-signed-in" : ""}`}
            aria-label={user ? "Profile" : "Account"}
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

      {/* Mobile drawer */}
      <div className={`drawer ${drawer ? "is-open" : ""}`} aria-hidden={!drawer}>
        <div className="drawer__scrim" onClick={() => setDrawer(false)} />
        <aside className="drawer__panel">
          <div className="drawer__head">
            <span className="logo">VELOUR</span>
            <button className="icon-btn" aria-label="Close menu" onClick={() => setDrawer(false)}>
              <CloseIcon />
            </button>
          </div>
          <nav className="drawer__links">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setDrawer(false)}>{l.label}</Link>
            ))}
            <Link href={user ? "/profile" : "/login"} onClick={() => setDrawer(false)}>
              {user ? "Profile" : "Account"}
            </Link>
            <Link href="/cart" onClick={() => setDrawer(false)}>Cart ({count})</Link>
          </nav>
          <div className="drawer__foot">
            <Link href="/about" onClick={() => setDrawer(false)}>About</Link>
            <Link href="/contact" onClick={() => setDrawer(false)}>Contact</Link>
          </div>
        </aside>
      </div>

      {/* Full-screen search overlay */}
      <div className={`search ${searchOpen ? "is-open" : ""}`} aria-hidden={!searchOpen}>
        <button className="icon-btn search__close" aria-label="Close search" onClick={() => setSearchOpen(false)}>
          <CloseIcon size={26} />
        </button>
        <form className="search__form container" onSubmit={submit}>
          <label className="micro" htmlFor="site-search">Search VELOUR</label>
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
    </header>
  );
}

