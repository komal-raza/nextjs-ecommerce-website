import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin";
import { getInsforgeAdmin } from "@/lib/insforge";
import { DEFAULT_SITE_SETTINGS, getSiteSettings, SiteSettings } from "@/lib/settings";

function isValidUrl(urlStr: string): boolean {
  if (!urlStr) return true;
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidEmail(emailStr: string): boolean {
  if (!emailStr) return false;
  return /^\S+@\S+\.\S+$/.test(emailStr.trim());
}

export async function GET(req: NextRequest) {
  const { error, status } = await verifyAdmin(req);
  if (error) {
    return NextResponse.json({ error }, { status: status || 401 });
  }

  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function POST(req: NextRequest) {
  const { error, status } = await verifyAdmin(req);
  if (error) {
    return NextResponse.json({ error }, { status: status || 401 });
  }

  try {
    const body = await req.json();

    // Validation
    const announcement_bar = String(body.announcement_bar || "").trim();
    if (!announcement_bar) {
      return NextResponse.json(
        { error: "Announcement bar text cannot be empty." },
        { status: 400 }
      );
    }

    const contact_email = String(body.contact_email || "").trim();
    if (!isValidEmail(contact_email)) {
      return NextResponse.json(
        { error: "A valid contact email address is required." },
        { status: 400 }
      );
    }

    // Validate social URLs
    const socialFields: Array<keyof SiteSettings> = [
      "social_instagram",
      "social_facebook",
      "social_pinterest",
      "social_x",
      "social_youtube",
    ];

    for (const field of socialFields) {
      const val = String(body[field] || "").trim();
      if (val && !isValidUrl(val)) {
        return NextResponse.json(
          { error: `Invalid URL format for ${field.replace("social_", "").toUpperCase()}. Must begin with http:// or https://` },
          { status: 400 }
        );
      }
    }

    const cleanSettings: SiteSettings = {
      announcement_bar,
      shipping_banner_eyebrow: String(body.shipping_banner_eyebrow || DEFAULT_SITE_SETTINGS.shipping_banner_eyebrow).trim(),
      shipping_banner_title: String(body.shipping_banner_title || DEFAULT_SITE_SETTINGS.shipping_banner_title).trim(),
      shipping_banner_text: String(body.shipping_banner_text || DEFAULT_SITE_SETTINGS.shipping_banner_text).trim(),
      sale_banner_eyebrow: String(body.sale_banner_eyebrow || DEFAULT_SITE_SETTINGS.sale_banner_eyebrow).trim(),
      sale_banner_title: String(body.sale_banner_title || DEFAULT_SITE_SETTINGS.sale_banner_title).trim(),
      sale_banner_text: String(body.sale_banner_text || DEFAULT_SITE_SETTINGS.sale_banner_text).trim(),
      contact_email,
      contact_phone: String(body.contact_phone || "").trim(),
      contact_address: String(body.contact_address || "").trim(),
      contact_hours: String(body.contact_hours || "").trim(),
      social_instagram: String(body.social_instagram || "").trim(),
      social_facebook: String(body.social_facebook || "").trim(),
      social_pinterest: String(body.social_pinterest || "").trim(),
      social_x: String(body.social_x || "").trim(),
      social_youtube: String(body.social_youtube || "").trim(),
    };

    const admin = getInsforgeAdmin();
    const { data: updated, error: dbErr } = await admin.database
      .from("site_settings")
      .upsert({
        key: "general",
        value: cleanSettings,
        updated_at: new Date().toISOString(),
      })
      .select("key, value")
      .single();

    if (dbErr) {
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      settings: updated.value,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

