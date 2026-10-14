import Link from "next/link";
import Reveal from "./Reveal";

export function SaleBanner() {
  return (
    <section className="section section--tight">
      <div className="container">
        <Reveal>
          <div className="promo promo--dark">
            <p className="micro">Limited time</p>
            <h2 className="h2">Winter Sale — Up to 40% off</h2>
            <p>Selected coats, knitwear and tailoring. While stocks last.</p>
            <Link href="/women?sort=price-asc" className="btn btn--light">Shop the sale</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function ShippingBanner() {
  return (
    <section className="section section--tight">
      <div className="container">
        <Reveal>
          <div className="promo promo--light">
            <div>
              <p className="micro">Delivery</p>
              <h2 className="h3">Free shipping over $75</h2>
            </div>
            <p>Complimentary worldwide delivery and 30-day returns on every order.</p>
            <Link href="/men" className="btn btn--outline">Start shopping</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

