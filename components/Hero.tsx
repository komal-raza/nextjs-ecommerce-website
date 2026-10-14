import Link from "next/link";

/**
 * Full-viewport hero (server component) with a muted, looping, autoplaying video
 * background (`public/videos/hero.mp4`) and a poster-frame fallback.
 */
export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__bg">
        <video
          className="hero__video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/hero-poster.jpg"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="hero__overlay" />
      </div>

      <div className="container hero__content">
        <p className="micro hero__eyebrow anim-in" style={{ animationDelay: "0.2s" }}>
          Autumn / Winter Collection
        </p>
        <h1 className="hero__title">
          <span className="anim-in" style={{ animationDelay: "0.4s" }}>Quiet luxury,</span>
          <span className="anim-in" style={{ animationDelay: "0.6s" }}>
            <em>made to last.</em>
          </span>
        </h1>
        <p className="hero__sub anim-in" style={{ animationDelay: "0.85s" }}>
          Considered essentials in natural fabrics — cut with intention, designed to be worn for years.
        </p>
        <div className="hero__cta anim-in" style={{ animationDelay: "1.05s" }}>
          <Link href="/women" className="btn btn--light">Shop Women</Link>
          <Link href="/men" className="btn btn--ghost-light">Shop Men</Link>
        </div>
      </div>

      <a href="#categories" className="hero__scroll" aria-label="Scroll down">
        <span>Scroll</span>
        <i />
      </a>
    </section>
  );
}
