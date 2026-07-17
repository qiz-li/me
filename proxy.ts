import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Maps a discreet, env-configured slug to the internal file route so the file
// is served inline at /<slug> without exposing the S3 location or changing the
// browser URL. Everything else passes through — unknown paths render the app's
// normal not-found page.
const INTERNAL_PATH = "/api/file";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The internal route is reachable only via the rewrite below; block any
  // direct external request to it.
  if (pathname === INTERNAL_PATH) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const slug = process.env.FILE_SLUG;
  if (slug && pathname === `/${slug}`) {
    const url = request.nextUrl.clone();
    url.pathname = INTERNAL_PATH;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except static assets (so /api/file stays covered).
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
