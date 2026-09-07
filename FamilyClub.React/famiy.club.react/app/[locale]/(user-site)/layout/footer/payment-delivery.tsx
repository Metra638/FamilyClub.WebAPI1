"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getPaymentDeliveryContent } from "@/lib/i18n/legal";

type CarrierBlockProps = {
  name: string;
  accent: string;
  children: ReactNode;
};

function CarrierBlock({ name, accent, children }: CarrierBlockProps) {
  return (
    <div className="mt-8 first:mt-6">
      <div className="flex items-center gap-3 mb-3">
        <span
          className="inline-block h-8 w-1.5 rounded-full shrink-0"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
        <h3
          className="text-[22px] md:text-[26px] font-bold tracking-tight"
          style={{ color: accent, fontFamily: "var(--font-lora), Georgia, serif" }}
        >
          {name}
        </h3>
      </div>
      <div className="pl-0 md:pl-4 text-[15px] md:text-[16px] leading-relaxed text-[#2A2A2A]">
        {children}
      </div>
    </div>
  );
}

function SubTitle({ children }: { children: ReactNode }) {
  return (
    <p className="font-semibold text-[#1F1F1F] mt-4 mb-2 text-[16px] md:text-[17px]">
      {children}
    </p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 marker:text-[#7E4D1E]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/**
 * Сторінка «Оплата і доставка» за макетом Figma.
 * Текст на довгому «паперовому» фоні з рваними краями.
 */
export default function PaymentDelivery() {
  const router = useRouter();
  const { locale } = useLocale();
  const content = getPaymentDeliveryContent(locale);

  return (
    <section className="relative w-full min-h-screen pt-0 pb-10 md:pb-16 px-2 sm:px-4">
      {/* Blurred interior background */}
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
        {/* Torn paper sheet from long_background.png */}
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
          {/* ——— Доставка ——— */}
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
              className="text-[36px] md:text-[48px] font-bold text-[#1F1F1F] tracking-tight text-center px-10"
              style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            >
              {content.deliveryTitle}
            </h1>
          </header>

          <div className="space-y-4 text-[15px] md:text-[16px] leading-relaxed text-[#2A2A2A]">
            {content.deliveryIntro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {content.carriers.map((carrier) => (
            <CarrierBlock
              key={carrier.name}
              name={carrier.name}
              accent={carrier.accent}
            >
              {carrier.blocks.map((block, blockIndex) => (
                <div key={`${carrier.name}-${block.subtitle ?? blockIndex}`}>
                  {block.subtitle ? <SubTitle>{block.subtitle}</SubTitle> : null}
                  {block.paragraphs?.map((paragraph) => (
                    <p key={paragraph} className="mb-2">
                      {paragraph}
                    </p>
                  ))}
                  {block.items ? <BulletList items={block.items} /> : null}
                </div>
              ))}
            </CarrierBlock>
          ))}

          <p className="mt-8 text-[14px] md:text-[15px] text-[#555] leading-relaxed border-t border-[#D9D0C3] pt-5">
            {content.deliveryNote}
          </p>

          {/* ——— Оплата ——— */}
          <header className="text-center mt-14 md:mt-16 mb-8 md:mb-10">
            <h2
              className="text-[36px] md:text-[48px] font-bold text-[#1F1F1F] tracking-tight"
              style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            >
              {content.paymentTitle}
            </h2>
          </header>

          <div className="space-y-6 text-[15px] md:text-[16px] leading-relaxed text-[#2A2A2A]">
            {content.paymentMethods.map((method) => (
              <div key={method.title}>
                <h3 className="font-semibold text-[18px] md:text-[19px] text-[#1F1F1F] mb-2">
                  {method.title}
                </h3>
                {method.items ? <BulletList items={method.items} /> : null}
                {method.subsections?.map((subsection) => (
                  <div key={subsection.title}>
                    <SubTitle>{subsection.title}</SubTitle>
                    <BulletList items={subsection.items} />
                  </div>
                ))}
              </div>
            ))}

            <div className="border-t border-[#D9D0C3] pt-6">
              <h3 className="font-semibold text-[18px] md:text-[19px] text-[#1F1F1F] mb-2">
                {content.returnsTitle}
              </h3>
              <p className="mb-2">{content.returnsIntro}</p>
              <BulletList items={content.returnsItems} />
              <p className="mt-3 text-[14px] text-[#555]">{content.returnsNote}</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
