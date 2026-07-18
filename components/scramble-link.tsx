"use client";

import { useEffect, useRef, useState } from "react";

import { playTick } from "@/lib/sound";

const SCRAMBLE_CHAR = "-";
// One tick per letter resolving, floored at this gap so a very long word
// cannot outrun the ear. At the 600ms scramble this rarely binds — letters
// in a nine-letter word land ~66ms apart — so the letter rate is what sets
// the pace. The ticks themselves are cut short enough to clear that gap; see
// the decay times in lib/sound.ts, which have to stay under it or a long
// word blurs into one sound.
const TICK_INTERVAL_MS = 40;

function useScramble(text: string) {
  const [display, setDisplay] = useState(text);
  const rafRef = useRef<number | null>(null);

  const stop = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setDisplay(text);
  };

  const run = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    const duration = 600;
    const start = performance.now();
    let revealedCount = 0;
    let lastSound = 0;

    const tick = (now: number) => {
      // rAF reports the frame's start time, which can predate this run: the
      // hover handler that called it fired after the frame had already begun.
      // Left negative, floor() lands on -1, and the next frame's 0 then reads
      // as a letter resolving — an extra tick before the word reveals
      // anything.
      const elapsed = Math.max(0, now - start);
      const revealed = (elapsed / duration) * text.length;
      let out = "";
      for (let i = 0; i < text.length; i++) {
        if (i < revealed || text[i] === " ") {
          out += text[i];
        } else {
          out += SCRAMBLE_CHAR;
        }
      }
      setDisplay(out);
      // Click along as characters resolve, throttled so long words
      // don't turn into a rattle.
      const whole = Math.min(Math.floor(revealed), text.length);
      if (whole > revealedCount && now - lastSound >= TICK_INTERVAL_MS) {
        playTick();
        lastSound = now;
      }
      revealedCount = whole;
      if (revealed < text.length) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        setDisplay(text);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { display, run, stop };
}

// Touch browsers synthesize mouseenter/focus on tap but never deliver the
// matching mouseleave, so anything keyed to hover sticks until another
// element is tapped. Hover callbacks therefore only run for non-touch
// pointers; touch taps still get the scramble effect (it ends on its own),
// and focus only counts when it came from the keyboard.
const isTouch = (e: React.PointerEvent) => e.pointerType === "touch";
const isKeyboardFocus = (e: React.FocusEvent) =>
  e.currentTarget.matches(":focus-visible");

function ScrambleText({
  text,
  display,
  children,
}: {
  text: string;
  display: string;
  children?: React.ReactNode;
}) {
  return (
    <span className="relative inline-block">
      <span className="invisible select-none" aria-hidden="true">
        {text}
      </span>
      <span className="absolute left-0 top-0 whitespace-nowrap overflow-hidden w-full">
        {display}
      </span>
      {children}
    </span>
  );
}

// The one underline used by every scramble control: a faint bar in the
// current text color, with an accent bar that fills in on hover or when
// the control is active/expanded. Needs a `group` positioned ancestor.
export function UnderlineBars({ filled }: { filled?: boolean }) {
  return (
    <>
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-current/30" />
      <span
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-accent transition-transform duration-500 ease-out ${filled ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
      />
    </>
  );
}

// Shared label for all arrow-style controls (captions, external links,
// contact toggle): scrambling text over an animated accent bar, plus an
// arrow that nudges on hover.
function ArrowLabel({
  text,
  display,
  filled,
  glyph = "↗",
}: {
  text: string;
  display: string;
  filled?: boolean;
  glyph?: string;
}) {
  return (
    <>
      <ScrambleText text={text} display={display}>
        <UnderlineBars filled={filled} />
      </ScrambleText>
      <span
        aria-hidden="true"
        className="transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      >
        {glyph}
      </span>
    </>
  );
}

// Arrow-style toggle: expandable captions and the contact reveal.
export function ScrambleButton({
  text,
  expanded,
  onToggle,
  onHoverStart,
  onHoverEnd,
  muted,
  className = "",
}: {
  text: string;
  expanded: boolean;
  onToggle: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  muted?: boolean;
  className?: string;
}) {
  const { display, run, stop } = useScramble(text);

  const handleEnter = () => {
    run();
    onHoverStart?.();
  };
  const handleLeave = () => {
    stop();
    onHoverEnd?.();
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      onPointerEnter={(e) => (isTouch(e) ? run() : handleEnter())}
      onPointerLeave={(e) => {
        if (!isTouch(e)) handleLeave();
      }}
      onFocus={(e) => {
        if (isKeyboardFocus(e)) handleEnter();
      }}
      onBlur={handleLeave}
      aria-expanded={expanded}
      className={`group inline-flex items-center gap-1.5 self-start hover:text-accent-hover transition-colors ${expanded ? "text-accent" : muted ? "text-muted" : ""} ${className}`}
    >
      <ArrowLabel
        text={text}
        display={display}
        filled={expanded}
        glyph={expanded ? "↙" : "↗"}
      />
    </button>
  );
}

// Arrow-style link, visually identical to ScrambleButton — or, with
// `plain`, the underlined-word look of ScrambleInline. External hrefs
// open in a new tab; internal ones navigate in place.
export function ScrambleInlineLink({
  text,
  href,
  plain,
}: {
  text: string;
  href: string;
  plain?: boolean;
}) {
  const { display, run, stop } = useScramble(text);
  const external = !href.startsWith("/");

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onPointerEnter={() => run()}
      onPointerLeave={(e) => {
        if (!isTouch(e)) stop();
      }}
      onFocus={(e) => {
        if (isKeyboardFocus(e)) run();
      }}
      onBlur={stop}
      className={`group no-underline text-inherit hover:text-accent-hover transition-colors ${plain ? "inline-block" : "inline-flex items-center gap-1.5 mr-1"}`}
    >
      {plain ? (
        <ScrambleText text={text} display={display}>
          <UnderlineBars />
        </ScrambleText>
      ) : (
        <ArrowLabel text={text} display={display} />
      )}
    </a>
  );
}

// Plain underlined word (no arrow): panel toggles in the intro and
// image-reveal words in experience descriptions.
export function ScrambleInline({
  text,
  onClick,
  onHoverStart,
  onHoverEnd,
  active,
}: {
  text: string;
  onClick?: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  active?: boolean;
}) {
  const { display, run, stop } = useScramble(text);

  const handleEnter = () => {
    run();
    onHoverStart?.();
  };
  const handleLeave = () => {
    stop();
    onHoverEnd?.();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={(e) => (isTouch(e) ? run() : handleEnter())}
      onPointerLeave={(e) => {
        if (!isTouch(e)) handleLeave();
      }}
      onFocus={(e) => {
        if (isKeyboardFocus(e)) handleEnter();
      }}
      onBlur={handleLeave}
      aria-expanded={active}
      className={`group inline-block hover:text-accent-hover transition-colors ${active ? "text-accent" : ""}`}
    >
      <ScrambleText text={text} display={display}>
        <UnderlineBars filled={active} />
      </ScrambleText>
    </button>
  );
}
