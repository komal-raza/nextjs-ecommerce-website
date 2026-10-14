import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="container prose">
      <p className="micro">Our story</p>
      <h1 className="h1">About VELOUR</h1>
      <p>VELOUR was founded on a simple belief: that great clothes should be quiet, well made and built to last. We design considered essentials for men and women in natural fabrics — linen, wool, silk and cotton — and work with small ateliers that share our standards.</p>
      <p>Every piece is cut with intention and finished with care. We release fewer styles, in better materials, so your wardrobe grows more beautiful with time rather than larger.</p>
    </div>
  );
}

