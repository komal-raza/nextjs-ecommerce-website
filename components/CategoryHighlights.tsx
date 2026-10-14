import Link from "next/link";
import { CATEGORY_IMAGES } from "@/lib/data";
import Reveal from "./Reveal";
import SafeImage from "./SafeImage";

const CARDS = [
  { id: "women" as const, label: "Women", blurb: "Fluid silhouettes & soft tailoring" },
  { id: "men" as const, label: "Men", blurb: "Refined essentials & sharp layers" },
];

export default function CategoryHighlights() {
  return (
    <section className="section" id="categories">
      <div className="container cat-grid">
        {CARDS.map((c, i) => (
          <Reveal key={c.id} delay={i * 120}>
            <Link href={`/${c.id}`} className="cat-card">
              <SafeImage src={CATEGORY_IMAGES[c.id]} alt={`${c.label} collection`} sizes="(max-width: 800px) 100vw, 50vw" className="cat-card__img" />
              <div className="cat-card__text">
                <p className="micro">{c.blurb}</p>
                <h3>{c.label}</h3>
                <span className="link-underline">Explore the edit</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

