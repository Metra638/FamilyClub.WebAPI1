import Link from "next/link";
import "../styles/globals.css";
import { Source_Sans_3, Roboto_Mono } from "next/font/google";
import UpNavigation from "@/app/(user-site)/layout/header/UpNavigation";
import DropDownList from "@/app/(user-site)/layout/header/dropdownlist/DropDownList";
import Footer from "@/app/(user-site)/layout/footer/Footer";
import MobileHeader from "@/app/(user-site)/layout/header/MobileHeader";
import MobileBottomNav from "@/app/(user-site)/layout/header/MobileBottomNav";
import MobileNotFoundView from "./MobileNotFoundView";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import ukDictionary from "@/messages/uk.json";
import type { Dictionary } from "@/lib/i18n/types";

const sourceSans = Source_Sans_3({
  subsets: ["cyrillic", "latin"],
  variable: "--font-sans",
});

const robotoMono = Roboto_Mono({
  subsets: ["cyrillic", "latin"],
  variable: "--font-mono",
});

// ── Assets from /public/images/ (project files) ──
// Background photo
const imgRectangle326 = "/images/addProducts/Rectangle 326.png";
// Decorative SVGs
const imgEllipseDeco    = "/images/not-found/ellipse-deco.svg";
const imgPageTexture    = "/images/not-found/page-texture.svg";
const imgTornBookmark   = "/images/not-found/torn-bookmark.svg";
const imgNotebookLines  = "/images/not-found/notebook-lines.svg";

