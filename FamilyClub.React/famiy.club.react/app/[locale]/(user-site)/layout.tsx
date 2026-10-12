import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../../../styles/globals.css";
import { Source_Sans_3, Roboto_Mono, Lora, Inter } from 'next/font/google';
import UpNavigation from "./layout/header/UpNavigation";
import Footer from "@/app/[locale]/(user-site)/layout/footer/Footer";
import PresenceHeartbeatMount from "../../(admin-site)/admin/users/section/PresenceHeartbeatMount";
import MobileHeader from "./layout/header/MobileHeader";
import MobileBottomNav from "./layout/header/MobileBottomNav";
import UserSiteProviders from "./layout/UserSiteProviders";
import InkAssistant from "./components/ink-assistant/InkAssistant";
import HeaderDropDownSection from "./layout/header/dropdownlist/HeaderDropDownSection";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";

import "../../../styles/register-flags.css";
const sourceSans = Source_Sans_3({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-source-sans',
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

const lora = Lora({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-lora',
  display: 'swap',
});

const inter = Inter({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-inter',
  display: 'swap',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return { title: "Librellis" };
  }

  const dictionary = await getDictionary(locale);
  return {
    title: dictionary.metadata.title,
    description: dictionary.metadata.description,
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);

  return (
    <html lang={locale} className={`${sourceSans.variable} ${robotoMono.variable} ${lora.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('librellis-theme');if(t==='ink-night')document.documentElement.setAttribute('data-theme','ink-night');}catch(e){}})();",
          }}
        />
      </head>
      <body className="antialiased bg-background text-foreground font-sans overflow-x-hidden flex flex-col min-h-screen">
        <LocaleProvider locale={locale} dictionary={dictionary}>
          <UserSiteProviders>
            <PresenceHeartbeatMount />
            <MobileHeader />
            <header className="fixed z-[100] hidden w-full overflow-visible md:block">
            <div
              className="header-torn-bg pointer-events-none absolute inset-0 -z-10"
              style={{
                backgroundImage: "url('/images/header/header-torn-edge.png')",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center bottom",
                backgroundSize: "100% 100%",
              }}
              aria-hidden
            />
            <div className="relative z-10 mx-auto flex h-[65px] max-w-[1220px] items-center">
              <UpNavigation />
            </div>
            <div className="h-[16px]" aria-hidden />
          </header>
            <div className="fixed pointer-events-none z-[95] hidden md:flex flex-row ml-[26%] items-center justify-between max-w-[900px] mx-auto gap-2 mt-[20px] px-4 lg:px-0">
              <HeaderDropDownSection />
            </div>

            {/* <main className="flex-1 md:pt-[62px]"> */}
            <main className="flex-1">
              {children}
            </main>

            <div className="relative z-20 hidden md:block">
              <Footer />
            </div>
            <MobileBottomNav />
            <InkAssistant />
          </UserSiteProviders>
        </LocaleProvider>
      </body>
    </html>
  );
}

