import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="container prose" style={{ paddingBlock: "clamp(2rem, 5vw, 4rem)" }}>
      <p className="micro">Get in touch</p>
      <h1 className="h1">Contact</h1>
      <p>Our client care team is available {settings.contact_hours || "Monday to Friday, 9am – 6pm"}.</p>
      <p>
        <strong>Email:</strong> {settings.contact_email || "care@velour.example"}
        <br />
        <strong>Phone:</strong> {settings.contact_phone || "+1 (555) 010-2030"}
        <br />
        <strong>Studio:</strong> {settings.contact_address || "12 Atelier Row, New York, NY"}
      </p>
      <p>Shipping is free worldwide on orders over $75, and returns are free within 30 days.</p>
    </div>
  );
}
