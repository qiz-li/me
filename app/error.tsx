"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      <span className="size-8 bg-accent rounded-[2px]" aria-hidden />
      <h1 className="text-2xl tracking-tight">
        <span className="font-light">something</span> broke
      </h1>
      <p>
        <button
          type="button"
          onClick={reset}
          className="underline underline-offset-2 hover:text-accent-hover transition-colors"
        >
          Try again
        </button>
        , or refresh the page.
      </p>
    </div>
  );
}
