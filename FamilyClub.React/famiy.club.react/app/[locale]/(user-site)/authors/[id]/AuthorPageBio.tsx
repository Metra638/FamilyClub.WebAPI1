"use client";

import { AuthorDTO } from "@/lib/api/generated";
import { apiBasePath } from "@/lib/api/services";
import { useState } from "react";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

const BIO_PREVIEW_LENGTH = 400;

interface AuthorPageBioProps {
  author: AuthorDTO;
}

export default function AuthorPageBio({ author }: AuthorPageBioProps) {
  const t = useTranslations();
  const [bioExpanded, setBioExpanded] = useState(false);

  const bio = author.biography ?? "";
  const bioIsLong = bio.length > BIO_PREVIEW_LENGTH;
  const displayedBio =
    bioExpanded || !bioIsLong ? bio : bio.slice(0, BIO_PREVIEW_LENGTH) + "…";

  return (
    <div className="flex w-full max-w-[1100px] flex-col md:flex-row gap-8 text-[var(--color-white)] items-center p-8 mb-12 ml-[1%]">
      <div className="w-[240px] h-[240px] flex-shrink-0 rounded-[12px] overflow-hidden bg-gray-100">
        {author.photoUrl ? (
          <img
            src={`${apiBasePath}${author.photoUrl}`}
            alt={author.authorName ?? ""}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-[13px]">
            {t("authors.noPhoto")}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <h1 className="text-[36px] -mt-[12vh] font-bold text-[var(--color-white)] mb-4">
          {author.authorName}
        </h1>

        {bio ? (
          <>
            <p className="text-[15px] leading-relaxed text-[var(--color-white)] whitespace-pre-line">
              {displayedBio}
            </p>
            {bioIsLong && (
              <button
                type="button"
                onClick={() => setBioExpanded((prev) => !prev)}
                className="mt-2 self-start text-[14px] font-medium text-[var(--color-accent,#c98a2c)] hover:opacity-70 transition"
              >
                {bioExpanded ? t("authors.collapse") : t("authors.expand")}
              </button>
            )}
          </>
        ) : (
          <p className="text-[15px] text-[var(--color-black)] opacity-50">
            {t("authors.noBio")}
          </p>
        )}
      </div>
    </div>
  );
}
