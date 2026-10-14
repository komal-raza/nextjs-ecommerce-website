import Link from "next/link";
import type { Product } from "@/lib/data";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";
import { ArrowRight } from "./Icons";

interface Props {
  eyebrow: string;
  title: string;
  products: Product[];
  href?: string;
  linkLabel?: string;
}

/** Titled product grid with staggered reveal — used on the homepage and product page. */
export default function ProductSection({ eyebrow, title, products, href, linkLabel = "View all" }: Props) {
  if (products.length === 0) return null;
  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div className="section__head">
            <div>
              <p className="micro">{eyebrow}</p>
              <h2 className="h2">{title}</h2>
            </div>
            {href && (
              <Link href={href} className="link-underline">
                {linkLabel} <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </Reveal>
        <div className="grid">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 90}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

