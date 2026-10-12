"use client";

import { alertWarning } from "@/lib/ui/sweetAlert";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormatType } from "@/lib/hooks/useCart";
import type { ProductDto, AuthorDTO, FormatDto } from "@/lib/api/generated";
import { Availability } from "@/lib/api/generated";
import { getProductCoverUrl } from "@/lib/products/productCoverUrl";
import { favoriteService } from "@/lib/api/services";
import { getAuthToken, getAuthUserId } from "@/lib/auth/tokenStorage";
import { usePaws } from "@/app/(user-site)/paws/hooks/usePaws";
import { useLocale, useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";
import { useTheme } from "@/lib/theme/ThemeProvider";

export interface MobileCartViewProps {
  cartItems: Array<{
    productId: number;
    formatQuantities: { paper: number; ebook: number; audio: number };
  }>;
  productById: Map<number, ProductDto>;
  authorById: Map<number, AuthorDTO>;
  formatById: Map<number, FormatDto>;
  subtotal: number;
  discount: number;
  deliveryCost: number;
  updateFormatQuantity: (productId: number, format: FormatType, qty: number) => void;
  removeFromCart: (productId: number) => void;
  loading: boolean;
  fetchError: boolean;
}

function getImageSrc(product: ProductDto): string | null {
  return getProductCoverUrl(product);
}

function getAuthorLabel(authorIds?: Array<number> | null, authorById?: Map<number, AuthorDTO>): string | null {
  if (!authorIds || !authorById) return null;
  const names = authorIds
    .map((id) => authorById.get(id)?.authorName)
    .filter((name): name is string => Boolean(name));
  return names.length ? names.join(", ") : null;
}

const FORMAT_ICONS: Record<FormatType, { bg: string; icon: string; labelKey: string }> = {
  paper: {
    bg: "/images/main_page/icons/rec-icon-paper-bg.svg",
    icon: "/images/main_page/icons/rec-icon-paper.svg",
    labelKey: "cart.formatPaper",
  },
  ebook: {
    bg: "/images/main_page/icons/rec-icon-ebook-bg.svg",
    icon: "/images/main_page/icons/rec-icon-ebook.svg",
    labelKey: "cart.formatEbook",
  },
  audio: {
    bg: "/images/main_page/icons/rec-icon-audio-bg.svg",
    icon: "/images/main_page/icons/rec-icon-audio.svg",
    labelKey: "cart.formatAudio",
  },
};

export default function MobileCartView({
  cartItems,
  productById,
  authorById,
  subtotal,
  discount,
  deliveryCost,
  updateFormatQuantity,
  removeFromCart,
  loading,
  fetchError,
}: MobileCartViewProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = useTranslations();
  const lp = useLocalizedPath();
  const { theme } = useTheme();
  const isNight = theme === "ink-night";
  const [agreed, setAgreed] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [pawsApplied, setPawsApplied] = useState(false);
  const userId =
    typeof window !== "undefined" ? getAuthUserId() ?? undefined : undefined;
  const { paws: pawsBalance, discountInUah: pawsDiscountFromHook } = usePaws(
    userId
  );

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        const resFav = await favoriteService
          .apiFavoritesGet({
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => null);
        if (Array.isArray(resFav)) {
          const favIds = new Set<number>();
          resFav.forEach((f) => {
            const id = f.id;
            if (id) favIds.add(Number(id));
          });
          setFavorites(favIds);
        }
      } catch (error) {
        console.warn("MobileCart: failed to load favorites", error);
      }
    };

    fetchFavorites();
  }, []);

  const handleToggleFavorite = async (productId: number) => {
    const token = getAuthToken();
    const isAlreadyFav = favorites.has(productId);

    try {
      const newFavs = new Set(favorites);
      if (isAlreadyFav) {
        newFavs.delete(productId);
      } else {
        newFavs.add(productId);
      }
      setFavorites(newFavs);

      if (token) {
        if (isAlreadyFav) {
          await favoriteService.apiFavoritesProductIdDelete(
            { productId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          await favoriteService.apiFavoritesProductIdPost(
            { productId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }
    } catch (error) {
      console.warn("MobileCart: toggle favorite failed", error);
    }
  };

  const pawsDiscountAmount = Math.min(
    pawsDiscountFromHook,
    Math.max(0, subtotal - discount)
  );
  const totalDiscount = discount + (pawsApplied ? pawsDiscountAmount : 0);
  const effectiveDelivery = subtotal > 0 ? deliveryCost : 0;
  const totalToPay = subtotal > 0 ? Math.max(0, subtotal - totalDiscount + effectiveDelivery) : 0;
  const hasItems = cartItems.length > 0;
  const formatPrice = (value: number) => {
    const formatted = new Intl.NumberFormat(locale === "uk" ? "uk-UA" : "en-US").format(value);
    return t("cart.price").replace("{value}", formatted);
  };

  return (
    <div className="w-full min-h-screen bg-[var(--color-wood)] pt-[110px] pb-10 select-none font-['Source_Sans_3',sans-serif] text-[var(--foreground-primary)] overflow-x-hidden">
      {/* Заголовок */}
      <h1 className="font-['Lora',serif] font-semibold text-[24px] sm:text-[26px] text-[var(--foreground-primary)] text-center tracking-[-0.264px] mb-6 px-4">
        {t("cart.title")}
      </h1>

      {/* Контент верхньої частини кошика (карточки товарів) */}
      <div className="px-3 sm:px-4 w-full max-w-[430px] mx-auto">
        {loading ? (
          <div className="bg-[var(--background-elevated)] rounded-[9px] shadow-[var(--shadow-card)] p-8 text-center my-6 flex flex-col items-center justify-center">
            <span className="text-3xl mb-2 animate-spin">⏳</span>
            <p className="text-[16px] text-[var(--foreground-primary)]">{t("cart.loadingCart")}</p>
          </div>
        ) : fetchError && !hasItems ? (
          <div className="bg-[var(--background-elevated)] rounded-[9px] shadow-[var(--shadow-card)] p-8 text-center my-6 flex flex-col items-center justify-center">
            <span className="text-3xl mb-2">⚠️</span>
            <p className="text-[16px] text-[var(--foreground-primary)] mb-4">{t("cart.loadError")}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-full bg-[var(--color-green)] text-white font-medium hover:bg-[color-mix(in_srgb,var(--color-green)_85%,black)] transition"
            >
              {t("cart.retry")}
            </button>
          </div>
        ) : !hasItems ? (
          <div className="bg-[var(--background-elevated)] rounded-[9px] shadow-[var(--shadow-card)] p-8 text-center my-6 flex flex-col items-center justify-center">
            <span className="text-5xl mb-3">🛒</span>
            <h3 className="text-xl font-bold text-[var(--foreground-primary)] mb-2 font-['Lora',serif]">{t("cart.empty")}</h3>
            <p className="text-sm text-[var(--color-muted-fg)] mb-6">
              {t("cart.emptyHint")}
            </p>
            <Link
              href={lp("/categories")}
              className="px-7 py-3 rounded-full bg-[var(--color-green)] text-white font-medium hover:bg-[color-mix(in_srgb,var(--color-green)_85%,black)] transition shadow-sm"
            >
              {t("orders.goToCatalog")}
            </Link>
          </div>
        ) : (
          cartItems.map((item) => {
            const product = productById.get(item.productId);
            if (!product) return null;

            const title = product.productName ?? t("catalog.untitled");
            const author = getAuthorLabel(product.authorIds, authorById);
            const imageSrc = getImageSrc(product);
            const isAvailable =
              product.availability !== Availability.NUMBER_2 && (product.quantityInStock ?? 0) > 0;
            const unitPrice = product.discountPrice ?? product.price ?? 0;
            const isFav = favorites.has(item.productId);

            return (
              <div
                key={item.productId}
                className="relative w-full bg-[var(--background-elevated)] rounded-[9px] p-3.5 sm:p-4 shadow-[var(--shadow-card)] mb-6 transition-transform"
              >
                {/* Верхня частина карточки: обкладинка, назва, автор, кнопки улюбленого та видалення */}
                <div className="flex items-start">
                  {/* Обкладинка */}
                  <Link
                    href={lp(`/products/${item.productId}`)}
                    className="relative w-[85px] sm:w-[95px] h-[130px] sm:h-[145px] shrink-0 rounded-[6px] overflow-hidden bg-[var(--background-elevated)] shadow-sm flex items-center justify-center block"
                  >
                    <img
                      src={imageSrc || "/images/catalog/hunger_games.png"}
                      alt={title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/catalog/hunger_games.png";
                      }}
                    />
                  </Link>

                  {/* Інформація про книгу */}
                  <div className="flex-1 ml-3.5 sm:ml-4 flex flex-col justify-between self-stretch py-0.5">
                    <div>
                      <Link href={lp(`/products/${item.productId}`)} className="block">
                        <h3 className="text-[16px] sm:text-[17px] font-semibold text-[var(--foreground-primary)] leading-[1.3] line-clamp-2">
                          {title}
                        </h3>
                      </Link>
                      <p className="text-[14px] text-[var(--color-muted-fg)] leading-[1.3] mt-1 line-clamp-1">
                        {author ?? t("product.authorNotSpecified")}
                      </p>
                      <p
                        className={`text-[14px] font-medium leading-[1.3] mt-1 ${
                          isAvailable ? "text-[var(--color-green)]" : "text-[#c81e1e]"
                        }`}
                      >
                        {isAvailable ? t("cart.inStock") : t("cart.outOfStock")}
                      </p>
                    </div>

                    {/* Кнопки вподобайки та видалення */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(item.productId)}
                        aria-label={t("cart.addToFavoritesAria")}
                        className="w-[38px] h-[38px] flex items-center justify-center rounded-full hover:bg-[color-mix(in_srgb,var(--foreground-primary)_5%,transparent)] active:scale-90 transition text-[var(--foreground-primary)]"
                      >
                        <img
                          src="/images/main_page/icons/rec-icon-favorite.svg"
                          alt=""
                          className={`w-[24px] h-[24px] object-contain transition-transform ${
                            isFav ? "scale-110 filter brightness-90 sepia-[0.3] hue-rotate-[320deg] saturate-[5]" : ""
                          }`}
                          style={!isFav && isNight ? { filter: "brightness(0) invert(0.88)" } : undefined}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        aria-label={t("cart.removeAria")}
                        className="w-[38px] h-[38px] flex items-center justify-center rounded-full hover:bg-[color-mix(in_srgb,var(--foreground-primary)_5%,transparent)] active:scale-90 transition text-[var(--color-muted-fg)] hover:text-red-600 ml-auto"
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="w-[24px] h-[24px]">
                          <path
                            d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Нижня частина: 3 рядки форматів (Паперова, eBooks, Аудіо книга) */}
                <div className="mt-4 pt-3 border-t border-[color-mix(in_srgb,var(--foreground-primary)_12%,transparent)] flex flex-col gap-3.5">
                  {(["paper", "ebook", "audio"] as FormatType[]).map((type) => {
                    const cfg = FORMAT_ICONS[type];
                    const formatLabel = t(cfg.labelKey);
                    const qty = item.formatQuantities[type] || 0;
                    const linePrice = qty * unitPrice;

                    return (
                      <div key={type} className="flex items-center justify-between">
                        {/* Бейдж формату */}
                        <div className="relative w-[32px] sm:w-[36px] h-[28px] sm:h-[30px] shrink-0 flex items-center justify-center">
                          <img src={cfg.bg} alt={formatLabel} className="absolute inset-0 w-full h-full object-fill" />
                          <img
                            src={cfg.icon}
                            alt=""
                            className="absolute left-[5px] top-[4px] sm:top-[5px] w-[16px] sm:w-[18px] h-[16px] sm:h-[18px] object-contain"
                          />
                        </div>

                        {/* Контроли кількості */}
                        <div className="flex items-center gap-3 sm:gap-4 ml-2 sm:ml-4">
                          <button
                            type="button"
                            onClick={() => updateFormatQuantity(item.productId, type, Math.max(0, qty - 1))}
                            aria-label={t("cart.decreaseQtyAria").replace("{format}", formatLabel)}
                            className="w-7 h-7 flex items-center justify-center text-[var(--foreground-primary)] active:scale-90 transition font-bold"
                          >
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                              <path d="M5 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </button>

                          <div className="w-[30px] sm:w-[34px] h-[28px] sm:h-[30px] bg-[var(--background-elevated)] rounded-[7px] shadow-[var(--shadow-control)] flex items-center justify-center text-[17px] sm:text-[18px] font-medium text-[var(--foreground-primary)]">
                            {qty}
                          </div>

                          <button
                            type="button"
                            onClick={() => updateFormatQuantity(item.productId, type, qty + 1)}
                            aria-label={t("cart.increaseQtyAria").replace("{format}", formatLabel)}
                            className="w-7 h-7 flex items-center justify-center text-[var(--foreground-primary)] active:scale-90 transition font-bold"
                          >
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                              <path d="M11 5V17M5 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>

                        {/* Ціна рядка формату */}
                        <span className="text-[18px] sm:text-[20px] font-semibold text-[var(--foreground-primary)] text-right min-w-[70px] ml-auto">
                          {formatPrice(linePrice)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* Віджет балансу лапок (показується тільки коли є товари) */}
        {hasItems && (
          <>
            <div className="w-full max-w-[260px] sm:max-w-[280px] h-[44px] bg-[var(--color-wood)] mx-auto rounded-[25px] flex items-center justify-between px-4 shadow-md mb-6 text-[var(--foreground-primary)]">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl select-none">🐾</span>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[12px] text-[var(--color-muted-fg)] font-semibold">{t("orders.pawsLabel")}</span>
                  <span className="text-[14px] font-bold text-[var(--foreground-primary)] mt-0.5">{pawsBalance}</span>
                </div>
              </div>
              <div className="text-[var(--color-muted-fg)] font-bold">→</div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[12px] text-[var(--color-muted-fg)] font-semibold">{t("orders.discountLabel")}</span>
                  <span className="text-[14px] font-bold text-[var(--foreground-primary)] mt-0.5">{formatPrice(pawsDiscountAmount)}</span>
                </div>
                <img
                  src="/images/header/account_balance_wallet_24px.svg"
                  alt={t("cart.walletAlt")}
                  className="w-[28px] h-[28px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPawsApplied(!pawsApplied)}
              className="block w-fit mx-auto px-7 py-2.5 rounded-[9px] bg-[color-mix(in_srgb,var(--color-green)_55%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-green)_70%,transparent)] active:scale-95 transition-all text-[var(--color-cream)] text-[16px] font-normal shadow-sm cursor-pointer mb-8 select-none"
            >
              {pawsApplied ? t("cart.cancelPoints") : t("cart.applyPoints")}
            </button>
          </>
        )}
      </div>

      {/* Нижній кремовий блок підсумку (завжди відображається, коли кошик завантажений) */}
      {hasItems && (
        <div className="relative w-full bg-[var(--background-elevated)] pt-6 pb-[130px] px-4 sm:px-6 shadow-[0_-8px_25px_color-mix(in_srgb,var(--foreground-primary)_20%,transparent)] rounded-t-[14px]">
          {/* Торцевий відривний папір на межі блоків */}
          <div
            className="absolute -top-[12px] left-0 right-0 h-[12px] pointer-events-none overflow-hidden"
            style={{
              background: "radial-gradient(circle, transparent, transparent 4px, var(--background-elevated) 4px, var(--background-elevated))",
              backgroundSize: "16px 16px",
              backgroundPosition: "0 6px",
            }}
          />

          {/* Підсумок замовлення */}
          <div className="flex flex-col gap-3 w-full max-w-[392px] mx-auto text-[var(--foreground-primary)]">
            <div className="flex items-center justify-between">
              <span className="text-[18px] sm:text-[20px] text-[var(--color-muted-fg)] font-normal">{t("cart.subtotal")}</span>
              <span className="text-[18px] sm:text-[20px] font-semibold text-[var(--foreground-primary)]">
                {formatPrice(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[18px] sm:text-[20px] text-[var(--color-muted-fg)] font-normal">{t("cart.discount")}</span>
              <span className="text-[18px] sm:text-[20px] font-semibold text-[#c81e1e]">
                {totalDiscount > 0 ? `- ${formatPrice(totalDiscount)}` : t("cart.zeroPrice")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[18px] sm:text-[20px] text-[var(--color-muted-fg)] font-normal">{t("cart.delivery")}</span>
              <span className="text-[18px] sm:text-[20px] font-semibold text-[var(--foreground-primary)]">
                {formatPrice(deliveryCost)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[18px] sm:text-[20px] text-[var(--color-muted-fg)] font-normal">{t("cart.total")}</span>
              <span className="text-[22px] sm:text-[24px] font-bold text-[#c81e1e]">
                {formatPrice(totalToPay)}
              </span>
            </div>
          </div>

          {/* Розділювач */}
          <div className="w-full max-w-[392px] mx-auto border-b border-[var(--color-menu-hover)] my-5" />

          {/* Чекбокс угоди користувача */}
          <div className="flex items-start gap-3 w-full max-w-[392px] mx-auto mb-6">
            <button
              type="button"
              onClick={() => setAgreed(!agreed)}
              className="w-[36px] sm:w-[40px] h-[36px] sm:h-[40px] shrink-0 flex items-center justify-center relative cursor-pointer active:scale-90 transition"
              aria-label={t("cart.agreeAria")}
            >
              {agreed ? (
                <div className="w-[28px] h-[28px] rounded-full bg-[var(--color-green)] border-2 border-[var(--color-green)] flex items-center justify-center shadow-xs transition-all">
                  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-white stroke-white stroke-2">
                    <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              ) : (
                <div className="w-[28px] h-[28px] rounded-full border-2 border-[var(--foreground-primary)] hover:border-[var(--color-green)] transition-colors bg-[color-mix(in_srgb,var(--background-elevated)_50%,transparent)]" />
              )}
            </button>
            <p className="text-[14px] sm:text-[15px] text-[var(--foreground-primary)] leading-[1.4] pt-1.5 select-none">
              {t("cart.agreePrefix")}{" "}
              <Link href={lp("/personal-data-protection")} className="text-[var(--color-green)] font-medium hover:underline">
                {t("cart.privacyPolicy")}
              </Link>{" "}
              {t("cart.agreeAnd")}{" "}
              <Link href={lp("/terms-of-use")} className="text-[var(--color-green)] font-medium hover:underline">
                {t("cart.termsOfService")}
              </Link>
            </p>
          </div>

          {/* Промокод */}
          <div className="flex flex-col gap-2.5 w-full max-w-[392px] mx-auto mb-7">
            <label htmlFor="mobile-promo-code" className="text-[18px] sm:text-[20px] font-normal text-[var(--foreground-primary)]">
              {t("cart.hasPromo")}
            </label>
            <div className="w-full bg-[var(--background-elevated)] rounded-[9px] shadow-[var(--shadow-input)] flex items-center px-4 py-2.5 border border-transparent focus-within:border-[var(--color-green)] transition">
              <input
                id="mobile-promo-code"
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder={t("cart.promoPlaceholder")}
                aria-label={t("cart.promoAria")}
                className="w-full bg-transparent text-[16px] sm:text-[18px] text-[var(--foreground-primary)] placeholder:text-[var(--color-muted-fg)] focus:outline-none"
              />
            </div>
          </div>

          {/* Кнопка оформлення замовлення */}
          <button
            type="button"
            disabled={subtotal === 0}
            onClick={async () => {
              if (!agreed) {
                await alertWarning(t("cart.agreeWarning"));
                return;
              }
              router.push(lp("/checkout"));
            }}
            className={`w-full max-w-[392px] mx-auto py-3.5 px-6 rounded-[60px] font-medium text-[18px] sm:text-[20px] text-white text-center transition-all shadow-md flex items-center justify-center ${
              subtotal > 0
                ? "bg-[var(--color-green)] hover:bg-[color-mix(in_srgb,var(--color-green)_85%,black)] active:scale-[0.98] cursor-pointer"
                : "bg-[color-mix(in_srgb,var(--color-green)_50%,transparent)] cursor-not-allowed"
            }`}
          >
            {t("cart.checkout")}
          </button>
        </div>
      )}
    </div>
  );
}
