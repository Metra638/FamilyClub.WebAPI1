import type { Dictionary } from "./types";
import type { Locale } from "./config";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  uk: () => import("@/messages/uk.json").then((module) => module.default),
  en: () => import("@/messages/en.json").then((module) => module.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
