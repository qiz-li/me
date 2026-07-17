"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useState } from "react";

import { PanelVideo, type VideoMedia } from "@/components/panel-video";
import { prefetchVideos, useIdle } from "@/lib/prefetch";
import { ScrambleButton, ScrambleInline, ScrambleInlineLink } from "@/components/scramble-link";
import aruba from "@/public/experience/aruba.jpg";
import bdo from "@/public/experience/bdo.jpg";
import cook from "@/public/experience/cook.jpg";
import coopAward from "@/public/experience/coop-award.webp";
import k15 from "@/public/experience/k-15.jpg";
import ridge from "@/public/experience/ridge.png";
import shopify from "@/public/experience/shopify.jpg";
import softballers from "@/public/experience/softballers.jpg";
import twente from "@/public/experience/twente.jpg";
import unitedMobility from "@/public/experience/united-mobility.jpg";
import seEventsPoster from "@/public/experience/se-events.jpg";
import velocity from "@/public/experience/velocity.jpg";
import waterloo from "@/public/experience/waterloo-campus.jpg";

const seEvents: VideoMedia = {
  video: "/experience/se-events.mp4",
  videoAv1: "/experience/se-events-av1.mp4",
  poster: seEventsPoster,
};

// What an inline word can swap the experience's photo for: another still, or
// a short clip.
type Media = StaticImageData | VideoMedia;

type DescriptionSegment =
  | string
  | { text: string; href: string }
  | { text: string; image: Media };

// The SE webring mark, drawn in currentColor so it picks up the role link's
// muted tone and accent hover in both themes. Upstream ships it as fixed
// black/white fills (simcard0000/se-webring, assets/logo); the path is theirs,
// the viewBox is tightened to the glyph so it sits on the text baseline
// without the artwork's built-in padding.
function WebringMark() {
  return (
    <svg
      width="14"
      height="9.7"
      viewBox="91 210 778 540"
      fill="currentColor"
      aria-hidden="true"
      className="inline-block align-baseline ml-1 translate-y-[0.5px]"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M390.499 272.146V687.477C491.737 672.742 569.501 585.38 569.501 479.811C569.501 374.243 491.737 286.881 390.499 272.146ZM367.396 749.527C364.991 749.591 362.577 749.623 360.157 749.623C211.506 749.623 91 628.824 91 479.811C91 330.799 211.506 210 360.157 210C362.577 210 364.991 210.032 367.396 210.096C368.31 210.032 369.233 210 370.163 210H869V749.623H370.163C369.233 749.623 368.31 749.591 367.396 749.527ZM330.687 687.602V272.021C229.023 286.379 150.813 373.94 150.813 479.811C150.813 585.683 229.023 673.244 330.687 687.602ZM529.346 269.958H809.187V689.665H529.346C590.325 640.201 629.313 564.57 629.313 479.811C629.313 395.053 590.325 319.422 529.346 269.958Z"
      />
    </svg>
  );
}

// The inline controls are atomic inline-blocks, so a following "." is free to
// wrap onto a line of its own. Punctuation that trails a control is rendered
// alongside it instead, and trimmed from the text segment that follows.
const TRAILING_PUNCT = /^[.,;:!?]+/;

// Hover only previews a description in the two-column layout, where the
// description sits beside the photo and the photo column sets the row's
// height — opening one moves nothing. Stacked, a description is in flow
// below its caption, so previewing one collapses the one above it and drags
// every caption below up by its height. The caption under the cursor slides
// out from under it, which ends the hover, which restores the layout, which
// puts the caption back under the cursor: an unbreakable flicker. Below lg,
// only a click toggles. Matching lg:grid-cols on the article.
const SIDE_BY_SIDE = "(min-width: 1024px) and (hover: hover)";
const previewsOnHover = () => window.matchMedia(SIDE_BY_SIDE).matches;

type Experience = {
  company: string;
  url: string;
  role: string;
  roleUrl?: string;
  date: string;
  image: StaticImageData;
  caption: string;
  description: DescriptionSegment[][];
};

