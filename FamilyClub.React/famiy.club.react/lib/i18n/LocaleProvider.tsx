"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "./config";
import { getNestedString } from "./nested";
import { localizedPath } from "./localized-path";
import type { Dictionary } from "./types";

type LocaleContextValue = {
  locale: Locale;
  dictionary: Dictionary;
  t: (key: string) => string;
  lp: (path: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo<LocaleContextValue>(() => {
    return {
      locale,
      dictionary,
      t: (key) => getNestedString(dictionary, key),
      lp: (path) => localizedPath(path, locale),
    };
  }, [dictionary, locale]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}

export function useTranslations() {
  return useLocale().t;
}

export function useLocalizedPath() {
  return useLocale().lp;
}
