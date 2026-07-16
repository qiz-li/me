"use client";

import { useEffect } from "react";

import { playHover } from "@/lib/sound";
import { toggleTheme, watchSystemTheme } from "@/lib/theme";

export function ThemeToggle() {
  // The icon is picked by the dark: variant off the class, not by state, so
  // this runs for the side effect alone and never has to re-render.
  useEffect(() => watchSystemTheme(), []);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      onMouseEnter={playHover}
      onFocus={playHover}
      className="text-muted hover:text-accent transition-colors duration-150 flex items-center"
      aria-label="Toggle theme"
    >
      <svg
        className="hidden dark:block"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
      <svg
        className="dark:hidden"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
