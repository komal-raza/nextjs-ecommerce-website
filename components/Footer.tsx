import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import {
  FacebookIcon,
  InstagramIcon,
  PinterestIcon,
  XIcon,
  YoutubeIcon,
} from "./Icons";

export default async function Footer() {
  const settings = await getSiteSettings();

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
            {settings.social_instagram && (
              <a href={settings.social_instagram} aria-label="Instagram" target="_blank" rel="noreferrer">
                <InstagramIcon />
              </a>
            )}
            {settings.social_facebook && (
              <a href={settings.social_facebook} aria-label="Facebook" target="_blank" rel="noreferrer">
                <FacebookIcon />
              </a>
            )}
            {settings.social_pinterest && (
              <a href={settings.social_pinterest} aria-label="Pinterest" target="_blank" rel="noreferrer">
                <PinterestIcon />
              </a>
            )}
            {settings.social_x && (
              <a href={settings.social_x} aria-label="X" target="_blank" rel="noreferrer">
                <XIcon />
              </a>
            )}
            {settings.social_youtube && (
              <a href={settings.social_youtube} aria-label="YouTube" target="_blank" rel="noreferrer">
                <YoutubeIcon />
              </a>
            )}
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
