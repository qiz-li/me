import type { Metadata } from "next";

import { Controls } from "@/components/controls";
import { ScrambleInlineLink } from "@/components/scramble-link";

export const metadata: Metadata = {
  title: "404",
};

// The home page's opening block, gone wrong: the accent square arrives
// hollow — the mark with nothing in it.
export default function NotFound() {
  return (
    <div className="flex flex-col gap-6">
      {/* Same header grid as the home page, so the controls land in the
          exact spot they occupy there — right column on desktop, beside
          the mark on mobile. */}
      <div className="grid lg:grid-cols-[440px_280px] gap-x-10 items-start max-w-[440px] lg:max-w-none">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-5">
            <span
              className="size-8 rounded-[2px] border border-accent"
              aria-hidden
            />
            <h1 className="text-2xl tracking-tight">
              <span className="font-light">404</span> Not found
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
      <div className="flex flex-col gap-4 max-w-[440px]">
        <p>
          There&apos;s nothing here. Take me{" "}
          <ScrambleInlineLink text="home" href="/" plain />.
        </p>
      </div>
    </div>
  );
}
