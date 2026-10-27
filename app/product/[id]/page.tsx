import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import ProductPurchase from "@/components/ProductPurchase";
import ProductSection from "@/components/ProductSection";
import { getAllProductIds, getProductById, getRelated } from "@/lib/api";
import { money } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await getProductById(id);
  return { title: p?.name ?? "Product", description: p?.description };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();
  const related = await getRelated(product.id, 4);
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <>
      <div className="container pdp">
        <nav className="crumbs micro" aria-label="Breadcrumb">
          <Link href="/">Home</Link> / <Link href={`/${product.category}`}>{product.category}</Link> /{" "}
          <Link href={`/${product.category}?sub=${encodeURIComponent(product.subcategory)}`}>{product.subcategory}</Link>
        </nav>
        <div className="pdp__grid">
          <ProductGallery images={product.images} name={product.name} />
          <div className="pdp__info">
            <p className="micro">{product.subcategory}</p>
            <h1 className="h1 pdp__title">{product.name}</h1>
            <p className="pdp__price">
              {money(product.price)}
              {onSale && <s>{money(product.compareAtPrice!)}</s>}
            </p>
            <p className="pdp__desc">{product.description}</p>
            <ProductPurchase product={product} />
          </div>
        </div>
      </div>
      <ProductSection eyebrow="You may also like" title="Related pieces" products={related} />
    </>
  );
}

