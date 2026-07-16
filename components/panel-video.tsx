"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { StaticImageData } from "next/image";

export type VideoMedia = { video: string; poster: StaticImageData };

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

// Autoplay is opt-in per viewer: a panel only mounts on hover/click, so play()
// on mount is the reveal itself. Under reduced motion it stays on its poster
// and gets controls instead.
export function PanelVideo({
  video,
  poster,
  alt,
  className,
}: VideoMedia & { alt: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  // Autoplay gets refused for reasons the page can't see coming — macOS Low
  // Power Mode, a per-site autoplay block. Surface controls when that happens
  // so the clip is still reachable rather than a poster that does nothing.
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (reduced) return;
    ref.current?.play().catch(() => setBlocked(true));
  }, [reduced]);

  return (
    <video
      ref={ref}
      src={video}
      poster={poster.src}
      aria-label={alt}
      muted
      loop
      playsInline
      controls={reduced || blocked}
      preload="metadata"
      className={className}
    />
  );
}
