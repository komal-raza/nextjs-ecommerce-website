import { getInsforgeAdmin } from "./insforge";

export interface SiteSettings {
  announcement_bar: string;
  shipping_banner_eyebrow: string;
  shipping_banner_title: string;
  shipping_banner_text: string;
  sale_banner_eyebrow: string;
  sale_banner_title: string;
  sale_banner_text: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  contact_hours: string;
  social_instagram: string;
  social_facebook: string;
  social_pinterest: string;
  social_x: string;
  social_youtube: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  announcement_bar: "Free worldwide shipping on orders over $75",
  shipping_banner_eyebrow: "Delivery",
  shipping_banner_title: "Free shipping over $75",
  shipping_banner_text: "Complimentary worldwide delivery and 30-day returns on every order.",
  sale_banner_eyebrow: "Limited time",
  sale_banner_title: "Winter Sale — Up to 40% off",
  sale_banner_text: "Selected coats, knitwear and tailoring. While stocks last.",
  contact_email: "care@eluara.example",
  contact_phone: "+1 (555) 010-2030",
  contact_address: "12 Atelier Row, New York, NY",
  contact_hours: "Monday to Friday, 9am – 6pm",
  social_instagram: "https://instagram.com",
  social_facebook: "https://facebook.com",
  social_pinterest: "https://pinterest.com",
  social_x: "https://x.com",
  social_youtube: "https://youtube.com",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const admin = getInsforgeAdmin();
    const { data, error } = await admin.database
      .from("site_settings")
      .select("value")
      .eq("key", "general")
      .single();

    if (error || !data?.value) {
      return DEFAULT_SITE_SETTINGS;
    }

    return {
      ...DEFAULT_SITE_SETTINGS,
      ...(data.value as Partial<SiteSettings>),
    };
  } catch (err) {
    console.warn("Notice: could not load site_settings from db, using defaults:", err);
    return DEFAULT_SITE_SETTINGS;
  }
}

