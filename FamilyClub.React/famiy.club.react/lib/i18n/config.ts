export const locales = ["uk", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "uk";

export const localeLabels: Record<Locale, string> = {
  uk: "UA",
  en: "EN",
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
