import Hero from "@/components/Hero";
import CategoryHighlights from "@/components/CategoryHighlights";
import ProductSection from "@/components/ProductSection";
import { SaleBanner, ShippingBanner } from "@/components/PromoBanners";
import Newsletter from "@/components/Newsletter";
import { getFeatured, getNewArrivals, getTrending } from "@/lib/api";

export default async function HomePage() {
  const [featured, fresh, trending] = await Promise.all([getFeatured(8), getNewArrivals(4), getTrending(4)]);
  return (
    <>
      <Hero />
      <CategoryHighlights />
      <ProductSection eyebrow="Curated" title="Featured pieces" products={featured} href="/women" linkLabel="Shop all" />
      <SaleBanner />
      <ProductSection eyebrow="Just in" title="New arrivals" products={fresh} href="/women?sort=newest" />
      <ProductSection eyebrow="Right now" title="Trending" products={trending} href="/men?sort=newest" />
      <ShippingBanner />
      <Newsletter />
    </>
  );
}
