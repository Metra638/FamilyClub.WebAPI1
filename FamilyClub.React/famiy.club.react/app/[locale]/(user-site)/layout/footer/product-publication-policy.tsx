"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getProductPublicationPolicyContent } from "@/lib/i18n/legal";

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
 * Сторінка «Політика публікації товару» за макетом Figma.
 */
export default function ProductPublicationPolicy() {
  const router = useRouter();
  const { locale } = useLocale();
  const content = getProductPublicationPolicyContent(locale);

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
              "url('/images/Layout/Footer/long_background1.png')",
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
              className="text-[22px] sm:text-[28px] md:text-[36px] font-bold text-[#1F1F1F] tracking-tight text-center px-10 leading-tight"
              style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            >
              {content.title}
            </h1>
          </header>

          {content.sections.map((section) => (
            <Section key={section.title} title={section.title}>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.items ? <BulletList items={section.items} /> : null}
              {section.afterItems?.map((paragraph) => (
                <p key={paragraph} className="pt-1">
                  {paragraph}
                </p>
              ))}
            </Section>
          ))}

          <p className="mt-8 text-[15px] md:text-[16px] leading-relaxed text-[#2A2A2A] border-t border-[#D9D0C3] pt-6">
            {content.footerBeforeEmail}{" "}
            <a
              href={`mailto:${content.email}`}
              className="underline hover:opacity-70"
            >
              {content.email}
            </a>
            {content.footerAfterEmail}
          </p>
        </article>
      </div>
    </section>
  );
}
