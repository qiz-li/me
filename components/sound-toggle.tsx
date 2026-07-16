"use client";

import { useSyncExternalStore } from "react";

import { isMuted, playHover, setMuted, subscribeMuted } from "@/lib/sound";

export function SoundToggle() {
  // localStorage cannot be read while rendering on the server, so the server
  // snapshot claims unmuted and a stored mute only arrives with hydration.
  // Nothing audible rides on that: playback reads the stored value straight
  // from the module, not from this state, so the worst case is the icon
  // correcting itself — never a sound someone already said they did not want.
  const muted = useSyncExternalStore(subscribeMuted, isMuted, () => false);

  return (
    <button
      type="button"
      onClick={() => setMuted(!muted)}
      onMouseEnter={playHover}
      onFocus={playHover}
      aria-pressed={muted}
      aria-label={muted ? "Unmute interface sounds" : "Mute interface sounds"}
      className="text-muted hover:text-accent transition-colors duration-150 flex items-center"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        {muted ? (
          <>
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </>
        ) : (
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        )}
      </svg>
    </button>
  );
}
