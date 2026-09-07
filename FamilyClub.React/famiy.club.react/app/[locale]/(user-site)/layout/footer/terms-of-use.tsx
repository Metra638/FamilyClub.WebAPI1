"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getTermsOfUseContent } from "@/lib/i18n/legal";

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8 first:mt-0">
      <h2
        className="text-[20px] md:text-[24px] font-bold text-[#1F1F1F] mb-4 tracking-tight"
        style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
      >
        {title}
      </h2>
      <div className="text-[15px] md:text-[16px] leading-relaxed text-[#2A2A2A] space-y-3">
        {children}
      </div>
    </section>
  );
}

function Term({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  return (
    <p>
      <strong className="text-[#1F1F1F]">{name}</strong> — {children}
    </p>
  );
}

/**
 * Сторінка «Умови використання» (публічна оферта).
 */
export default function TermsOfUse() {
  const router = useRouter();
  const { locale } = useLocale();
  const content = getTermsOfUseContent(locale);

  return (
    <section className="relative w-full min-h-screen pt-0 pb-10 md:pb-16 px-2 sm:px-4">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/main_page/main_background.png')",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-[#1a1510]/55 backdrop-blur-[2px]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-[900px]">
        <article
          className="relative text-[#242424] px-8 sm:px-12 md:px-16 lg:px-20 pt-10 md:pt-12 pb-12 md:pb-16"
          style={{
            backgroundImage:
              "url('/images/Layout/Footer/long_background.png')",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <header className="relative flex items-center justify-center mb-8 md:mb-10 min-h-[48px]">
            <button
              type="button"
              onClick={() => router.back()}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-[22px] text-[#242424]/70 hover:bg-black/5 transition"
              aria-label={content.backAria}
            >
              ←
            </button>
            <h1
              className="text-[26px] sm:text-[32px] md:text-[40px] font-bold text-[#1F1F1F] tracking-tight text-center px-10"
              style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            >
              {content.title}
            </h1>
          </header>

          <Section title={content.preambleTitle}>
            <p>{content.preamble}</p>
          </Section>

          <Section title={content.definitionsTitle}>
            {content.definitions.map((term) => (
              <Term key={term.name} name={term.name}>
                {term.definition}
              </Term>
            ))}
          </Section>

          <Section title={content.generalTitle}>
            {content.general.map((clause, index) => (
              <p key={`${clause.number}-${index}`}>
                <strong>{clause.number}</strong> {clause.text}
              </p>
            ))}
          </Section>
        </article>
      </div>
    </section>
  );
}
