"use client";

import { useState } from "react";
import SafeImage from "./SafeImage";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const unique = Array.from(new Set(images));
  const [active, setActive] = useState(0);

  return (
    <div className="gallery">
      <div className="gallery__thumbs">
        {unique.map((src, i) => (
          <button
            key={src}
            className={`gallery__thumb ${i === active ? "is-active" : ""}`}
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
          >
            <SafeImage src={src} alt="" sizes="90px" />
          </button>
        ))}
      </div>
      <div className="gallery__main">
        {unique.map((src, i) => (
          <div key={src} className={`gallery__slide ${i === active ? "is-active" : ""}`}>
            <SafeImage src={src} alt={`${name} — view ${i + 1}`} sizes="(max-width: 900px) 100vw, 50vw" priority={i === 0} />
          </div>
        ))}
      </div>
    </div>
  );
}

