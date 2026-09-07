"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthorDTO } from "@/lib/api/generated";
import { authorService } from "@/lib/api/services";
import { useRouter } from "next/navigation";
import {
  useLocale,
  useLocalizedPath,
  useTranslations,
} from "@/lib/i18n/LocaleProvider";

const UKR_ALPHABET = [
  "А", "Б", "В", "Г", "Ґ", "Д", "Е", "Є", "Ж", "З", "И", "І", "Ї", "Й",
  "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У", "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ю", "Я",
];

const ENG_ALPHABET = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
];

function getLetterButtonClass(hasAuthors: boolean, isActive: boolean) {
  if (!hasAuthors) return "text-[var(--color-black)] opacity-60 cursor-default";
  if (isActive) return "text-[var(--color-green)] cursor-pointer";
  return "text-[var(--color-black)] hover:opacity-70 cursor-pointer";
}

export default function AuthorsPage() {
  const router = useRouter();
  const t = useTranslations();
  const { locale } = useLocale();
  const lp = useLocalizedPath();
  const [authors, setAuthors] = useState<AuthorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.backgroundImage = "url('/images/authorsUserPage/Rectangle 326.png')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";

    return () => {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundAttachment = "";
      document.body.style.backgroundPosition = "";
      document.body.style.backgroundRepeat = "";
    };
  }, []);

  useEffect(() => {
    authorService
      .apiAuthorsGet()
      .then(setAuthors)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sortedAuthors = useMemo(
    () =>
      [...authors].sort((a, b) =>
        (a.authorName ?? "").localeCompare(b.authorName ?? "", locale),
      ),
    [authors, locale],
  );

  const groupedByLetter = useMemo(() => {
    const groups: Record<string, AuthorDTO[]> = {};

    [...UKR_ALPHABET, ...ENG_ALPHABET].forEach((letter) => {
      groups[letter] = [];
    });

    sortedAuthors.forEach((author) => {
      const firstLetter = (author.authorName ?? "").trim().charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(author);
    });

    return groups;
  }, [sortedAuthors]);

  const extraLetters = useMemo(
    () =>
      Object.keys(groupedByLetter)
        .filter(
          (l) => !UKR_ALPHABET.includes(l) && !ENG_ALPHABET.includes(l),
        )
        .sort((a, b) => a.localeCompare(b, locale)),
    [groupedByLetter, locale],
  );

  const handleLetterClick = (letter: string) => {
    setActiveLetter((prev) => (prev === letter ? null : letter));
  };

  useEffect(() => {
    if (locale !== "uk" && activeLetter && UKR_ALPHABET.includes(activeLetter)) {
      setActiveLetter(null);
    }
  }, [locale, activeLetter]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-[var(--color-black)] opacity-60">{t("authors.loading")}</p>
      </div>
    );
  }

  const activeAuthors = activeLetter ? groupedByLetter[activeLetter] ?? [] : [];

  return (
    <div
      className="
        w-full 
        mt-28
        min-h-screen
        relative
        bg-no-repeat
        bg-top
        bg-center
        bg-cover
    "
      style={{
        backgroundImage: "url('/images/authorsUserPage/Rectangle 473.png')",
      }}
    >
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 pt-16 pb-24">
        <h1 className="text-[36px] text-center font-bold text-[var(--color-black)] mb-8">
          {t("authors.title")}
        </h1>

        <div className="flex flex-col gap-2 mb-4 border-y border-[var(--color-black)]/10 py-4">
          {locale === "uk" && (
            <nav className="flex flex-wrap gap-3">
              {UKR_ALPHABET.map((letter) => {
                const isActive = activeLetter === letter;
                const hasAuthors = (groupedByLetter[letter]?.length ?? 0) > 0;

                return (
                  <button
                    key={letter}
                    type="button"
                    disabled={!hasAuthors}
                    onClick={() => handleLetterClick(letter)}
                    className={`text-[16px] font-medium transition ${getLetterButtonClass(hasAuthors, isActive)}`}
                  >
                    {letter}
                  </button>
                );
              })}
            </nav>
          )}

          <nav className="flex flex-wrap gap-3">
            {ENG_ALPHABET.map((letter) => {
              const isActive = activeLetter === letter;
              const hasAuthors = (groupedByLetter[letter]?.length ?? 0) > 0;

              return (
                <button
                  key={letter}
                  type="button"
                  disabled={!hasAuthors}
                  onClick={() => handleLetterClick(letter)}
                  className={`text-[16px] font-medium transition ${getLetterButtonClass(hasAuthors, isActive)}`}
                >
                  {letter}
                </button>
              );
            })}
          </nav>

          {extraLetters.length > 0 && (
            <nav className="flex flex-wrap gap-3">
              {extraLetters.map((letter) => {
                const isActive = activeLetter === letter;
                const hasAuthors = (groupedByLetter[letter]?.length ?? 0) > 0;

                return (
                  <button
                    key={letter}
                    type="button"
                    disabled={!hasAuthors}
                    onClick={() => handleLetterClick(letter)}
                    className={`text-[16px] font-medium transition ${getLetterButtonClass(hasAuthors, isActive)}`}
                  >
                    {letter}
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {sortedAuthors.length === 0 ? (
          <p className="text-[var(--color-black)] opacity-60">
            {t("authors.empty")}
          </p>
        ) : !activeLetter ? (
          <p className="text-[var(--color-black)] opacity-40 mt-6">
            {t("authors.pickLetter")}
          </p>
        ) : (
          <div className="mt-6">
            <h3 className="text-[24px] font-bold text-[var(--color-black)]/40 mb-4">
              {activeLetter}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
              {activeAuthors.map((author) => (
                <button
                  key={author.id}
                  type="button"
                  onClick={() => router.push(lp(`/authors/${author.id}`))}
                  className="text-left text-[16px] text-[var(--color-black)] hover:text-[var(--color-green)] transition truncate"
                >
                  {author.authorName}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
