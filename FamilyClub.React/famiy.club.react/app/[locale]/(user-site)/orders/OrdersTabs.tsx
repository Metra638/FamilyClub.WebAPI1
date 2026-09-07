"use client";

import React from "react";
import { OrderTabId, ORDERS_TABS } from "./mockData";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface OrdersTabsProps {
  activeTab: OrderTabId;
  onSelectTab: (tab: OrderTabId) => void;
  counts?: Record<OrderTabId, number>;
}

export default function OrdersTabs({ activeTab, onSelectTab, counts }: OrdersTabsProps) {
  const t = useTranslations();

  const getTabIcon = (id: OrderTabId) => {
    switch (id) {
      case "waiting_payment":
        // icon/action/history_24px
        return (
          <svg className="w-7 h-7 mb-1 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6a7 7 0 1 1 7 7 7.07 7.07 0 0 1-6-3.4L5.56 17A8.93 8.93 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
          </svg>
        );
      case "waiting_dispatch":
        // icon/action/assignment_24px
        return (
          <svg className="w-7 h-7 mb-1 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 16H5V5h2v2h10V5h2v14zm-5-8H8v-2h6v2zm0 4H8v-2h6v2z" />
          </svg>
        );
      case "order_sent":
        // icon/action/assignment_return_24px
        return (
          <svg className="w-7 h-7 mb-1 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 16H5V5h2v2h10V5h2v14zm-3-6-4-4v3H8v2h4v3l4-4z" />
          </svg>
        );
      case "add_review":
        // icon/communication/chat_24px
        return (
          <svg className="w-7 h-7 mb-1 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
          </svg>
        );
      case "returns":
        // icon/action/restore_page_24px
        return (
          <svg className="w-7 h-7 mb-1 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-2 16c-2.05 0-3.81-1.24-4.58-3h1.71c.63.9 1.68 1.5 2.87 1.5 1.93 0 3.5-1.57 3.5-3.5S13.93 9.5 12 9.5c-1.35 0-2.52.78-3.1 1.9l1.6 1.6H6V8l1.89 1.89C8.83 8.65 10.32 8 12 8c3.04 0 5.5 2.46 5.5 5.5S15.04 19 12 19z" />
          </svg>
        );
      case "history":
        // icon/action/schedule_24px
        return (
          <svg className="w-7 h-7 mb-1 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
          </svg>
        );
    }
  };

  return (
    <div className="w-full flex justify-between gap-2 md:gap-3 overflow-x-auto pb-4 pt-1 px-1">
      {ORDERS_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const countVal = counts ? counts[tab.id] : tab.count;
        return (
          <div key={tab.id} className="relative flex-1 min-w-[125px] max-w-[170px] flex flex-col items-center">
            {/* Ribbon Tab Button with ribbon shape and active drop extension */}
            <button
              onClick={() => onSelectTab(tab.id)}
              className={`w-full flex flex-col items-center justify-start pt-4 px-2 transition-all duration-300 transform ${
                isActive
                  ? "bg-[#004e2B] pb-10 shadow-xl translate-y-1 scale-102"
                  : "bg-[#006338] pb-7 hover:bg-[#005430] hover:translate-y-0.5"
              }`}
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 86%, 0 100%)",
              }}
            >
              {getTabIcon(tab.id)}
              <span className="text-white text-[12px] md:text-[13px] font-semibold text-center leading-tight mt-1 px-1">
                {t(`orders.tabs.${tab.id}`)}
              </span>
            </button>

            {/* Badge Count Circle */}
            {countVal !== undefined && countVal > 0 && (
              <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-[#F5F3EE] text-[#004e2B] rounded-full flex items-center justify-center text-[12px] font-bold shadow-md border border-[#004e2B] z-10 animate-scale-in">
                {countVal}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
