"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Full-viewport Hero with faststart autoplaying looping video,
 * instant frame-0 poster sync, and responsive touch-first layout.
 */
export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure audio tracks are strictly disabled for mobile autoplay compliance
    video.muted = true;
    video.defaultMuted = true;

    // Respect user motion preference (prefers-reduced-motion)
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      video.pause();
      return;
    }

    const tryPlay = () => {
      const promise = video.play();
      if (promise !== undefined) {
        promise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay policy prevented playback, keep matching poster displayed
          });
      }
    };

    tryPlay();

    const handlePlaying = () => setIsPlaying(true);
    video.addEventListener("playing", handlePlaying);

    const onMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        video.pause();
      } else {
        tryPlay();
      }
    };
    mediaQuery.addEventListener("change", onMotionChange);

    return () => {
      video.removeEventListener("playing", handlePlaying);
      mediaQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <section className="hero">
      <div className="hero__bg">
        <video
          ref={videoRef}
          className={`hero__video ${isPlaying ? "is-playing" : ""}`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/hero-poster.jpg"
          aria-hidden="true"
        >
          <source src="/videos/herovideo.mp4" type="video/mp4" />
        </video>
        <div className="hero__overlay" />
      </div>

      <div className="container hero__content">
        <p className="micro hero__eyebrow anim-in" style={{ animationDelay: "0.15s" }}>
          Autumn / Winter Collection
        </p>
        <h1 className="hero__title">
          <span className="anim-in" style={{ animationDelay: "0.3s" }}>Quiet luxury,</span>
          <span className="anim-in" style={{ animationDelay: "0.45s" }}>
            <em>made to last.</em>
          </span>
        </h1>
        <p className="hero__sub anim-in" style={{ animationDelay: "0.65s" }}>
          Considered essentials in natural fabrics — cut with intention, designed to be worn for years.
        </p>
        <div className="hero__cta anim-in" style={{ animationDelay: "0.85s" }}>
          <Link href="/women" className="btn btn--light">Shop Women</Link>
          <Link href="/men" className="btn btn--ghost-light">Shop Men</Link>
        </div>
      </div>

      <a href="#categories" className="hero__scroll" aria-label="Scroll down">
        <span>Scroll</span>
        <i />
      </a>
    </section>
  );
}
