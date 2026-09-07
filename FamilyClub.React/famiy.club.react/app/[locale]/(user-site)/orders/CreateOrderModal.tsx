"use client";

import React, { useState } from "react";
import { OrderTabId, ORDERS_TABS, MockOrderItem } from "./mockData";
import { orderService } from "@/lib/api/services";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab: OrderTabId;
  onOrderCreated: (newOrder: MockOrderItem, targetTab: OrderTabId) => void;
}

export default function CreateOrderModal({
  isOpen,
  onClose,
  defaultTab,
  onOrderCreated,
}: CreateOrderModalProps) {
  const [targetTab, setTargetTab] = useState<OrderTabId>(defaultTab);
  const [bookTitle, setBookTitle] = useState<string>("");
  const [price, setPrice] = useState<number>(250);
  const [quantity, setQuantity] = useState<number>(1);
  const [formatPrint, setFormatPrint] = useState<boolean>(true);
  const [formatEbook, setFormatEbook] = useState<boolean>(false);
  const [formatAudio, setFormatAudio] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim()) return;

    setSubmitting(true);

    let statusString = "Pending";
    let statusText = "Оформлено";
    let statusColor = "#005b33";
    let showConfirmBtn = false;

    switch (targetTab) {
      case "waiting_payment":
        statusString = "Pending";
        statusText = "Оформлено";
        break;
      case "waiting_dispatch":
        statusString = "Paid";
        statusText = "Очікувана";
        break;
      case "order_sent":
        statusString = "Sent";
        statusText = "Відправлено";
        showConfirmBtn = true;
        break;
      case "add_review":
        statusString = "Delivered";
        statusText = "Доставлено";
        break;
      case "returns":
        statusString = "ReturnRequested";
        statusText = "Повернення";
        break;
      case "history":
        statusString = "Completed";
        statusText = "Доставлено";
        break;
    }

    const formats: ("print" | "ebook" | "audio")[] = [];
    if (formatPrint) formats.push("print");
    if (formatEbook) formats.push("ebook");
    if (formatAudio) formats.push("audio");
    if (formats.length === 0) formats.push("print");

    const randomId = Math.floor(100000000000 + Math.random() * 900000000000);
    const orderNumber = `№${randomId}`;
    const dateNowStr = new Date().toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "2-digit" }) + ", " + new Date().toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });

    // Спроба відправити в БД
    let dbId: number | undefined = undefined;
    try {
      await orderService.apiOrdersPost({
        orderDTO: {
          orderDate: new Date(),
          status: statusString,
          totalPrice: price * quantity,
        },
      }).catch((err) => {
        console.warn("Could not save to DB via API, fallback to local state", err);
      });
    } catch (e) {
      console.warn("DB save order error", e);
    }

    const newOrderItem: MockOrderItem = {
      id: `custom-${Date.now()}`,
      dbOrderId: dbId,
      orderNumber,
      statusText,
      statusColor,
      lastStatusDate: dateNowStr,
      bookTitle: bookTitle.trim(),
      bookImage: "/images/catalog/hunger_games.png",
      quantity,
      price,
      formats,
      showConfirmReceiptBtn: showConfirmBtn,
    };

    onOrderCreated(newOrderItem, targetTab);
    setSubmitting(false);
    onClose();
    setBookTitle("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-[#F5F3EE] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#B7895E]/40 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#E5E0D5] hover:bg-[#D8D2C5] text-[#242424] font-bold flex items-center justify-center transition"
          title="Закрити"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <span className="text-3xl mb-1 block">➕📦</span>
          <h2 className="text-2xl font-bold text-[#242424]">Додати замовлення</h2>
          <p className="text-sm text-[#555555]">Створити нову картку товару на обраній вкладці</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Tab Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#242424] uppercase tracking-wider">Оберіть вкладку / статус:</label>
            <select
              value={targetTab}
              onChange={(e) => setTargetTab(e.target.value as OrderTabId)}
              className="w-full rounded-2xl border border-[#C8C2B4] p-3 text-sm bg-white text-[#242424] font-semibold focus:outline-none focus:ring-2 focus:ring-[#005b33]"
            >
              {ORDERS_TABS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Book Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#242424] uppercase tracking-wider">Назва книги:</label>
            <input
              type="text"
              required
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder="напр. Маленький принц"
              className="w-full rounded-2xl border border-[#C8C2B4] p-3 text-sm bg-white text-[#242424] focus:outline-none focus:ring-2 focus:ring-[#005b33]"
            />
          </div>

          {/* Price & Qty Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#242424] uppercase tracking-wider">Ціна (грн):</label>
              <input
                type="number"
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full rounded-2xl border border-[#C8C2B4] p-3 text-sm bg-white text-[#242424] focus:outline-none focus:ring-2 focus:ring-[#005b33]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#242424] uppercase tracking-wider">Кількість (шт):</label>
              <input
                type="number"
                min={1}
                max={99}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-2xl border border-[#C8C2B4] p-3 text-sm bg-white text-[#242424] focus:outline-none focus:ring-2 focus:ring-[#005b33]"
              />
            </div>
          </div>

          {/* Formats Checkboxes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#242424] uppercase tracking-wider">Формат книги:</label>
            <div className="flex items-center gap-4 bg-white/80 p-3 rounded-2xl border border-[#C8C2B4]">
              <label className="flex items-center gap-1.5 text-xs text-[#242424] font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={formatPrint}
                  onChange={(e) => setFormatPrint(e.target.checked)}
                  className="accent-[#005b33] w-4 h-4"
                />
                Паперова
              </label>
              <label className="flex items-center gap-1.5 text-xs text-[#242424] font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={formatEbook}
                  onChange={(e) => setFormatEbook(e.target.checked)}
                  className="accent-[#005b33] w-4 h-4"
                />
                eBook
              </label>
              <label className="flex items-center gap-1.5 text-xs text-[#242424] font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={formatAudio}
                  onChange={(e) => setFormatAudio(e.target.checked)}
                  className="accent-[#005b33] w-4 h-4"
                />
                Аудіо
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#C8C2B4] bg-[#E5E0D5] hover:bg-[#D8D2C5] text-[#242424] text-xs font-semibold transition"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#005b33] hover:bg-[#004727] text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              Створити замовлення
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
