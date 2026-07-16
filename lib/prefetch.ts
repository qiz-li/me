import { useEffect, useState } from "react";

// True once the browser has gone idle after mount. Gates the hidden
// prefetch blocks so they never compete with the critical load.
export function useIdle(): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(() => setIdle(true));
      return () => cancelIdleCallback(id);
    }
    // Safari has no requestIdleCallback; a beat after load is close enough.
    const t = setTimeout(() => setIdle(true), 300);
    return () => clearTimeout(t);
  }, []);

  return idle;
}

// Every clip ships twice: AV1 at roughly half the bytes, H.264 for browsers
// that can't decode it (canPlayType asks the actual decoder, so e.g. Safari
// on pre-AV1 hardware quietly stays on H.264). The player and the prefetch
// below must agree on this choice or the prefetch warms the wrong file.
export type ClipSources = { video: string; videoAv1?: string };

let av1: boolean | null = null;

export function pickClipSource(clip: ClipSources): string {
  if (!clip.videoAv1 || typeof document === "undefined") return clip.video;
  av1 ??=
    document
      .createElement("video")
      .canPlayType('video/mp4; codecs="av01.0.05M.08"') !== "";
  return av1 ? clip.videoAv1 : clip.video;
}

// Warm the browser cache for short clips so a reveal plays instantly
// instead of buffering on hover. Skipped for viewers who asked to save
// data; errors are irrelevant because this is purely opportunistic.
export function prefetchVideos(clips: ClipSources[]) {
  type SaveDataNavigator = Navigator & { connection?: { saveData?: boolean } };
  if ((navigator as SaveDataNavigator).connection?.saveData) return;
  for (const clip of clips) {
    fetch(pickClipSource(clip), { cache: "force-cache" }).catch(() => {});
  }
}
