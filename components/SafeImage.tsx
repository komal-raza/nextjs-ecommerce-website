"use client";

import Image from "next/image";
import { useState } from "react";
import { PLACEHOLDER_IMAGE } from "@/lib/data";

interface Props {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * next/image (fill) with an onError fallback to a neutral placeholder,
 * so a dead image URL never renders as a broken icon. Parent must be position:relative.
 */
export default function SafeImage({ src, alt, sizes = "100vw", priority, className }: Props) {
  const [failed, setFailed] = useState(false);
  return (
    <Image
      src={failed ? PLACEHOLDER_IMAGE : src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      unoptimized={failed}
      onError={() => setFailed(true)}
    />
  );
}

