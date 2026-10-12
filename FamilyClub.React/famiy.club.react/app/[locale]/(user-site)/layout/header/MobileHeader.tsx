"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlatformSettingsOptional } from "@/lib/platformSettings/PlatformSettingsContext";
import { mediaSrc } from "@/lib/platformSettings/platformSettingsApi";
import { useCart } from "@/lib/hooks/useCart";
import { getAuthToken, getAuthUserId } from "@/lib/auth/tokenStorage";
import { apiBasePath, orderService } from "@/lib/api/services";
import { useLocale, useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";
import { switchLocalePath } from "@/lib/i18n/localized-path";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function MobileHeader() {
  const pathname = usePathname() ?? "/";
  const { locale } = useLocale();
  const t = useTranslations();
  const lp = useLocalizedPath();
  const nextLocale = locale === "uk" ? "en" : "uk";
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { settings } = usePlatformSettingsOptional();
  const { totalItemsCount: cartCount } = useCart();
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [notificationsCount, setNotificationsCount] = useState<number>(0);

  const logoSrc =
    mediaSrc(settings.logoData, settings.logoContentType) ??
    "/images/main_page/logo.png";
  const logoAlt = settings.companyName || "LIBRELLIS";

  useEffect(() => {
    const fetchUserCounts = async () => {
      const userId = getAuthUserId();
      const token = getAuthToken();
      if (!userId || !token) {
        setOrdersCount(0);
        setNotificationsCount(0);
        return;
      }
      try {
        const orders = await orderService
          .apiOrdersByUserUserIdGet({ userId }, { headers: { Authorization: `Bearer ${token}` } })
          .catch(() => []);
        setOrdersCount(Array.isArray(orders) ? orders.length : 0);
      } catch {
        setOrdersCount(0);
      }

      try {
        const res = await fetch(`${apiBasePath}/api/Notifications?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null);
        if (res && res.ok) {
          const notifs = await res.json();
          setNotificationsCount(Array.isArray(notifs) ? notifs.length : 0);
        }
      } catch {
        setNotificationsCount(0);
      }
    };

    fetchUserCounts();
    window.addEventListener("auth-change", fetchUserCounts);
    return () => window.removeEventListener("auth-change", fetchUserCounts);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] block md:hidden h-[65px] bg-transparent">
        {/* Figma Rectangle 56 / Group 895 (hand-drawn textured cream paper background and border) */}
        <div className="absolute -top-[10px] -left-[15px] -right-[15px] -bottom-[18px] z-0 pointer-events-none drop-shadow-[0px_4px_10px_rgba(0,0,0,0.15)]">
          <img
            src="/images/header/Rectangle 56.svg"
            alt=""
            className="w-full h-full object-fill admin-parchment-bg"
          />
        </div>

        {/* Top bar container */}
        <div className="relative z-10 flex items-center justify-between h-full px-4">
          {/* Left: Hanging Bookmark Logo (Figma Group 112 / Group 61) */}
          <div className="flex items-center">
            <Link
              href={lp("/")}
              aria-label={t("common.homeAria")}
              className="absolute top-0 left-[16px] z-[110] block w-[85px] h-[56px] sm:w-[95px] sm:h-[62px] isolate transition-transform hover:scale-105"
            >
              <img
                src="/images/main_page/logo-background.png"
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-fill pointer-events-none"
              />
              <img
                src={logoSrc}
                alt={logoAlt}
                className={`relative z-10 w-full h-full object-contain p-[4px_6px_10px] drop-shadow-[0px_4px_8px_rgba(0,0,0,0.3)] ${
                  logoSrc === "/images/main_page/logo.png" && theme !== "ink-night"
                    ? "mix-blend-screen"
                    : ""
                }`}
              />
            </Link>
          </div>

          {/* Right: Search, Filter, Menu Icons (Dark grey #242424 on cream background) */}
          <div className="flex items-center gap-4 pl-[90px]">
            {/* Search Button */}
            {/* Search Button */}
            <Link
              href={lp("/categories")}
              aria-label={t("common.search")}
              className={`flex h-[40px] w-[40px] items-center justify-center rounded-full transition-all duration-300 ${
                theme === "ink-night"
                  ? "hover:shadow-[0px_0px_16px_0px_rgba(245,243,238,0.65)]"
                  : "hover:bg-[var(--color-white)] hover:shadow-[0px_0px_15px_0px_#242424CC]"
              }`}
            >
              <img
                src="/images/header/zoom_out_24px.svg"
                alt={t("common.search")}
                className={`w-[24px] h-[24px] ${theme === "ink-night" ? "brightness-0 invert-[0.92]" : ""}`}
              />
            </Link>

            {/* Filter Button (Funnel icon - filter-solid-full) */}
            <Link
              href={lp("/categories")}
              aria-label={t("catalog.filtersButton")}
              className="p-1.5 rounded-full hover:bg-[color-mix(in_srgb,var(--foreground-primary)_5%,transparent)] transition-colors text-[var(--foreground-primary)]"
            >
              <svg
                className="w-[22px] h-[22px] fill-current text-[var(--foreground-primary)]"
                viewBox="0 0 24 24"
              >
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
              </svg>
            </Link>

            {/* Menu Button (Burger menu) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={t("common.menu")}
              className="p-1.5 rounded-full hover:bg-[color-mix(in_srgb,var(--foreground-primary)_5%,transparent)] transition-colors text-[var(--foreground-primary)]"
            >
              <svg
                className="w-[26px] h-[26px] fill-current text-[var(--foreground-primary)]"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                ) : (
                  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Dropdown Menu Overlay (Figma Node 2773:6881 / "Меню" — 1-to-1 Dev Mode specification) */}
      {menuOpen && (
        <div className="fixed top-[65px] bottom-[70px] left-0 right-0 z-[90] bg-[rgba(25,25,25,0.88)] backdrop-blur-[12px] md:hidden overflow-y-auto animate-in fade-in duration-200 select-none">
          <nav className="flex flex-col justify-evenly gap-4 py-6 px-6 sm:px-10 min-h-full max-w-[480px] mx-auto">
            {/* 1. Сповіщення (Figma Node 2773:7053) */}
            <Link
              href={lp("/notifications")}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between group py-2 cursor-pointer"
            >
              <div className="flex items-center gap-5 sm:gap-6">
                <div className="w-[36px] flex items-center justify-center shrink-0">
                  <img src="/images/header/add_24px.svg" alt="" className="w-[28px] h-[32px] object-contain brightness-0 invert pointer-events-none" />
                </div>
                <span className="font-sans font-semibold text-[26px] sm:text-[30px] text-white tracking-[-0.01em] group-hover:text-[var(--color-cream)]/80 transition-colors">
                  {t("notifications.title")}
                </span>
              </div>
              <div className="w-[32px] h-[32px] rounded-full bg-[#4C85B2] flex items-center justify-center text-[var(--color-cream)] font-sans text-[16px] font-medium shadow-md">
                {notificationsCount}
              </div>
            </Link>

            {/* 2. Мої замовлення (Figma Node 2773:7073) */}
            <Link
              href={lp("/orders")}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between group py-2 cursor-pointer"
            >
              <div className="flex items-center gap-5 sm:gap-6">
                <div className="w-[36px] flex items-center justify-center shrink-0">
                  <img src="/images/header/assignment_24px.svg" alt="" className="w-[28px] h-[28px] object-contain brightness-0 invert pointer-events-none" />
                </div>
                <span className="font-sans font-semibold text-[26px] sm:text-[30px] text-white tracking-[-0.01em] group-hover:text-[var(--color-cream)]/80 transition-colors">
                  {t("orders.title")}
                </span>
              </div>
              <div className="w-[32px] h-[32px] rounded-full bg-[#4C85B2] flex items-center justify-center text-[var(--color-cream)] font-sans text-[16px] font-medium shadow-md">
                {ordersCount}
              </div>
            </Link>

            {/* 3. Улюблене (Figma Node 2773:7075) */}
            <Link
              href={lp("/userProfile")}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between group py-2 cursor-pointer"
            >
              <div className="flex items-center gap-5 sm:gap-6">
                <div className="w-[36px] flex items-center justify-center shrink-0">
                  <img src="/images/header/favorite_border_24px.png" alt="" className="w-[30px] h-[30px] object-contain brightness-0 invert pointer-events-none" />
                </div>
                <span className="font-sans font-semibold text-[26px] sm:text-[30px] text-white tracking-[-0.01em] group-hover:text-[var(--color-cream)]/80 transition-colors">
                  {t("profile.tabs.favorite")}
                </span>
              </div>
            </Link>

            {/* 4. Кошик (Figma Node 2773:7083) */}
            <Link
              href={lp("/cart")}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between group py-2 cursor-pointer"
            >
              <div className="flex items-center gap-5 sm:gap-6">
                <div className="w-[36px] flex items-center justify-center shrink-0">
                  <img src="/images/header/shopping_basket_24px.png" alt="" className="w-[30px] h-[30px] object-contain brightness-0 invert pointer-events-none" />
                </div>
                <span className="font-sans font-semibold text-[26px] sm:text-[30px] text-white tracking-[-0.01em] group-hover:text-[var(--color-cream)]/80 transition-colors">
                  {t("cart.title")}
                </span>
              </div>
              <div className="w-[32px] h-[32px] rounded-full bg-[#4C85B2] flex items-center justify-center text-[var(--color-cream)] font-sans text-[16px] font-medium shadow-md">
                {cartCount}
              </div>
            </Link>

            {/* 5. Українська (Figma Node 2773:7087) */}
            <Link
              href={switchLocalePath(pathname, nextLocale)}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between group py-2 cursor-pointer w-full text-left"
            >
              <div className="flex items-center gap-5 sm:gap-6">
                <div className="w-[36px] flex items-center justify-center shrink-0">
                  <span className="font-sans font-semibold text-[26px] text-white tracking-wide">
                    {nextLocale.toUpperCase()}
                  </span>
                </div>
                <span className="font-sans font-semibold text-[26px] sm:text-[30px] text-white tracking-[-0.01em] group-hover:text-[var(--color-cream)]/80 transition-colors">
                  {nextLocale === "uk" ? t("profileEdit.langUk") : t("profileEdit.langEn")}
                </span>
              </div>
            </Link>

            {/* 6. Theme toggle (Figma Node 2773:7091) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-between group py-2 cursor-pointer w-full text-left"
            >
              <div className="flex items-center gap-5 sm:gap-6">
                <div className="w-[36px] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" aria-hidden className="w-[30px] h-[30px]">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="1.5" />
                    <path d="M12 2 A10 10 0 0 0 12 22 Z" fill="white" />
                    <path d="M12 2 A10 10 0 0 1 12 22 Z" fill="rgba(255,255,255,0.35)" />
                  </svg>
                </div>
                <span className="font-sans font-semibold text-[26px] sm:text-[30px] text-white tracking-[-0.01em] group-hover:text-[var(--color-cream)]/80 transition-colors">
                  {theme === "ink-night" ? t("common.lightTheme") : t("common.darkTheme")}
                </span>
              </div>
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
