import Link from "next/link";
import type { Product } from "@/lib/data";
import { money } from "@/lib/format";
import SafeImage from "./SafeImage";

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const [primary, hover] = product.images;
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;
  return (
    <article className="card">
      <Link href={`/product/${product.id}`} className="card__link" aria-label={product.name}>
        <div className="card__media">
          <SafeImage
            src={primary}
            alt={product.name}
            sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
            priority={priority}
            className="card__img card__img--primary"
          />
          <SafeImage
            src={hover}
            alt=""
            sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
            className="card__img card__img--hover"
          />
          <div className="card__badges">
            {product.isNew && <span className="badge">New</span>}
            {onSale && <span className="badge badge--sale">Sale</span>}
          </div>
          <span className="card__quick">Quick add</span>
        </div>
        <div className="card__body">
          <p className="micro">{product.subcategory}</p>
          <h3 className="card__name">{product.name}</h3>
          <p className="card__price">
            {money(product.price)}
            {onSale && <s>{money(product.compareAtPrice!)}</s>}
          </p>
        </div>
      </Link>
    </article>
  );
}

