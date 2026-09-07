"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getProductReturnContent } from "@/lib/i18n/legal";

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 marker:text-[#7E4D1E]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

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
        className="text-[18px] md:text-[20px] font-bold text-[#1F1F1F] mb-3"
        style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
      >
        {title}
      </h2>
      <div className="text-[15px] md:text-[16px] leading-relaxed text-[#2A2A2A] space-y-2">
        {children}
      </div>
    </section>
  );
}

/**
 * Сторінка «Повернення товару / Скасування» за макетом Figma (Node 1472:32020).
 */
export default function ProductReturn() {
  const router = useRouter();
  const { locale, lp } = useLocale();
  const content = getProductReturnContent(locale);

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
          className="relative text-[#242424] px-8 sm:px-12 md:px-16 lg:px-20 pt-10 md:pt-12 pb-12 md:pb-16 shadow-2xl rounded-3xl"
          style={{
            backgroundImage:
              "url('/images/Layout/Footer/long_background1.png')",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <header className="relative flex flex-col items-center justify-center mb-8 md:mb-10">
            <button
              type="button"
              onClick={() => router.back()}
              className="absolute left-0 top-2 w-10 h-10 rounded-full flex items-center justify-center text-[22px] text-[#242424]/70 hover:bg-black/5 transition"
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

            {/* Figma Node 1472:32020 Badge "Як скасувати?" */}
            <div className="mt-3 px-6 py-1.5 rounded-full bg-[#005b33]/10 border border-[#005b33]/30 text-[#005b33] text-sm font-extrabold tracking-wide uppercase">
              {content.badge}
            </div>
          </header>

          {/* Highlight Card matching Figma 1472:32020 */}
          <div className="bg-[#EBE7DD] border-2 border-[#005b33]/30 p-4 sm:p-5 rounded-2xl mb-8 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#005b33] text-white flex items-center justify-center font-bold text-xl shrink-0">
              ✓
            </div>
            <p className="text-sm sm:text-base font-bold text-[#242424] leading-snug">
              {content.highlight}
            </p>
          </div>

          <div className="text-[15px] md:text-[16px] leading-relaxed text-[#2A2A2A] space-y-3 mb-4">
            <p>{content.intro}</p>
          </div>

          <Section title={content.cancelTitle}>
            <p className="mb-2">{content.cancelIntro}</p>
            <ol className="list-decimal pl-5 space-y-2 font-medium">
              {content.cancelSteps.map((step, index) => (
                <li key={index}>
                  {step.type === "link" ? (
                    <>
                      {step.before}{" "}
                      <Link
                        href={lp(step.href)}
                        className="text-[#005b33] font-bold underline hover:opacity-80"
                      >
                        {step.linkText}
                      </Link>
                      {step.after}
                    </>
                  ) : (
                    step.text
                  )}
                </li>
              ))}
            </ol>
          </Section>

          <Section title={content.defectTitle}>
            <BulletList items={content.defectItems} />
          </Section>

          <Section title={content.qualityTitle}>
            <p>
              {content.qualityIntroBefore}{" "}
              <strong>{content.qualityIntroStrong}</strong>{" "}
              {content.qualityIntroAfter}
            </p>
            <BulletList items={content.qualityItems} />
          </Section>

          <Section title={content.refundTitle}>
            <p>
              {content.refundBefore}{" "}
              <strong>{content.refundStrong}</strong>
              {content.refundAfter}
            </p>
          </Section>

          <Section title={content.helpTitle}>
            <div className="bg-[#F5F3EE] p-4 rounded-xl border border-[#C8C2B4] mt-2 space-y-1">
              <p className="font-bold text-[#242424]">{content.supportTitle}</p>
              <p className="text-sm">
                {content.phoneLabel}{" "}
                <a
                  href={`tel:${content.phoneHref}`}
                  className="font-bold text-[#005b33] underline"
                >
                  {content.phoneDisplay}
                </a>{" "}
                {content.freeNote}
              </p>
              <p className="text-xs text-[#666666]">{content.schedule}</p>
            </div>
          </Section>
        </article>
      </div>
    </section>
  );
}
