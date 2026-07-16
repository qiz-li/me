import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["italic"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#8b2942",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://thenathan.li"),
  title: {
    default: "the Nathan li",
    template: "%s — the Nathan li",
  },
  description:
    "Software engineer building thoughtful design-led experiences. From Beijing, living in Vancouver, studying in Waterloo.",
  openGraph: {
    title: "the Nathan li",
    description: "Thoughtful design-led experiences.",
    url: "https://thenathan.li",
    siteName: "the Nathan li",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "the Nathan li",
    description: "Thoughtful design-led experiences.",
    creator: "@nli24_",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://thenathan.li",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Blocking on purpose: this has to settle the class before the first
            paint or the wrong theme flashes. Mirrors lib/theme.ts — an
            override wins, otherwise follow the system. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||t==="light"?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <main className="w-full max-w-[820px] mx-auto px-6 pt-12 pb-16">
          {children}
        </main>
      </body>
    </html>
  );
}
