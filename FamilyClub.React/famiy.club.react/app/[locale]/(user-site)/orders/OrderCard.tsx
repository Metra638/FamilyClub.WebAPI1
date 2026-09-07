"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MockOrderItem, OrderTabId } from "./mockData";
import ebookIcon from "@/public/images/userProfile/mobile-button-solid-full 1.png";
import audioIcon from "@/public/images/userProfile/volume-solid-full 1.png";
import printIcon from "@/public/images/userProfile/Паперова.svg";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";
import { translateListStatus } from "./orderStatusI18n";

interface OrderCardProps {
  item: MockOrderItem;
  activeTab: OrderTabId;
  onAction?: (actionName: string, itemId: string, dbOrderId?: number) => void;
}

export default function OrderCard({ item, activeTab, onAction }: OrderCardProps) {
  const router = useRouter();
  const t = useTranslations();
  const lp = useLocalizedPath();
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
    ? "bg-[#E3C8C4] border-[#D1AFA9]"
    : isReturned
    ? "bg-[#C2BCB1] border-[#B0AAA0]"
    : "bg-[#D8D3C8] border-[#C8C2B4]";

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
    if (f === "ebook" || f.includes("елек")) return "bg-[#E3F2FD] text-[#0277BD] border-[#B3E5FC]";
    if (f === "audio" || f.includes("аудіо")) return "bg-[#F3E5F5] text-[#7B1FA2] border-[#E1BEE7]";
    return "bg-[#E2F0D9] text-[#005b33] border-[#B8E0A4]";
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
      className="bg-[#E5E0D5] hover:bg-[#D8D2C5] border border-[#C8C2B4] text-[#777777] hover:text-black px-5 py-2.5 rounded-xl font-medium transition text-sm shadow-sm"
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
                className="text-xs font-bold text-[#005b33] bg-[#E2F0D9] hover:bg-[#D4EACC] px-2.5 py-1 rounded-lg border border-[#B8E0A4] transition"
              >
                {t("orders.viewDetails")}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold text-[#242424]">{item.orderNumber}</span>
            <button
              onClick={handleCopy}
              className="text-[#555555] hover:text-black transition p-1"
              title={t("orders.copyOrderNumber")}
            >
              {copied ? (
                <span className="text-xs text-green-700 font-bold">{t("orders.copied")}</span>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="text-xs md:text-sm text-[#555555] md:text-right font-medium">
          {t("orders.lastStatusDate")} <br className="hidden md:inline" />
          <span className="text-[#242424] font-semibold">{displayDate}</span>
        </div>
      </div>

      {/* Inner Book Item Card (Ragged Paper Style) */}
      <div className="bg-[#F7F5F0] rounded-2xl p-4 my-4 shadow-sm border border-[#E0DBD2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        {/* Left Side: Format Bookmark & Cover & Info */}
        <div className="flex items-center gap-4">
          {/* Format Bookmark Badge */}
          <div className="flex flex-col gap-2 items-center justify-center bg-[#C8C2B4] px-2 py-2.5 rounded-r-lg -ml-4 self-stretch min-w-[32px]">
            {item.formats.includes("print") && (
              <img src={printIconSrc} alt="print" className="w-4 h-auto object-contain" style={{ width: "auto", height: "auto", maxHeight: "18px" }} />
            )}
            {item.formats.includes("ebook") && (
              <img src={ebookIconSrc} alt="ebook" className="w-3.5 h-auto object-contain" style={{ width: "auto", height: "auto", maxHeight: "16px" }} />
            )}
            {item.formats.includes("audio") && (
              <img src={audioIconSrc} alt="audio" className="w-3.5 h-auto object-contain" style={{ width: "auto", height: "auto", maxHeight: "16px" }} />
            )}
          </div>

          {/* Book Cover */}
          <div className="w-[65px] h-[95px] relative rounded overflow-hidden shadow shrink-0 border border-gray-200 bg-white flex items-center justify-center">
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
            <h4 className="text-lg md:text-xl font-bold text-[#242424] leading-snug">
              {item.bookTitle}
            </h4>

            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="text-xs font-semibold text-[#555555] bg-[#EBE7DD] px-2.5 py-0.5 rounded-full border border-[#D5CFCE]">
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
                className="mt-2.5 px-4 py-1.5 rounded-full border-2 border-[#005b33] text-[#005b33] font-semibold hover:bg-[#005b33] hover:text-white transition text-xs sm:text-sm w-fit shadow-sm"
              >
                {t("orders.confirmReceipt")}
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Price */}
        <div className="text-xl sm:text-2xl font-bold text-[#242424] self-end sm:self-center">
          {priceLabel}
        </div>
      </div>

      {/* Card Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-3 mt-4 pt-1">
        {activeTab === "waiting_payment" && (
          <>
            <button
              onClick={() => onAction && onAction("pay_order", item.id, item.dbOrderId)}
              className="bg-[#005b33] hover:bg-[#004727] text-white px-6 py-2.5 rounded-xl font-bold transition text-sm shadow-md"
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
