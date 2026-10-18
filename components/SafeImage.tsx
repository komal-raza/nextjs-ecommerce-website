"use client";

import Image from "next/image";
import { useState } from "react";
import { PLACEHOLDER_IMAGE } from "@/lib/data";

interface Props {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  className?: string;
}

/**
 * High-performance image component with:
 * - Luxury skeleton shimmer while loading
 * - Smooth fade-in on decode
 * - Fallback to neutral placeholder on error
 * - AVIF/WebP responsive optimization via Next.js
 */
export default function SafeImage({
  src,
  alt,
  sizes = "100vw",
  priority,
  loading,
  fetchPriority,
  className = "",
}: Props) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Modern Web Guidance: Never combine priority/fetchpriority="high" with loading="lazy"
  const computedLoading = priority ? "eager" : loading;
  const computedFetchPriority = priority ? "high" : fetchPriority;

  return (
    <>
      {/* Luxury skeleton shimmer placeholder displayed while downloading */}
      {!loaded && !failed && (
        <span
          className="img-skeleton"
          aria-hidden="true"
        />
      )}

      <Image
        src={failed ? PLACEHOLDER_IMAGE : src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={computedLoading}
        fetchPriority={computedFetchPriority}
        className={`${className} ${loaded ? "img-loaded" : "img-loading"}`}
        unoptimized={failed}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setFailed(true);
          setLoaded(true);
        }}
      />
    </>
  );
}
