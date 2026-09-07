import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isLocale, locales } from "@/lib/i18n/config";

const PUBLIC_FILE = /\.[^/]+$/;

function shouldBypassLocale(pathname: string): boolean {
  return (
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
  matcher: ["/((?!api|admin|_next|images|favicon.ico|.*\\..*).*)"],
};
