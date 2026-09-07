"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MockOrderItem, OrderTabId, ORDERS_TABS } from "./mockData";
import OrdersPagination from "./OrdersPagination";
import printIcon from "@/public/images/userProfile/Паперова.svg";
import ebookIcon from "@/public/images/userProfile/mobile-button-solid-full 1.png";
import audioIcon from "@/public/images/userProfile/volume-solid-full 1.png";
import { useLocale, useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

interface MobileOrdersViewProps {
  ordersByTab: Record<OrderTabId, MockOrderItem[]>;
  activeTab: OrderTabId;
  setActiveTab: (tab: OrderTabId) => void;
  counts: Record<OrderTabId, number>;
  loading: boolean;
  onAction: (actionName: string, itemId: string, dbOrderId?: number) => void;
  paws?: number;
  discount?: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  currentItems: MockOrderItem[];
}

export default function MobileOrdersView({
  activeTab,
  setActiveTab,
  counts,
  loading,
  onAction,
  paws = 0,
  currentPage,
  totalPages,
  onPageChange,
  currentItems,
}: MobileOrdersViewProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = useTranslations();
  const lp = useLocalizedPath();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const printIconSrc =
    typeof printIcon === "string"
      ? printIcon
      : printIcon.src || "/images/userProfile/Паперова.svg";
  const ebookIconSrc =
    typeof ebookIcon === "string"
      ? ebookIcon
      : ebookIcon.src || "/images/userProfile/mobile-button-solid-full 1.png";
  const audioIconSrc =
    typeof audioIcon === "string"
      ? audioIcon
      : audioIcon.src || "/images/userProfile/volume-solid-full 1.png";

  const handleCopy = (orderNumber: string, id: string) => {
    navigator.clipboard.writeText(orderNumber);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const localizedStatus = (status: string) => {
    const normalized = status.trim().toLowerCase();
    const statusKey =
      normalized === "оформлено" || normalized === "placed"
        ? "placed"
        : normalized === "очікувана" || normalized === "awaiting"
          ? "awaiting"
          : normalized === "відправлено" || normalized === "shipped"
            ? "shipped"
            : normalized === "доставлено" || normalized === "delivered"
              ? "delivered"
              : normalized === "повернення" || normalized === "returning"
                ? "returning"
                : normalized === "скасовано" || normalized === "cancelled"
                  ? "cancelled"
                  : normalized === "повернено" || normalized === "returned"
                    ? "returned"
                    : null;

    return statusKey ? t(`orders.status.${statusKey}`) : status;
  };

  const formatPrice = (value: number) => {
    const formatted = new Intl.NumberFormat(locale === "uk" ? "uk-UA" : "en-US").format(value);
    return t("cart.price").replace("{value}", formatted);
  };

  const getTabSvg = (id: OrderTabId) => {
    switch (id) {
      case "waiting_payment":
        return (
          <svg className="w-5 h-5 mb-0.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "waiting_dispatch":
        return (
          <svg className="w-5 h-5 mb-0.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case "order_sent":
        return (
          <svg className="w-5 h-5 mb-0.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        );
      case "add_review":
        return (
          <svg className="w-5 h-5 mb-0.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        );
      case "returns":
        return (
          <svg className="w-5 h-5 mb-0.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case "history":
        return (
          <svg className="w-5 h-5 mb-0.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="block md:hidden min-h-screen bg-[#c7a381] pt-[110px] pb-[85px] px-3 font-['Source_Sans_Pro',sans-serif]">
      {/* Mobile Page Title & Back & Balance */}
      <div className="flex items-center justify-between py-3 px-1 w-full max-w-[392px] mx-auto">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-[36px] h-[36px] rounded-full bg-[#f5f3ee]/60 hover:bg-[#f5f3ee] transition-colors flex items-center justify-center text-[#242424] text-[18px] shadow-sm active:scale-95"
            aria-label={t("orders.backAria")}
          >
            ←
          </button>
          <h1 className="text-[24px] sm:text-[26px] font-bold text-[#242424] tracking-[-0.01em] font-sans">
            {t("orders.title")}
          </h1>
        </div>
        {paws > 0 && (
          <div className="flex items-center gap-1.5 bg-[#ECE8DE]/95 px-3 py-1 rounded-full border border-[#DCD7CC] shadow-sm text-xs">
            <span className="text-sm">🐾</span>
            <span className="font-bold text-[#242424] text-[13px]">{paws}</span>
          </div>
        )}
      </div>

      {/* Ribbon Tabs Bar (Horizontal scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 pt-1 px-1 w-full max-w-[392px] mx-auto">
        {ORDERS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const countVal = counts ? counts[tab.id] : tab.count;
          return (
            <div key={tab.id} className="relative min-w-[95px] max-w-[110px] flex-shrink-0 flex flex-col items-center">
              <button
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex flex-col items-center justify-start pt-3 px-1.5 transition-all duration-300 transform ${
                  isActive
                    ? "bg-[#004e2B] pb-7 shadow-md translate-y-0.5"
                    : "bg-[#006338] pb-5 hover:bg-[#005430]"
                }`}
                style={{
                  clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)",
                }}
              >
                {getTabSvg(tab.id)}
                <span className="text-white text-[11px] font-medium text-center leading-tight mt-1 px-0.5 line-clamp-1">
                  {t(`orders.tabs.${tab.id}`)}
                </span>
              </button>

              {countVal !== undefined && countVal > 0 && (
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-[#F5F3EE] text-[#004e2B] rounded-full flex items-center justify-center text-[11px] font-bold shadow-sm border border-[#004e2B] z-10">
                  {countVal}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Informational Notice */}
      {(activeTab === "add_review" || activeTab === "returns" || activeTab === "history") && (
        <div className="text-center text-[13px] font-semibold text-[#242424] mb-4 bg-white/75 backdrop-blur-sm py-2 px-4 rounded-xl max-w-[392px] mx-auto shadow-sm border border-white/40">
          {t("orders.autoRemoveNote")}
        </div>
      )}

      {/* Orders List / Cards */}
      <div className="w-full max-w-[392px] mx-auto flex flex-col gap-5">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-9 h-9 border-4 border-[#005b33] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="bg-[#e3be9b]/95 backdrop-blur-sm rounded-[15px] p-8 text-center border border-[#B7895E]/50 shadow-md my-4">
            <span className="text-4xl block mb-2">📦</span>
            <h3 className="text-lg font-bold text-[#242424] mb-1">{t("orders.emptyTitle")}</h3>
            <p className="text-xs text-[#242424]/70">
              {t("orders.emptyText")}
            </p>
          </div>
        ) : (
          currentItems.map((item) => {
            const normalizedStatus = item.statusText.trim().toLowerCase();
            const isCancelled = normalizedStatus === "скасовано" || normalizedStatus === "cancelled";
            const isReturned = normalizedStatus === "повернено" || normalizedStatus === "returned";
            const outerBgClass = isCancelled
              ? "bg-[#E3C8C4] border-[#D1AFA9]"
              : isReturned
              ? "bg-[#C2BCB1] border-[#B0AAA0]"
              : "bg-[#e3be9b] border-transparent";

            return (
              <div
                key={item.id}
                className={`${outerBgClass} rounded-[15px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.5)] p-3.5 sm:p-4 border transition-all flex flex-col justify-between relative`}
              >
                {/* Top Row: Status, Number, Copy & Last Status Date */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-col gap-0.5">
                    <h3
                      className="font-semibold text-[20px] leading-tight tracking-[-0.22px]"
                      style={{ color: item.statusColor || "#005b33" }}
                    >
                      {localizedStatus(item.statusText)}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-semibold text-[14px] text-[#242424] tracking-[-0.154px]">
                        {item.orderNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.orderNumber, item.id)}
                        className="p-1 text-[#242424] hover:opacity-75 transition-opacity active:scale-90"
                        title={t("orders.copyOrderNumber")}
                      >
                        {copiedId === item.id ? (
                          <span className="text-[11px] text-green-800 font-bold whitespace-nowrap">
                            ✓
                          </span>
                        ) : (
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end text-right ml-auto">
                    <span className="text-[13px] sm:text-[14px] text-[rgba(36,36,36,0.5)] leading-tight tracking-[-0.154px]">
                      {t("orders.lastStatusDate")}
                    </span>
                    <span className="text-[13px] sm:text-[14px] text-[rgba(36,36,36,0.5)] leading-tight tracking-[-0.154px] mt-0.5">
                      {item.lastStatusDate}
                    </span>
                  </div>
                </div>

                {/* Inner Book Item Card */}
                <div className="bg-[#f5f3ee] border-[3px] sm:border-4 border-[#f5f3ee] rounded-[9px] drop-shadow-[0px_4px_2px_rgba(0,0,0,0.25)] min-h-[160px] w-full relative flex items-center p-2.5 sm:p-3 gap-2.5 sm:gap-3 my-1">
                  {/* Bookmark Badge on Left Edge */}
                  <div className="w-[30px] min-h-[105px] bg-[#C8C2B4]/80 rounded-r-[6px] -ml-2.5 sm:-ml-3 flex flex-col items-center justify-center gap-2 shrink-0 self-center py-2 shadow-sm">
                    {item.formats.includes("print") && (
                      <img
                        src={printIconSrc}
                        alt={t("orders.formats.paper")}
                        className="w-[18px] h-auto object-contain"
                      />
                    )}
                    {item.formats.includes("ebook") && (
                      <img
                        src={ebookIconSrc}
                        alt={t("orders.formats.ebook")}
                        className="w-[16px] h-auto object-contain"
                      />
                    )}
                    {item.formats.includes("audio") && (
                      <img
                        src={audioIconSrc}
                        alt={t("orders.formats.audio")}
                        className="w-[16px] h-auto object-contain"
                      />
                    )}
                  </div>

                  {/* Book Cover */}
                  <div className="w-[80px] sm:w-[84px] h-[126px] sm:h-[134px] relative rounded-[4px] overflow-hidden shadow shrink-0 bg-white flex items-center justify-center">
                    <img
                      src={item.bookImage || "/images/catalog/hunger_games.png"}
                      alt={item.bookTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/images/catalog/hunger_games.png";
                      }}
                    />
                  </div>

                  {/* Title, Quantity & Price */}
                  <div className="flex-1 flex flex-col justify-between self-stretch py-1 min-w-0 pr-1">
                    <div>
                      <h4 className="text-[17px] sm:text-[19px] font-normal text-[#242424] leading-tight tracking-[-0.22px] line-clamp-2">
                        {item.bookTitle}
                      </h4>
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        <span className="text-[12px] font-semibold text-[#555555] bg-[#EBE7DD] px-2 py-0.5 rounded-full border border-[#D5CFCE]">
                          {t("orders.qty").replace("{count}", String(item.quantity))}
                        </span>
                        {item.formats && item.formats.map((fmt, idx) => {
                          const f = String(fmt).toLowerCase();
                          let label = t("orders.formats.paper");
                          let icon = "📖";
                          let badgeStyle = "bg-[#E2F0D9] text-[#005b33] border-[#B8E0A4]";

                          if (f === "ebook" || f.includes("елек")) {
                            label = t("orders.formats.ebook");
                            icon = "📱";
                            badgeStyle = "bg-[#E3F2FD] text-[#0277BD] border-[#B3E5FC]";
                          } else if (f === "audio" || f.includes("аудіо")) {
                            label = t("orders.formats.audio");
                            icon = "🎧";
                            badgeStyle = "bg-[#F3E5F5] text-[#7B1FA2] border-[#E1BEE7]";
                          } else if (f === "print" || f.includes("папер") || f === "paper") {
                            label = t("orders.formats.paper");
                            icon = "📖";
                            badgeStyle = "bg-[#E2F0D9] text-[#005b33] border-[#B8E0A4]";
                          } else {
                            label = fmt;
                          }

                          return (
                            <span
                              key={idx}
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-0.5 ${badgeStyle}`}
                            >
                              <span>{icon}</span> {label}
                            </span>
                          );
                        })}
                      </div>

                      {item.showConfirmReceiptBtn && (
                        <button
                          type="button"
                          onClick={() =>
                            onAction("confirm_receipt", item.id, item.dbOrderId)
                          }
                          className="mt-2.5 px-3 py-1 rounded-full border border-[#005b33] text-[#005b33] font-semibold hover:bg-[#005b33] hover:text-white transition text-[12px] w-fit shadow-sm"
                        >
                          {t("orders.confirmReceipt")}
                        </button>
                      )}
                    </div>

                    <div className="self-end font-semibold text-[18px] sm:text-[20px] text-[#242424] tracking-[-0.22px] mt-auto pt-2">
                      {formatPrice(item.price)}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons Row */}
                <div className="flex flex-wrap items-center justify-end gap-2 mt-3 pt-2 border-t border-[#242424]/10">
                  {activeTab === "waiting_payment" && (
                    <>
                      <button
                        type="button"
                        onClick={() => onAction("pay_order", item.id, item.dbOrderId)}
                        className="bg-[#005b33] hover:bg-[#004727] text-white px-3.5 py-2 rounded-xl font-bold transition text-xs sm:text-sm shadow-md active:scale-95"
                      >
                        {t("orders.payOrder")}
                      </button>
                      <button
                        type="button"
                        onClick={() => onAction("cancel", item.id, item.dbOrderId)}
                        className="bg-[#524B42] hover:bg-[#3D3730] text-white px-3.5 py-2 rounded-xl font-medium transition text-xs sm:text-sm shadow-sm active:scale-95"
                      >
                        {t("orders.cancelOrder")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (item.dbOrderId) {
                            router.push(lp(`/complaints?orderId=${item.dbOrderId}`));
                          } else {
                            onAction("complain", item.id, item.dbOrderId);
                          }
                        }}
                        className="bg-[#f5f3ee] hover:bg-[#E5E0D5] border border-[#C8C2B4] text-[#242424] px-3 py-2 rounded-xl font-medium transition text-xs shadow-sm active:scale-95"
                      >
                        {t("orders.complain")}
                      </button>
                      <button
                        type="button"
                        onClick={() => onAction("delete", item.id, item.dbOrderId)}
                        className="bg-[#C0392B] hover:bg-[#A93226] text-white px-3.5 py-2 rounded-xl font-medium transition text-xs sm:text-sm shadow-sm active:scale-95"
                      >
                        {t("orders.delete")}
                      </button>
                    </>
                  )}

                  {(activeTab === "waiting_dispatch" || activeTab === "order_sent") && (
                    <>
                      <button
                        type="button"
                        onClick={() => onAction("cancel", item.id, item.dbOrderId)}
                        className="bg-[#524B42] hover:bg-[#3D3730] text-white px-3.5 py-2 rounded-xl font-medium transition text-xs sm:text-sm shadow-sm active:scale-95"
                      >
                        {t("orders.cancelOrder")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (item.dbOrderId) {
                            router.push(lp(`/complaints?orderId=${item.dbOrderId}`));
                          } else {
                            onAction("complain", item.id, item.dbOrderId);
                          }
                        }}
                        className="bg-[#f5f3ee] hover:bg-[#E5E0D5] border border-[#C8C2B4] text-[#242424] px-3.5 py-2 rounded-xl font-medium transition text-xs sm:text-sm shadow-sm active:scale-95"
                      >
                        {t("orders.complain")}
                      </button>
                      <button
                        type="button"
                        onClick={() => onAction("delete", item.id, item.dbOrderId)}
                        className="bg-[#C0392B] hover:bg-[#A93226] text-white px-3.5 py-2 rounded-xl font-medium transition text-xs sm:text-sm shadow-sm active:scale-95"
                      >
                        {t("orders.delete")}
                      </button>
                    </>
                  )}

                  {activeTab === "add_review" && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          onAction("write_review", item.id, item.dbOrderId)
                        }
                        className="bg-[#524B42] hover:bg-[#3D3730] text-white px-3.5 py-2 rounded-xl font-medium transition text-xs sm:text-sm shadow-sm active:scale-95"
                      >
                        {t("orders.writeReview")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (item.dbOrderId) {
                            router.push(lp(`/complaints?orderId=${item.dbOrderId}`));
                          } else {
                            onAction("complain", item.id, item.dbOrderId);
                          }
                        }}
                        className="bg-[#f5f3ee] hover:bg-[#E5E0D5] border border-[#C8C2B4] text-[#242424] px-3.5 py-2 rounded-xl font-medium transition text-xs sm:text-sm shadow-sm active:scale-95"
                      >
                        {t("orders.complain")}
                      </button>
                      <button
                        type="button"
                        onClick={() => onAction("delete", item.id, item.dbOrderId)}
                        className="bg-[#C0392B] hover:bg-[#A93226] text-white px-3.5 py-2 rounded-xl font-medium transition text-xs sm:text-sm shadow-sm active:scale-95"
                      >
                        {t("orders.delete")}
                      </button>
                    </>
                  )}

                  {activeTab === "returns" && (
                    <>
                      <button
                        type="button"
                        onClick={() => onAction("return", item.id, item.dbOrderId)}
                        className="bg-[#524B42] hover:bg-[#3D3730] text-white px-3.5 py-2 rounded-xl font-medium transition text-xs sm:text-sm shadow-sm active:scale-95"
                      >
                        {t("orders.returnItem")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (item.dbOrderId) {
                            router.push(lp(`/complaints?orderId=${item.dbOrderId}`));
                          } else {
                            onAction("complain", item.id, item.dbOrderId);
                          }
                        }}
                        className="bg-[#f5f3ee] hover:bg-[#E5E0D5] border border-[#C8C2B4] text-[#242424] px-3.5 py-2 rounded-xl font-medium transition text-xs sm:text-sm shadow-sm active:scale-95"
                      >
                        {t("orders.complain")}
                      </button>
                      <button
                        type="button"
                        onClick={() => onAction("delete", item.id, item.dbOrderId)}
                        className="bg-[#C0392B] hover:bg-[#A93226] text-white px-3.5 py-2 rounded-xl font-medium transition text-xs sm:text-sm shadow-sm active:scale-95"
                      >
                        {t("orders.delete")}
                      </button>
                    </>
                  )}

                  {activeTab === "history" && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          if (item.dbOrderId) {
                            router.push(lp(`/complaints?orderId=${item.dbOrderId}`));
                          } else {
                            onAction("complain", item.id, item.dbOrderId);
                          }
                        }}
                        className="bg-[#f5f3ee] hover:bg-[#E5E0D5] border border-[#C8C2B4] text-[#242424] px-3.5 py-2 rounded-xl font-medium transition text-xs sm:text-sm shadow-sm active:scale-95"
                      >
                        {t("orders.complain")}
                      </button>
                      <button
                        type="button"
                        onClick={() => onAction("delete", item.id, item.dbOrderId)}
                        className="bg-[#C0392B] hover:bg-[#A93226] text-white px-3.5 py-2 rounded-xl font-medium transition text-xs sm:text-sm shadow-sm active:scale-95"
                      >
                        {t("orders.delete")}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {!loading && currentItems.length > 0 && (
        <OrdersPagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={onPageChange} 
        />
      )}
    </div>
  );
}
