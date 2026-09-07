import { defaultLocale, isLocale, type Locale } from "./config";

export function getLocaleFromPathname(pathname: string): Locale | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment && isLocale(segment) ? segment : null;
}

export function stripLocaleFromPathname(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);
  if (!locale) return pathname || "/";

  const withoutLocale = pathname.replace(new RegExp(`^/${locale}`), "");
  return withoutLocale || "/";
}

export function localizedPath(path: string, locale: Locale = defaultLocale): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const existingLocale = getLocaleFromPathname(normalized);

  if (existingLocale) {
    return normalized;
  }

  if (normalized === "/") {
    return `/${locale}`;
  }

  return `/${locale}${normalized}`;
}

export function switchLocalePath(pathname: string, locale: Locale): string {
  const pathWithoutLocale = stripLocaleFromPathname(pathname);
  return localizedPath(pathWithoutLocale, locale);
}
