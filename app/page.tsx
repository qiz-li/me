"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExperienceList } from "@/components/experience-list";
import { PanelVideo } from "@/components/panel-video";
import {
  ScrambleButton,
  ScrambleInline,
  UnderlineBars,
} from "@/components/scramble-link";
import { Controls } from "@/components/controls";
import { prefetchVideos, useIdle } from "@/lib/prefetch";
import { playHover } from "@/lib/sound";

import beijing from "@/public/panels/beijing.jpg";
import vancouver from "@/public/panels/vancouver.jpg";
import waterloo from "@/public/panels/waterloo-ion.jpg";
import community from "@/public/panels/community.jpg";
import ccs from "@/public/panels/ccs.jpg";
import travelling from "@/public/panels/travelling.jpg";
import iot from "@/public/panels/iot.jpg";
import iotDoorPoster from "@/public/panels/iot-door.jpg";

const panels = {
  beijing: {
    image: beijing,
    alt: "Crowds in front of the Forbidden City in Beijing",
  },
  vancouver: {
    image: vancouver,
    alt: "Sunset over English Bay in Vancouver, ships on the horizon",
  },
  waterloo: {
    image: waterloo,
    alt: "An ION light rail train passing through Waterloo",
  },
  iot: {
    image: iot,
    alt: "A workbench of half-disassembled smart home sensors, a breadboard, and hand tools",
  },
  smartHomes: {
    video: "/panels/iot-door.mp4",
    videoAv1: "/panels/iot-door-av1.mp4",
    poster: iotDoorPoster,
    alt: "A bedroom door swinging itself open, pulled by a motor I built and mounted at its base",
  },
  community: {
    image: community,
    alt: "Friends gathered around pool tables at a bar",
  },
  ccs: {
    image: ccs,
    alt: "Standing in front of the College for Creative Studies sign and building in Detroit",
  },
  travelling: {
    image: travelling,
    alt: "Me driving a van on a trip",
  },
} as const;

type Panel = keyof typeof panels | "contact";
type PanelContent = (typeof panels)[keyof typeof panels];

// Landscape media hangs from the top of the column at a fixed width. Portrait
// media is pinned to the column's height instead: at 280px wide it would
// outgrow the paragraphs and shove the experience list down on hover. Going
// out of flow is what lets it match that height, since an in-flow item would
// feed its own height back into the grid row it is trying to measure against.
// Stacked below the text there is no column to match, so it just picks a
// height. h-full is load-bearing: with only top/bottom pinned, a replaced
// element keeps its intrinsic height instead of stretching.
const LANDSCAPE_PANEL = "w-[280px] h-auto rounded-[2px]";
const PORTRAIT_PANEL =
  "h-[300px] w-auto rounded-[2px] lg:absolute lg:inset-y-0 lg:left-0 lg:h-full";

function PanelMedia({ panel }: { panel: PanelContent }) {
  if ("video" in panel)
    return <PanelVideo {...panel} className={PORTRAIT_PANEL} />;

  const portrait = panel.image.height > panel.image.width;

  return (
    <Image
      src={panel.image}
      alt={panel.alt}
      placeholder="blur"
      sizes={portrait ? "240px" : "280px"}
      className={portrait ? PORTRAIT_PANEL : LANDSCAPE_PANEL}
    />
  );
}

// Panels only mount on hover, so a fresh visitor pays the whole network
// round-trip at the moment of the reveal — the image pops in a beat after
// the scramble. Fetching every panel's media once the page goes idle means
// the reveal reads from cache instead. Hidden copies request the exact
// same optimized URLs as PanelMedia (same sizes attribute), and eager
// loading is what makes a display:none image fetch at all.
function PrefetchPanelMedia() {
  const idle = useIdle();

  useEffect(() => {
    if (!idle) return;
    prefetchVideos(
      Object.values(panels).flatMap((p) => ("video" in p ? p : [])),
    );
  }, [idle]);

  if (!idle) return null;

  return (
    <div className="hidden" aria-hidden="true">
      {Object.entries(panels).map(([key, panel]) =>
        "video" in panel ? (
          // Just the poster — that's what shows instantly; the clip streams.
          // eslint-disable-next-line @next/next/no-img-element
          <img key={key} src={panel.poster.src} alt="" />
        ) : (
          <Image
            key={key}
            src={panel.image}
            alt=""
            loading="eager"
            fetchPriority="low"
            sizes={panel.image.height > panel.image.width ? "240px" : "280px"}
          />
        ),
      )}
    </div>
  );
}

