"use client";

import { useEffect, useState } from "react";
import { getClientAuthToken } from "@/lib/insforge";
import { DEFAULT_SITE_SETTINGS, SiteSettings } from "@/lib/settings";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const token = getClientAuthToken();
        const res = await fetch("/api/admin/settings", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (isMounted && res.ok && data.settings) {
          setSettings(data.settings);
        }
      } catch (err: unknown) {
        console.error("Failed to load settings:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field: keyof SiteSettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
    setSuccess(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!settings.announcement_bar.trim()) {
      setError("Announcement bar text is required.");
      return;
    }

    if (!settings.contact_email.trim() || !/^\S+@\S+\.\S+$/.test(settings.contact_email.trim())) {
      setError("A valid contact email address is required.");
      return;
    }

    const socialUrls = [
      { name: "Instagram", url: settings.social_instagram },
      { name: "X / Twitter", url: settings.social_x },
      { name: "Pinterest", url: settings.social_pinterest },
      { name: "Facebook", url: settings.social_facebook },
      { name: "YouTube", url: settings.social_youtube },
    ];

    for (const item of socialUrls) {
      if (item.url && item.url.trim()) {
        try {
          const parsed = new URL(item.url.trim());
          if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            throw new Error();
          }
        } catch {
          setError(`Invalid URL for ${item.name}. Please enter a valid web link starting with https://`);
          return;
        }
      }
    }

    setSaving(true);

    try {
      const token = getClientAuthToken();
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update settings.");
      }

      setSuccess("Website content settings have been saved and applied!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", color: "var(--ink-soft)" }}>
        <p className="micro">Loading website content settings…</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px" }}>
      <header style={{ marginBottom: "2rem" }}>
        <p className="micro" style={{ letterSpacing: "0.15em", color: "var(--ink-soft)" }}>
          STOREFRONT CONTENT
        </p>
        <h1 className="h2" style={{ marginBlock: "0.25rem 0.5rem" }}>
          Website Settings
        </h1>
        <p style={{ fontSize: "14px", color: "var(--ink-soft)", margin: 0 }}>
          Manage sitewide messages, announcement bar, delivery promotions, contact details, and social links.
        </p>
      </header>

      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            padding: "0.9rem 1.25rem",
            fontSize: "13px",
            marginBottom: "1.5rem",
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#15803d",
            padding: "0.9rem 1.25rem",
            fontSize: "13px",
            marginBottom: "1.5rem",
          }}
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: "grid", gap: "2rem" }}>
        {/* 1. Header & Announcement Bar */}
        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--line)",
            padding: "1.75rem",
          }}
        >
          <h2 className="h3" style={{ marginTop: 0, marginBottom: "0.4rem" }}>
            Announcement Bar
          </h2>
          <p style={{ fontSize: "13px", color: "var(--ink-soft)", marginBottom: "1.25rem" }}>
            Displays at the very top of every page across the website.
          </p>

          <div className="field">
            <label htmlFor="announcement_bar">Announcement Message *</label>
            <input
              id="announcement_bar"
              type="text"
              value={settings.announcement_bar}
              onChange={(e) => handleChange("announcement_bar", e.target.value)}
              placeholder="e.g. Free worldwide shipping on orders over $75"
              required
            />
          </div>
        </div>

        {/* 2. Promotional & Shipping Banners */}
        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--line)",
            padding: "1.75rem",
          }}
        >
          <h2 className="h3" style={{ marginTop: 0, marginBottom: "0.4rem" }}>
            Promotional &amp; Shipping Banners
          </h2>
          <p style={{ fontSize: "13px", color: "var(--ink-soft)", marginBottom: "1.25rem" }}>
            Customize the promotional blocks displayed on the homepage.
          </p>

          <div style={{ display: "grid", gap: "1.5rem" }}>
            {/* Shipping Banner */}
            <div style={{ padding: "1.2rem", background: "var(--bg-alt)", border: "1px solid var(--line)" }}>
              <span className="micro" style={{ fontWeight: 600, color: "var(--ink)" }}>
                Shipping Promo Banner
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", marginTop: "0.75rem" }}>
                <div className="field">
                  <label htmlFor="ship_eyebrow">Eyebrow</label>
                  <input
                    id="ship_eyebrow"
                    type="text"
                    value={settings.shipping_banner_eyebrow}
                    onChange={(e) => handleChange("shipping_banner_eyebrow", e.target.value)}
                    placeholder="Delivery"
                  />
                </div>
                <div className="field">
                  <label htmlFor="ship_title">Headline</label>
                  <input
                    id="ship_title"
                    type="text"
                    value={settings.shipping_banner_title}
                    onChange={(e) => handleChange("shipping_banner_title", e.target.value)}
                    placeholder="Free shipping over $75"
                  />
                </div>
              </div>
              <div className="field" style={{ marginTop: "0.75rem" }}>
                <label htmlFor="ship_text">Description Text</label>
                <textarea
                  id="ship_text"
                  rows={2}
                  value={settings.shipping_banner_text}
                  onChange={(e) => handleChange("shipping_banner_text", e.target.value)}
                  placeholder="Complimentary worldwide delivery and 30-day returns on every order."
                  style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--line)", fontSize: "13px" }}
                />
              </div>
            </div>

            {/* Sale Banner */}
            <div style={{ padding: "1.2rem", background: "var(--bg-alt)", border: "1px solid var(--line)" }}>
              <span className="micro" style={{ fontWeight: 600, color: "var(--ink)" }}>
                Sale Banner
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", marginTop: "0.75rem" }}>
                <div className="field">
                  <label htmlFor="sale_eyebrow">Eyebrow</label>
                  <input
                    id="sale_eyebrow"
                    type="text"
                    value={settings.sale_banner_eyebrow}
                    onChange={(e) => handleChange("sale_banner_eyebrow", e.target.value)}
                    placeholder="Limited time"
                  />
                </div>
                <div className="field">
                  <label htmlFor="sale_title">Headline</label>
                  <input
                    id="sale_title"
                    type="text"
                    value={settings.sale_banner_title}
                    onChange={(e) => handleChange("sale_banner_title", e.target.value)}
                    placeholder="Winter Sale — Up to 40% off"
                  />
                </div>
              </div>
              <div className="field" style={{ marginTop: "0.75rem" }}>
                <label htmlFor="sale_text">Description Text</label>
                <textarea
                  id="sale_text"
                  rows={2}
                  value={settings.sale_banner_text}
                  onChange={(e) => handleChange("sale_banner_text", e.target.value)}
                  placeholder="Selected coats, knitwear and tailoring. While stocks last."
                  style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--line)", fontSize: "13px" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Contact Information */}
        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--line)",
            padding: "1.75rem",
          }}
        >
          <h2 className="h3" style={{ marginTop: 0, marginBottom: "0.4rem" }}>
            Contact &amp; Client Care
          </h2>
          <p style={{ fontSize: "13px", color: "var(--ink-soft)", marginBottom: "1.25rem" }}>
            Customer support details displayed on the /contact page and legal footers.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="field">
              <label htmlFor="contact_email">Support Email *</label>
              <input
                id="contact_email"
                type="email"
                value={settings.contact_email}
                onChange={(e) => handleChange("contact_email", e.target.value)}
                placeholder="care@velour.example"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="contact_phone">Support Phone</label>
              <input
                id="contact_phone"
                type="text"
                value={settings.contact_phone}
                onChange={(e) => handleChange("contact_phone", e.target.value)}
                placeholder="+1 (555) 010-2030"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <div className="field">
              <label htmlFor="contact_address">Studio Address</label>
              <input
                id="contact_address"
                type="text"
                value={settings.contact_address}
                onChange={(e) => handleChange("contact_address", e.target.value)}
                placeholder="12 Atelier Row, New York, NY"
              />
            </div>
            <div className="field">
              <label htmlFor="contact_hours">Operating Hours</label>
              <input
                id="contact_hours"
                type="text"
                value={settings.contact_hours}
                onChange={(e) => handleChange("contact_hours", e.target.value)}
                placeholder="Monday to Friday, 9am – 6pm"
              />
            </div>
          </div>
        </div>

        {/* 4. Social Media Links */}
        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--line)",
            padding: "1.75rem",
          }}
        >
          <h2 className="h3" style={{ marginTop: 0, marginBottom: "0.4rem" }}>
            Social Media Links
          </h2>
          <p style={{ fontSize: "13px", color: "var(--ink-soft)", marginBottom: "1.25rem" }}>
            External brand profile links displayed in the footer.
          </p>

          <div style={{ display: "grid", gap: "1rem" }}>
            <div className="field">
              <label htmlFor="social_instagram">Instagram Profile URL</label>
              <input
                id="social_instagram"
                type="url"
                value={settings.social_instagram}
                onChange={(e) => handleChange("social_instagram", e.target.value)}
                placeholder="https://instagram.com/velour"
              />
            </div>

            <div className="field">
              <label htmlFor="social_x">X / Twitter Profile URL</label>
              <input
                id="social_x"
                type="url"
                value={settings.social_x}
                onChange={(e) => handleChange("social_x", e.target.value)}
                placeholder="https://x.com/velour"
              />
            </div>

            <div className="field">
              <label htmlFor="social_pinterest">Pinterest Profile URL</label>
              <input
                id="social_pinterest"
                type="url"
                value={settings.social_pinterest}
                onChange={(e) => handleChange("social_pinterest", e.target.value)}
                placeholder="https://pinterest.com/velour"
              />
            </div>

            <div className="field">
              <label htmlFor="social_facebook">Facebook Page URL</label>
              <input
                id="social_facebook"
                type="url"
                value={settings.social_facebook}
                onChange={(e) => handleChange("social_facebook", e.target.value)}
                placeholder="https://facebook.com/velour"
              />
            </div>

            <div className="field">
              <label htmlFor="social_youtube">YouTube Channel URL</label>
              <input
                id="social_youtube"
                type="url"
                value={settings.social_youtube}
                onChange={(e) => handleChange("social_youtube", e.target.value)}
                placeholder="https://youtube.com/@velour"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
          <button
            type="submit"
            className="btn btn--dark"
            disabled={saving}
            style={{ padding: "0.9rem 2.2rem" }}
          >
            {saving ? "Saving Changes…" : "Save Website Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

