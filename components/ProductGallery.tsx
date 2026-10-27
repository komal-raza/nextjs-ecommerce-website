"use client";

import { useState } from "react";
import SafeImage from "./SafeImage";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const list = images && images.length > 0 ? images.filter(Boolean) : ["/images/placeholder.svg"];
  const [active, setActive] = useState(0);
  const activeIndex = active >= list.length ? 0 : active;

  return (
    <div className="gallery">
      <div className="gallery__thumbs">
        {list.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            className={`gallery__thumb ${i === activeIndex ? "is-active" : ""}`}
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
          >
            <SafeImage src={src} alt="" sizes="90px" />
          </button>
        ))}
      </div>
      <div className="gallery__main">
        {list.map((src, i) => (
          <div key={`${src}-${i}`} className={`gallery__slide ${i === activeIndex ? "is-active" : ""}`}>
            <SafeImage src={src} alt={`${name} — view ${i + 1}`} sizes="(max-width: 900px) 100vw, 50vw" priority={i === 0} />
          </div>
        ))}
      </div>
    </div>
  );
}