const contactLinks = [
  { label: "q74li@uwaterloo.ca", href: "mailto:q74li@uwaterloo.ca" },
  { label: "x.com/nli24_", href: "https://x.com/nli24_" },
  { label: "github.com/qiz-li", href: "https://github.com/qiz-li" },
  { label: "linkedin.com/in/li24", href: "https://www.linkedin.com/in/li24/" },
];

export default function Home() {
  // Clicking a word pins its panel open; hovering shows it transiently.
  const [activePanel, setActivePanel] = useState<Panel | null>(null);
  const [hoverPanel, setHoverPanel] = useState<Panel | null>(null);
  const shownPanel = hoverPanel ?? activePanel;

  const panelToggle = (panel: Panel) => ({
    active: activePanel === panel,
    onClick: () => setActivePanel(activePanel === panel ? null : panel),
    onHoverStart: () => setHoverPanel(panel),
    onHoverEnd: () => setHoverPanel(null),
  });

  return (
    // Flex columns (not block flow + margins) everywhere selectable text
    // spans siblings: browsers paint selection across the gaps between
    // blocks — WebKit fills whole sections — but skip flex containers.
    // max-w bounds any remaining painting to the text column; the side
    // panel escapes it via absolute positioning.
    <div className="flex flex-col gap-16">
      <section className="flex flex-col gap-6">
        <div className="grid lg:grid-cols-[440px_280px] gap-x-10 items-start max-w-[440px] lg:max-w-none">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-5">
              <span className="size-8 bg-accent rounded-[2px]" aria-hidden />
              <h1 className="text-2xl tracking-tight">
                <span className="font-light">the</span> Nathan li
              </h1>
            </div>
            <div className="lg:hidden">
              <Controls />
            </div>
          </div>
          <div className="hidden lg:flex justify-end">
            <Controls />
          </div>
        </div>
        <div className="grid lg:grid-cols-[440px_280px] gap-x-10 items-start max-w-[440px] lg:max-w-none">
          <div className="flex flex-col gap-4">
            <p>
              I am a <span className="accent-serif">software engineer</span>{" "}
              building thoughtful design-led experiences. I
              grew up in <ScrambleInline text="Beijing" {...panelToggle("beijing")} />
              , now living in{" "}
              <ScrambleInline text="Vancouver" {...panelToggle("vancouver")} />{", "}
              and currently study in{" "}
              <ScrambleInline text="Waterloo" {...panelToggle("waterloo")} />.
            </p>
            <p>
              I&apos;ve been programming since age 12, with my interest stemming
              from{" "}
              <ScrambleInline text="IoT" {...panelToggle("iot")} /> and{" "}
              <ScrambleInline text="smart homes" {...panelToggle("smartHomes")} />,
              to now focusing on diffusion, robotics, and emerging interfaces.
              I also previously studied UX design and 3D modelling at CalArts and {" "}
              <ScrambleInline text="CCS" {...panelToggle("ccs")} />.
            </p>
            <p>
              I care deeply about people, friends, and{" "}
              <ScrambleInline text="community" {...panelToggle("community")} />.
              My goal is to write a book that brings together millions of people.
            </p>
            <p>
              I love{" "}
              <ScrambleInline text="travelling" {...panelToggle("travelling")} />
              , as I believe{" "}
              <span className="accent-serif">
                you cannot change the world without first knowing what&apos;s on
                it
              </span>
              .
            </p>
            <p>
              <ScrambleButton
                text="Contact me"
                expanded={activePanel === "contact"}
                onToggle={() =>
                  setActivePanel(activePanel === "contact" ? null : "contact")
                }
                onHoverStart={() => setHoverPanel("contact")}
                onHoverEnd={() => setHoverPanel(null)}
              />
            </p>
          </div>
          {shownPanel && (
            <div className="mt-4 lg:mt-0 lg:relative lg:self-stretch">
              {shownPanel === "contact" ? (
                <div className="flex flex-col items-start gap-2 text-muted">
                  {contactLinks.map(({ label, href }) => (
                    <a
                      key={href}
                      href={href}
                      {...(href.startsWith("mailto:")
                        ? {}
                        : { target: "_blank", rel: "noopener noreferrer" })}
                      onMouseEnter={playHover}
                      onFocus={playHover}
                      className="group relative no-underline hover:text-accent transition-colors"
                    >
                      {label}
                      <UnderlineBars />
                    </a>
                  ))}
                </div>
              ) : (
                <PanelMedia panel={panels[shownPanel]} />
              )}
            </div>
          )}
        </div>
      </section>

      <ExperienceList />
      <PrefetchPanelMedia />
    </div>
  );
}
