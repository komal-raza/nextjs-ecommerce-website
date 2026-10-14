import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container prose">
      <p className="micro">Get in touch</p>
      <h1 className="h1">Contact</h1>
      <p>Our client care team is available Monday to Friday, 9am – 6pm.</p>
      <p><strong>Email:</strong> care@velour.example<br /><strong>Phone:</strong> +1 (555) 010-2030<br /><strong>Studio:</strong> 12 Atelier Row, New York, NY</p>
      <p>Shipping is free worldwide on orders over $75, and returns are free within 30 days.</p>
    </div>
  );
}

