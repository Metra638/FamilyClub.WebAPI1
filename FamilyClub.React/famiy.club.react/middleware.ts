import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isLocale, locales } from "@/lib/i18n/config";

const PUBLIC_FILE = /\.[^/]+$/;

function shouldBypassLocale(pathname: string): boolean {
  return (
    pathname === "/health" ||
    pathname.startsWith("/health/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    PUBLIC_FILE.test(pathname)
  );
}

function pathnameHasLocale(pathname: string): boolean {
  return locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // K8s/Docker probes must hit /health with 200 — never redirect to /uk/health.
  if (shouldBypassLocale(pathname)) {
    return NextResponse.next();
  }

  if (pathnameHasLocale(pathname)) {
    const locale = pathname.split("/")[1];
    if (!isLocale(locale)) {
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  const locale = defaultLocale;
  const nextPath =
    pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return NextResponse.redirect(new URL(nextPath, request.url));
}

export const config = {
  // Do not run locale middleware for health/api/admin/static assets.
  matcher: [
    "/((?!api(?:/|$)|admin(?:/|$)|health(?:/|$)|_next(?:/|$)|images(?:/|$)|favicon\\.ico$).*)",
  ],
};
