import Link from "next/link";
import {
  FacebookIcon,
  InstagramIcon,
  PinterestIcon,
  XIcon,
  YoutubeIcon,
} from "./Icons";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Link href="/" className="logo logo--footer">VELOUR</Link>
          <p>
            Premium essentials for men and women. Natural fabrics, timeless silhouettes and
            considered craft — designed to be worn for years, not seasons.
          </p>
          <div className="socials">
            <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer"><InstagramIcon /></a>
            <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer"><FacebookIcon /></a>
            <a href="https://pinterest.com" aria-label="Pinterest" target="_blank" rel="noreferrer"><PinterestIcon /></a>
            <a href="https://x.com" aria-label="X" target="_blank" rel="noreferrer"><XIcon /></a>
            <a href="https://youtube.com" aria-label="YouTube" target="_blank" rel="noreferrer"><YoutubeIcon /></a>
          </div>
        </div>

        <nav className="footer__col" aria-label="Shop">
          <h4 className="micro">Shop</h4>
          <Link href="/women">Women</Link>
          <Link href="/men">Men</Link>
          <Link href="/women?sort=newest">New Arrivals</Link>
          <Link href="/search?q=coat">Coats</Link>
        </nav>

        <nav className="footer__col" aria-label="Company">
          <h4 className="micro">Company</h4>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/login">Account</Link>
        </nav>

        <nav className="footer__col" aria-label="Support and legal">
          <h4 className="micro">Support &amp; Legal</h4>
          <Link href="/contact">Shipping &amp; Returns</Link>
          <Link href="/contact">Help Centre</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </nav>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} VELOUR. All rights reserved.</span>
        <span>Demo store — no real orders are processed.</span>
      </div>
    </footer>
  );
}