const experiences: Experience[] = [
  {
    company: "University of Waterloo",
    url: "https://news.ycombinator.com/item?id=6655271",
    role: "Software Engineering",
    roleUrl: "https://se-webring.xyz",
    date: "2024",
    image: waterloo,
    caption: "Believe it or leave it",
    description: [
      [
        "I study software engineering with a specialization in artificial intelligence.",
      ],
      [
        "In my free time, I help run ",
        { text: "events", image: seEvents },
        " with the SE Society. I also help organize the ",
        { text: "Softballers", image: softballers },
        " (F25 League Champions) soccer team.",
      ],
      [
        "A proud resident and fellow of ",
        { text: "K-15", image: k15 },
        ", I'm grateful to have met a lot of friends and to be inspired by the very smart and ambitious people here at Waterloo.",
      ],
    ],
  },
  {
    company: "Shopify",
    url: "https://shopify.com",
    role: "Engineering Intern",
    date: "Jan 2026 – Apr 2026",
    image: shopify,
    caption: "Rank 1 ping pong",
    description: [
      ["I worked on the talent team, developing algorithms and systems for performance evaluation and recruiting."],
      [{ text: "Allie Speers", href: "https://x.com/alspee" }, " bought me a ", { text: "wallet", image: ridge }, " for my high performance."],
      ["I also served as the Head of the \"Corner Pod\" intern division and helped organize an offsite in ", { text: "Aruba", image: aruba }, "."],
    ],
  },
  {
    company: "BDO",
    url: "https://bdo.ca",
    role: "Full Stack Developer",
    date: "May 2025 – Aug 2025",
    image: bdo,
    caption: "Growers, layers, and eggs",
    description: [
      ["I helped build the quota transfer system for ", { text: "egg farmers in Ontario", href: "https://www.getcracking.ca" }, " that accounted for about 40% of egg production in Canada."],
      [
        "I also worked on developing an evaluation benchmark for measuring the productivity impact of agentic tools through telemetry, winning the 2025 University of Waterloo ",
        { text: "Co-op Problem Award", image: coopAward },
        ".",
      ],
      [
        "Lived in a beautiful apartment and learned to ",
        { text: "cook", image: cook },
        ".",
      ],
    ],
  },
  {
    company: "United Mobility",
    url: "https://utdmobility.com",
    role: "Co-Founder",
    date: "Mar 2025 – Sep 2025",
    image: unitedMobility,
    caption: "Oldenzaal, Netherlands",
    description: [
      ["Built the first peer-to-peer mobility platform."],
      [
        "Incubated by ",
        { text: "Velocity", image: velocity },
        ", and invited to ",
        { text: "present", image: twente },
        " our research at the University of Twente in the Netherlands, which helped form a ",
        {
          text: "transatlantic trade corridor",
          href: "https://www.velocityincubator.com/news/velocity-and-novel-t-forge-transatlantic-trade-corridor-for-founders",
        },
        " between Velocity and Novel-T.",
      ],
      ["Shut down and partnered with Neuron (now Lime)."],
      [{ text: "utdmobility.com", href: "https://utdmobility.com" }],
    ],
  },
];

// These photos are the page's body content, so none of them load lazily:
// the first (likely LCP) is preloaded from the head, and the rest fetch
// eagerly at low priority — the browser gets them right after the critical
// assets instead of waiting for the viewport to reach each one, which is
// what made them pop in on scroll.
function ExperienceMedia({
  media,
  alt,
  preload,
}: {
  media: Media;
  alt: string;
  preload: boolean;
}) {
  const className = "w-full h-auto rounded-[2px]";

  if ("video" in media) {
    return <PanelVideo {...media} alt={alt} className={className} />;
  }

  return (
    <Image
      src={media}
      alt={alt}
      placeholder="blur"
      sizes="(min-width: 1024px) 420px, 440px"
      preload={preload}
      {...(preload ? {} : { loading: "eager", fetchPriority: "low" })}
      className={className}
    />
  );
}

// Reveal media only mounts when its word is hovered, which used to make the
// swap wait on the network right under the cursor. Once the page goes idle,
// fetch every description's stills and clips into cache — hidden copies
// request the exact optimized URLs ExperienceMedia will ask for (same sizes
// attribute), so any reveal paints instantly.
function PrefetchDescriptionMedia() {
  const idle = useIdle();

  useEffect(() => {
    if (!idle) return;
    prefetchVideos(
      experiences.flatMap((exp) =>
        exp.description
          .flat()
          .flatMap((seg) =>
            typeof seg === "object" && "image" in seg && "video" in seg.image
              ? seg.image
              : [],
          ),
      ),
    );
  }, [idle]);

  if (!idle) return null;

  return (
    <div className="hidden" aria-hidden="true">
      {experiences.flatMap((exp) =>
        exp.description.flat().map((segment, i) => {
          if (typeof segment !== "object" || !("image" in segment)) return null;
          const media = segment.image;
          return "video" in media ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`${exp.company}-${i}`} src={media.poster.src} alt="" />
          ) : (
            <Image
              key={`${exp.company}-${i}`}
              src={media}
              alt=""
              loading="eager"
              fetchPriority="low"
              sizes="(min-width: 1024px) 420px, 440px"
            />
          );
        }),
      )}
    </div>
  );
}

