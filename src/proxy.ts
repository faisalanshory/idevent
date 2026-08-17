import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/jwt";

export async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // Exclude static assets, Next internals, internal rewrites, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/sites") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const hostname = req.headers.get("host") || "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

  // Determine if it's a subdomain
  let subdomain: string | null = null;

  // Clean hostname (strip port for comparison)
  const cleanHost = hostname.split(":")[0];
  const cleanRoot = rootDomain.split(":")[0];

  if (cleanHost !== cleanRoot && cleanHost.endsWith(`.${cleanRoot}`)) {
    const sub = cleanHost.replace(`.${cleanRoot}`, "");
    // Ignore reserved subdomains
    if (sub && sub !== "www" && sub !== "admin" && sub !== "organizer") {
      subdomain = sub;
    }
  }

  // Load JWT token from request cookies
  const token = req.cookies.get("idevent-token")?.value;
  let user: any = null;
  if (token) {
    user = await verifyToken(token);
  }

  // 1. Admin route protection
  if (pathname.startsWith("/admin")) {
    if (subdomain) {
      const proto = req.headers.get("x-forwarded-proto") || "http";
      return NextResponse.redirect(new URL(`${proto}://${rootDomain}/admin`, req.url));
    }
    if (!user || user.role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 2. Organizer route protection
  if (pathname.startsWith("/organizer")) {
    if (subdomain) {
      const proto = req.headers.get("x-forwarded-proto") || "http";
      return NextResponse.redirect(new URL(`${proto}://${rootDomain}/organizer`, req.url));
    }
    if (!user || (user.role !== "ORGANIZER" && user.role !== "SUPERADMIN")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // If subdomain is detected, rewrite internally to sites routing
  if (subdomain) {
    const cleanPath = pathname === "/" ? "" : pathname;
    return NextResponse.rewrite(
      new URL(`/sites/${subdomain}${cleanPath}${url.search}`, req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