export default function NotFound() {
  return (
    <LocaleProvider locale="uk" dictionary={ukDictionary as Dictionary}>
    <html lang="uk" className={`${sourceSans.variable} ${robotoMono.variable}`}>
      <body className="antialiased bg-[#F5F3EE] text-foreground font-sans m-0 p-0 flex flex-col min-h-screen">
        <MobileHeader />
        <header className="bg-[var(--background-main)] w-full hidden md:flex flex-row overflow-x-0 fixed z-30 h-[62px] shadow-[0px_0px_15px_0px_#24242499]">
          <div className="max-w-[1220px] mx-auto flex items-center lg:px-0">
            <UpNavigation />
          </div>
        </header>
        <div className="fixed hidden md:flex flex-row ml-[27%] items-center justify-between z-20 max-w-[900px] mx-auto gap-2 mt-[20px] px-4 lg:px-0">
          <DropDownList />
        </div>

        <main className="flex-1 flex flex-col">
          {/* Мобільна версія (до md) */}
          <div className="block md:hidden flex-1 w-full">
            <MobileNotFoundView />
          </div>

          {/* Десктопна версія (від md) */}
          <div className="hidden md:flex flex-1 flex-col pt-[62px] w-full">
            <div className="relative w-full flex-1 overflow-hidden" style={{ background: "#F5F3EE" }}>
            {/* ── Background blur layer ── */}
            <div
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ zIndex: 0 }}
            >
              <img
                alt=""
                src={imgRectangle326}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: "blur(5px)", transform: "scale(1.04)" }}
              />
              <div className="absolute inset-0" style={{ background: "rgba(36,36,36,0.4)" }} />
            </div>

            {/* ── Main Container ── */}
            <div
              className="relative mx-auto w-full flex flex-col items-center"
              style={{
                maxWidth: 1220,
                minHeight: 1000,
                background: "#F5F3EE",
                boxShadow: "0px 0px 30px 0px black",
                paddingBottom: 100,
                overflow: "hidden",
                zIndex: 1,
              }}
            >
              {/* Декоративний еліпс — лівий */}
              <div
                className="absolute pointer-events-none"
                style={{ left: -284, top: -47, width: 781, height: 781 }}
              >
                <img alt="" src={imgEllipseDeco} className="w-full h-full" />
              </div>
              {/* Декоративний еліпс — правий */}
              <div
                className="absolute pointer-events-none"
                style={{ left: 116, top: 175, width: 781, height: 781 }}
              >
                <img alt="" src={imgEllipseDeco} className="w-full h-full" />
              </div>

              {/* ── Заголовок "Помилка" ── */}
              <h1
                className="relative text-center text-[#242424] z-10"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  fontSize: 64,
                  lineHeight: "75px",
                  letterSpacing: "-0.011em",
                  marginTop: 138,
                  marginBottom: 58,
                  marginLeft: 0,
                  marginRight: 0,
                }}
              >
                Помилка
              </h1>

              <div className="relative flex flex-col xl:flex-row items-center xl:items-start justify-center z-10 w-full px-4" style={{ gap: 60 }}>
                {/* ═══ Ілюстрація книги ═══ */}
                <div
                  className="relative flex-shrink-0"
                  style={{ width: 568, height: 388 }}
                >
                  {/* Задня обкладинка (темно-зелена) */}
                  <div
                    className="absolute"
                    style={{ background: "#032f1b", width: 568, height: 388, top: 27, left: 0, borderRadius: 3 }}
                  />
                  {/* Передня обкладинка (зелена) */}
                  <div
                    className="absolute"
                    style={{ background: "#005B33", width: 548, height: 382, top: 20, left: 10, borderRadius: 3 }}
                  />
                  {/* Сторінки */}
                  <div
                    className="absolute"
                    style={{
                      background: "#E1E1E1",
                      border: "1px solid #9b9b9b",
                      width: 518,
                      height: 347,
                      top: 37,
                      left: 25,
                      borderRadius: 2,
                    }}
                  />
                  {/* Текстура правої сторінки */}
                  <div className="absolute pointer-events-none" style={{ width: 247, height: 346, top: 25, left: 285 }}>
                    <img alt="" src={imgPageTexture} className="w-full h-full object-cover" />
                  </div>
                  {/* Текстура лівої сторінки */}
                  <div className="absolute pointer-events-none" style={{ width: 247, height: 346, top: 25, left: 38 }}>
                    <img alt="" src={imgPageTexture} className="w-full h-full object-cover" />
                  </div>
                  {/* Центральна лінія корінця */}
                  <div className="absolute bg-[#9b9b9b]" style={{ width: 1, height: 382, top: 20, left: 285 }}></div>
                  {/* Лінії на ЛІВІЙ сторінці */}
                  <div className="absolute pointer-events-none" style={{ left: 50, top: 60, width: 183, height: 266 }}>
                    <img alt="" src={imgNotebookLines} className="w-full h-full" />
                  </div>
                  {/* 404 на ПРАВІЙ сторінці */}
                  <div
                    className="absolute text-center select-none text-[#005B33] font-semibold"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 128,
                      lineHeight: 1,
                      letterSpacing: "-0.011em",
                      right: 45,
                      width: 247,
                      top: 140,
                    }}
                  >
                    404
                  </div>
                  {/* Підпис під 404 */}
                  <div
                    className="absolute text-center select-none text-[#9396a8]"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 16,
                      lineHeight: 1.5,
                      letterSpacing: "-0.011em",
                      right: 45,
                      width: 247,
                      top: 290,
                    }}
                  >
                    Сторінку не знайдено
                  </div>
                  {/* Рвана закладка (поверх) */}
                  <div className="absolute pointer-events-none" style={{ left: 285, top: 0, width: 65, height: 371, zIndex: 1 }}>
                    <img alt="" src={imgTornBookmark} className="w-full h-full" />
                  </div>
                </div>

                {/* ═══ Текстовий блок справа ═══ */}
                <div
                  className="flex flex-col items-center xl:items-start text-center xl:text-left"
                  style={{ width: "100%", maxWidth: 422, gap: 50, paddingTop: 20 }}
                >
                  <div className="flex flex-col" style={{ gap: 15 }}>
                    <h2
                      className="text-black"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontWeight: 600,
                        fontSize: 55,
                        lineHeight: 1.2,
                        letterSpacing: "-0.011em",
                        margin: 0,
                      }}
                    >
                      Такої сторінки не існує
                    </h2>
                    <p
                      className="text-black"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontWeight: 400,
                        fontSize: 16,
                        lineHeight: 1.5,
                        letterSpacing: "-0.011em",
                        margin: 0,
                      }}
                    >
                      Але ви зможете перейти на головну сторінку
                    </p>
                  </div>

                  <Link
                    href="/uk"
                    className="inline-flex items-center justify-center text-[#F5F3EE] transition-colors duration-200 hover:bg-[#00452a] active:scale-95"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontWeight: 400,
                      fontSize: 20,
                      lineHeight: 1.5,
                      letterSpacing: "-0.011em",
                      background: "#005B33",
                      borderRadius: 65,
                      padding: "10px 20px",
                      width: 276,
                      textAlign: "center",
                      textDecoration: "none",
                    }}
                  >
                    Перейти на головну
                  </Link>
                </div>
              </div>
            </div>
          </div>
          </div>
        </main>

        <div className="hidden md:block">
          <Footer />
        </div>
        <MobileBottomNav />
      </body>
    </html>
    </LocaleProvider>
  );
}