export function ExperienceList() {
  // Clicking a caption pins its description open; hovering shows it
  // transiently — mirroring the intro panel behavior.
  const [expanded, setExpanded] = useState<string | null>(null);
  const [hoverExpanded, setHoverExpanded] = useState<string | null>(null);
  const shownExpanded = hoverExpanded ?? expanded;
  // Replacement for the expanded experience's photo: clicking an inline
  // word pins its image, hovering shows it transiently. Scoped to the
  // expanded experience so hovering a different caption doesn't leak it.
  const [pinnedImage, setPinnedImage] = useState<Media | null>(null);
  const [hoverImage, setHoverImage] = useState<Media | null>(null);
  const imageOverride = shownExpanded === expanded ? (hoverImage ?? pinnedImage) : null;


  return (
    <div className="flex flex-col gap-16">
      {experiences.map((exp, i) => (
        <article key={exp.company} className="grid lg:grid-cols-[440px_280px] max-w-[440px] lg:max-w-none gap-x-10 gap-y-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <div>
                <a href={exp.url} target="_blank" rel="noopener noreferrer" className="no-underline hover:text-accent-hover transition-colors">{exp.company}</a>
                <span className="text-muted">
                  {", "}
                  {exp.roleUrl ? (
                    // text-inherit keeps the muted tone: the base `a` rule sets
                    // its own color.
                    <a
                      href={exp.roleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-underline text-inherit hover:text-accent-hover transition-colors whitespace-nowrap"
                    >
                      {exp.role}
                      <WebringMark />
                    </a>
                  ) : (
                    exp.role
                  )}
                </span>
              </div>
              <span className="text-[13px] text-muted">{exp.date}</span>
            </div>
            <ExperienceMedia
              media={
                (shownExpanded === exp.company && imageOverride) || exp.image
              }
              alt={exp.company}
              preload={i === 0}
            />
            <ScrambleButton
              text={exp.caption}
              muted
              className="text-[13px]"
              expanded={expanded === exp.company}
              onToggle={() => {
                setPinnedImage(null);
                setHoverImage(null);
                setExpanded(expanded === exp.company ? null : exp.company);
              }}
              onHoverStart={() => {
                if (previewsOnHover()) setHoverExpanded(exp.company);
              }}
              onHoverEnd={() => setHoverExpanded(null)}
            />
          </div>
          {shownExpanded === exp.company && (
            <div className="mt-2 lg:mt-0 lg:pt-6 flex flex-col gap-3 text-[13px] text-muted">
              {exp.description.map((paragraph, pi) => (
                <p key={pi}>
                  {paragraph.map((segment, si) => {
                    if (typeof segment === "string") {
                      const prev = paragraph[si - 1];
                      const text =
                        typeof prev === "object"
                          ? segment.replace(TRAILING_PUNCT, "")
                          : segment;
                      return text ? <span key={si}>{text}</span> : null;
                    }

                    const next = paragraph[si + 1];
                    const glue =
                      typeof next === "string"
                        ? (next.match(TRAILING_PUNCT)?.[0] ?? "")
                        : "";
                    const control =
                      "href" in segment ? (
                        <ScrambleInlineLink
                          href={segment.href}
                          text={segment.text}
                        />
                      ) : (
                        <ScrambleInline
                          text={segment.text}
                          active={pinnedImage === segment.image}
                          onClick={() =>
                            setPinnedImage(
                              pinnedImage === segment.image
                                ? null
                                : segment.image,
                            )
                          }
                          onHoverStart={() => setHoverImage(segment.image)}
                          onHoverEnd={() => setHoverImage(null)}
                        />
                      );

                    return (
                      <span
                        key={si}
                        className={glue ? "whitespace-nowrap" : undefined}
                      >
                        {control}
                        {glue}
                      </span>
                    );
                  })}
                </p>
              ))}
            </div>
          )}
        </article>
      ))}
      <PrefetchDescriptionMedia />
    </div>
  );
}
