import Link from "next/link";
import Reveal from "./Reveal";
import type { SiteSettings } from "@/lib/settings";

export function SaleBanner({ settings }: { settings?: Partial<SiteSettings> }) {
  const eyebrow = settings?.sale_banner_eyebrow || "Limited time";
  const title = settings?.sale_banner_title || "Winter Sale — Up to 40% off";
  const text = settings?.sale_banner_text || "Selected coats, knitwear and tailoring. While stocks last.";

  return (
    <section className="section section--tight">
      <div className="container">
        <Reveal>
          <div className="promo promo--dark">
            <p className="micro">{eyebrow}</p>
            <h2 className="h2">{title}</h2>
            <p>{text}</p>
            <Link href="/women?sort=price-asc" className="btn btn--light">
              Shop the sale
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function ShippingBanner({ settings }: { settings?: Partial<SiteSettings> }) {
  const eyebrow = settings?.shipping_banner_eyebrow || "Delivery";
  const title = settings?.shipping_banner_title || "Free shipping over $75";
  const text = settings?.shipping_banner_text || "Complimentary worldwide delivery and 30-day returns on every order.";

  return (
    <section className="section section--tight">
      <div className="container">
        <Reveal>
          <div className="promo promo--light">
            <div>
              <p className="micro">{eyebrow}</p>
              <h2 className="h3">{title}</h2>
            </div>
            <p>{text}</p>
            <Link href="/men" className="btn btn--outline">
              Start shopping
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
