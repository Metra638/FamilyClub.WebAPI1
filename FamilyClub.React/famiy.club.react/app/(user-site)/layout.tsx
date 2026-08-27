import type { Metadata } from "next";
import "../../styles/globals.css";
import { Source_Sans_3, Roboto_Mono, Lora, Inter } from 'next/font/google';
import UpNavigation from "./layout/header/UpNavigation";
import DropDownList from "./layout/header/dropdownlist/DropDownList";
import Footer from "@/app/(user-site)/layout/footer/Footer";
import PresenceHeartbeatMount from "../(admin-site)/admin/users/section/PresenceHeartbeatMount";
import MobileHeader from "./layout/header/MobileHeader";
import MobileBottomNav from "./layout/header/MobileBottomNav";
import UserSiteProviders from "./layout/UserSiteProviders";
import InkAssistant from "./components/ink-assistant/InkAssistant";
import HeaderDropDownSection from "./layout/header/dropdownlist/HeaderDropDownSection";

import "../../styles/register-flags.css";
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

export const metadata: Metadata = {
  title: "Librellis",
  description: "Книжковий клуб Librellis",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${sourceSans.variable} ${robotoMono.variable} ${lora.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground font-sans overflow-x-hidden flex flex-col min-h-screen">
        <UserSiteProviders>
        <PresenceHeartbeatMount />
        <MobileHeader />
        <header className="bg-[var(--background-main)] w-full hidden md:flex flex-row overflow-x-0 fixed z-[100] h-[62px] shadow-[0px_0px_15px_0px_#24242499]">
          <div className="max-w-[1220px] mx-auto flex items-center lg:px-0">
            <UpNavigation />
          </div>
        </header>
        <div className="fixed pointer-events-none z-[95] hidden md:flex flex-row ml-[26%] items-center justify-between max-w-[900px] mx-auto gap-2 mt-[20px] px-4 lg:px-0">
          <HeaderDropDownSection />
          {/* <DropDownList /> */}
        </div>

        <main className="flex-1 md:pt-[62px]">
          {children}
        </main>

        <div className="hidden md:block">
          <Footer />
        </div>
        <MobileBottomNav />
        <InkAssistant />
        </UserSiteProviders>
      </body>
    </html>
  );
}

