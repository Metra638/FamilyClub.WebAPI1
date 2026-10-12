"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MockOrderItem, OrderTabId } from "./mockData";
import ebookIcon from "@/public/images/userProfile/mobile-button-solid-full 1.png";
import audioIcon from "@/public/images/userProfile/volume-solid-full 1.png";
import printIcon from "@/public/images/userProfile/Паперова.svg";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";
import { translateListStatus } from "./orderStatusI18n";
import { useTheme } from "@/lib/theme/ThemeProvider";

interface OrderCardProps {
  item: MockOrderItem;
  activeTab: OrderTabId;
  onAction?: (actionName: string, itemId: string, dbOrderId?: number) => void;
}

export default function OrderCard({ item, activeTab, onAction }: OrderCardProps) {
  const router = useRouter();
  const t = useTranslations();
  const lp = useLocalizedPath();
  const { theme } = useTheme();
  const isNight = theme === "ink-night";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printIconSrc = typeof printIcon === "string" ? printIcon : (printIcon as any).src || "/images/userProfile/Паперова.svg";
  const ebookIconSrc = typeof ebookIcon === "string" ? ebookIcon : (ebookIcon as any).src || "/images/userProfile/mobile-button-solid-full 1.png";
  const audioIconSrc = typeof audioIcon === "string" ? audioIcon : (audioIcon as any).src || "/images/userProfile/volume-solid-full 1.png";

  const isCancelled = item.statusText === "Скасовано";
  const isReturned = item.statusText === "Повернено";
  const cardBgClass = isCancelled
    ? "bg-[color-mix(in_srgb,#C0392B_18%,var(--background-elevated))] border-[color-mix(in_srgb,#C0392B_35%,transparent)]"
    : isReturned
    ? "bg-[var(--color-menu-separator)] border-[var(--color-menu-separator)]"
    : "bg-[var(--color-menu-hover)] border-[var(--color-menu-separator)]";

  const displayStatus = translateListStatus(item.statusText, t);
  const displayDate =
    item.lastStatusDate === "Щойно" ? t("orders.justNow") : item.lastStatusDate;
  const priceLabel = t("cart.price").replace("{value}", String(item.price));

  const goToOrder = () => {
    if (item.dbOrderId) router.push(lp(`/orders/${item.dbOrderId}`));
  };

  const goToComplaints = () => {
    if (item.dbOrderId) {
      router.push(lp(`/complaints?orderId=${item.dbOrderId}`));
    } else {
      onAction && onAction("complain", item.id, item.dbOrderId);
    }
  };

  const formatLabel = (fmt: string) => {
    const f = String(fmt).toLowerCase();
    if (f === "ebook" || f.includes("елек")) return t("orders.formats.ebook");
    if (f === "audio" || f.includes("аудіо")) return t("orders.formats.audio");
    if (f === "print" || f.includes("папер") || f === "paper") return t("orders.formats.paper");
    return fmt;
  };

  const formatIcon = (fmt: string) => {
    const f = String(fmt).toLowerCase();
    if (f === "ebook" || f.includes("елек")) return "📱";
    if (f === "audio" || f.includes("аудіо")) return "🎧";
    return "📖";
  };

  const formatBadgeStyle = (fmt: string) => {
    const f = String(fmt).toLowerCase();
    if (f === "ebook" || f.includes("елек"))
      return "bg-[color-mix(in_srgb,#0277BD_16%,var(--background-elevated))] text-[#4FC3F7] border-[color-mix(in_srgb,#0277BD_30%,transparent)]";
    if (f === "audio" || f.includes("аудіо"))
      return "bg-[color-mix(in_srgb,#7B1FA2_16%,var(--background-elevated))] text-[#CE93D8] border-[color-mix(in_srgb,#7B1FA2_30%,transparent)]";
    return "bg-[color-mix(in_srgb,var(--color-green)_18%,transparent)] text-[var(--color-green)] border-[color-mix(in_srgb,var(--color-green)_45%,transparent)]";
  };

  const deleteBtn = (
    <button
      onClick={() => onAction && onAction("delete", item.id, item.dbOrderId)}
      className="bg-[#C0392B] hover:bg-[#A93226] text-white px-5 py-2.5 rounded-xl font-medium transition text-sm shadow-sm"
      title={t("orders.deleteAria")}
    >
      {t("orders.delete")}
    </button>
  );

  const complainBtn = (
    <button
      onClick={goToComplaints}
      className="bg-[var(--color-menu-hover)] hover:bg-[var(--color-menu-separator)] border border-[var(--color-menu-separator)] text-[var(--color-muted-fg)] hover:text-[var(--foreground-primary)] px-5 py-2.5 rounded-xl font-medium transition text-sm shadow-sm"
    >
      {t("orders.complain")}
    </button>
  );

  const cancelBtn = (
    <button
      onClick={() => onAction && onAction("cancel", item.id, item.dbOrderId)}
      className="bg-[#524B42] hover:bg-[#3D3730] text-white px-5 py-2.5 rounded-xl font-medium transition text-sm shadow-sm"
    >
      {t("orders.cancelOrder")}
    </button>
  );

  return (
    <div className={`${cardBgClass} rounded-3xl p-5 md:p-6 mb-6 shadow-md border transition-all hover:shadow-lg`}>
      {/* Card Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-3">
            <h3
              onClick={goToOrder}
              className="text-xl md:text-2xl font-bold tracking-tight cursor-pointer hover:underline"
              style={{ color: item.statusColor }}
              title={t("orders.viewDetails")}
            >
              {displayStatus}
            </h3>
            {item.dbOrderId && (
              <button
                onClick={goToOrder}
                className="text-xs font-bold text-[var(--color-green)] bg-[color-mix(in_srgb,var(--color-green)_18%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-green)_28%,transparent)] px-2.5 py-1 rounded-lg border border-[color-mix(in_srgb,var(--color-green)_45%,transparent)] transition"
              >
                {t("orders.viewDetails")}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold text-[var(--foreground-primary)]">{item.orderNumber}</span>
            <button
              onClick={handleCopy}
              className="text-[var(--color-muted-fg)] hover:text-[var(--foreground-primary)] transition p-1"
              title={t("orders.copyOrderNumber")}
            >
              {copied ? (
                <span className="text-xs text-[var(--color-green)] font-bold">{t("orders.copied")}</span>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="text-xs md:text-sm text-[var(--color-muted-fg)] md:text-right font-medium">
          {t("orders.lastStatusDate")} <br className="hidden md:inline" />
          <span className="text-[var(--foreground-primary)] font-semibold">{displayDate}</span>
        </div>
      </div>

      {/* Inner Book Item Card (Ragged Paper Style) */}
      <div className="bg-[var(--background-elevated)] rounded-2xl p-4 my-4 shadow-sm border border-[var(--color-menu-separator)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        {/* Left Side: Format Bookmark & Cover & Info */}
        <div className="flex items-center gap-4">
          {/* Format Bookmark Badge */}
          <div className="flex flex-col gap-2 items-center justify-center bg-[var(--color-menu-separator)] px-2 py-2.5 rounded-r-lg -ml-4 self-stretch min-w-[32px]">
            {item.formats.includes("print") && (
              <img src={printIconSrc} alt="print" className="w-4 h-auto object-contain" style={{ width: "auto", height: "auto", maxHeight: "18px", filter: isNight ? "brightness(0) invert(0.88)" : undefined }} />
            )}
            {item.formats.includes("ebook") && (
              <img src={ebookIconSrc} alt="ebook" className="w-3.5 h-auto object-contain" style={{ width: "auto", height: "auto", maxHeight: "16px", filter: isNight ? "brightness(0) invert(0.88)" : undefined }} />
            )}
            {item.formats.includes("audio") && (
              <img src={audioIconSrc} alt="audio" className="w-3.5 h-auto object-contain" style={{ width: "auto", height: "auto", maxHeight: "16px", filter: isNight ? "brightness(0) invert(0.88)" : undefined }} />
            )}
          </div>

          {/* Book Cover */}
          <div className="w-[65px] h-[95px] relative rounded overflow-hidden shadow shrink-0 border border-[var(--color-menu-separator)] bg-[var(--background-elevated)] flex items-center justify-center">
            <img
              src={item.bookImage || "/images/catalog/hunger_games.png"}
              alt={item.bookTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/catalog/hunger_games.png";
              }}
            />
          </div>

          {/* Book Title, Qty & Formats */}
          <div className="flex flex-col gap-1">
            <h4 className="text-lg md:text-xl font-bold text-[var(--foreground-primary)] leading-snug">
              {item.bookTitle}
            </h4>

            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="text-xs font-semibold text-[var(--color-muted-fg)] bg-[var(--color-menu-hover)] px-2.5 py-0.5 rounded-full border border-[var(--color-menu-separator)]">
                {t("orders.qty").replace("{count}", String(item.quantity))}
              </span>

              {item.formats && item.formats.map((fmt, idx) => (
                <span
                  key={idx}
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1 shadow-2xs ${formatBadgeStyle(fmt)}`}
                >
                  <span>{formatIcon(fmt)}</span> {formatLabel(fmt)}
                </span>
              ))}
            </div>

            {/* Optional Confirm Receipt Button inside Book Card */}
            {item.showConfirmReceiptBtn && (
              <button
                onClick={() => onAction && onAction("confirm_receipt", item.id, item.dbOrderId)}
                className="mt-2.5 px-4 py-1.5 rounded-full border-2 border-[var(--color-green)] text-[var(--color-green)] font-semibold hover:bg-[var(--color-green)] hover:text-white transition text-xs sm:text-sm w-fit shadow-sm"
              >
                {t("orders.confirmReceipt")}
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Price */}
        <div className="text-xl sm:text-2xl font-bold text-[var(--foreground-primary)] self-end sm:self-center">
          {priceLabel}
        </div>
      </div>

      {/* Card Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-3 mt-4 pt-1">
        {activeTab === "waiting_payment" && (
          <>
            <button
              onClick={() => onAction && onAction("pay_order", item.id, item.dbOrderId)}
              className="bg-[var(--color-green)] hover:bg-[color-mix(in_srgb,var(--color-green)_85%,black)] text-white px-6 py-2.5 rounded-xl font-bold transition text-sm shadow-md"
            >
              {t("orders.payOrder")}
            </button>
            {cancelBtn}
            {complainBtn}
            {deleteBtn}
          </>
        )}

        {(activeTab === "waiting_dispatch" || activeTab === "order_sent") && (
          <>
            {cancelBtn}
            {complainBtn}
            {deleteBtn}
          </>
        )}

        {activeTab === "add_review" && (
          <>
            <button
              onClick={() => onAction && onAction("write_review", item.id, item.dbOrderId)}
              className="bg-[#524B42] hover:bg-[#3D3730] text-white px-5 py-2.5 rounded-xl font-medium transition text-sm shadow-sm"
            >
              {t("orders.writeReview")}
            </button>
            {complainBtn}
            {deleteBtn}
          </>
        )}

        {activeTab === "returns" && (
          <>
            <button
              onClick={() => onAction && onAction("return", item.id, item.dbOrderId)}
              className="bg-[#524B42] hover:bg-[#3D3730] text-white px-5 py-2.5 rounded-xl font-medium transition text-sm shadow-sm"
            >
              {t("orders.returnItem")}
            </button>
            {complainBtn}
            {deleteBtn}
          </>
        )}

        {activeTab === "history" && (
          <>
            {complainBtn}
            {deleteBtn}
          </>
        )}
      </div>
    </div>
  );
}
