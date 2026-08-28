"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { orderService, productService } from "@/lib/api/services";
import { OrderDTO, ProductDto } from "@/lib/api/generated";
import WriteReviewModal from "../WriteReviewModal";
import ReturnOrderModal from "../ReturnOrderModal";
import { MockOrderItem } from "../mockData";

type OrderStatusStep = {
  id: string;
  title: string;
  completed: boolean;
  active: boolean;
  date?: string;
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const orderId = rawId ? Number(rawId) : null;

  const [dbOrder, setDbOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [productMap, setProductMap] = useState<Map<number, ProductDto>>(new Map());

  // Modal States
  const [selectedItemForReview, setSelectedItemForReview] = useState<MockOrderItem | null>(null);
  const [selectedItemForReturn, setSelectedItemForReturn] = useState<MockOrderItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Load products for title & image map
        const allProducts = await productService.apiProductsGet().catch(() => []);
        const pMap = new Map<number, ProductDto>();
        (allProducts || []).forEach((p) => {
          if (p.id != null) pMap.set(p.id, p);
        });
        setProductMap(pMap);

        if (orderId) {
          const ord = await orderService.apiOrdersIdGet({ id: orderId });
          setDbOrder(ord);
        } else {
          setError("Замовлення не знайдено");
        }
      } catch (err: any) {
        console.error("Error loading order:", err);
        setError("Не вдалося завантажити деталі замовлення");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [orderId]);

  const rawStatus = (dbOrder?.status || "Pending").toLowerCase();

  // Status index: 0: Нове, 1: Прийнято, 2: Комплектується, 3: Відправлено, 4: Отримано
  let activeStepIndex = 0;
  let statusBadgeText = "Нове";
  let statusBadgeColor = "#005b33";

  if (rawStatus.includes("new") || rawStatus.includes("pending") || rawStatus.includes("оформл")) {
    activeStepIndex = 0;
    statusBadgeText = "Нове";
  } else if (rawStatus.includes("paid") || rawStatus.includes("accept") || rawStatus.includes("прийнят") || rawStatus.includes("очікув")) {
    activeStepIndex = 1;
    statusBadgeText = "Прийнято";
  } else if (rawStatus.includes("process") || rawStatus.includes("pack") || rawStatus.includes("комплек")) {
    activeStepIndex = 2;
    statusBadgeText = "Комплектується";
  } else if (rawStatus.includes("sent") || rawStatus.includes("shipp") || rawStatus.includes("відправл")) {
    activeStepIndex = 3;
    statusBadgeText = "Відправлено";
  } else if (rawStatus.includes("deliver") || rawStatus.includes("receiv") || rawStatus.includes("отримал") || rawStatus.includes("доставл") || rawStatus.includes("complet")) {
    activeStepIndex = 4;
    statusBadgeText = "Отримано";
  } else if (rawStatus.includes("cancel") || rawStatus.includes("скасов")) {
    activeStepIndex = -1;
    statusBadgeText = "Скасовано";
    statusBadgeColor = "#C0392B";
  } else if (rawStatus.includes("return") || rawStatus.includes("поверн")) {
    activeStepIndex = -2;
    statusBadgeText = "Повернено";
    statusBadgeColor = "#2A2A2A";
  }

  const orderDateStr = dbOrder?.orderDate
    ? new Date(dbOrder.orderDate).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "14.08.2026";

  const orderTimeStr = dbOrder?.orderDate
    ? new Date(dbOrder.orderDate).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })
    : "14:30";

  const timelineSteps: OrderStatusStep[] = [
    { id: "new", title: "Нове", completed: activeStepIndex >= 0, active: activeStepIndex === 0, date: orderDateStr },
    { id: "accepted", title: "Прийнято", completed: activeStepIndex >= 1, active: activeStepIndex === 1, date: orderDateStr },
    { id: "packing", title: "Комплектується", completed: activeStepIndex >= 2, active: activeStepIndex === 2, date: orderDateStr },
    { id: "shipped", title: "Відправлено", completed: activeStepIndex >= 3, active: activeStepIndex === 3, date: orderDateStr },
    { id: "delivered", title: "Отримано", completed: activeStepIndex >= 4, active: activeStepIndex === 4, date: orderDateStr },
  ];

  // Helper to map OrderItem to MockOrderItem for Review / Return modal
  const createMockItem = (item: any, idx: number): MockOrderItem => {
    const prod = item.productId ? productMap.get(item.productId) : null;
    let imageSrc = "/images/catalog/hunger_games.png";
    if (prod?.productImages && prod.productImages.length > 0 && prod.productImages[0].imageData) {
      const rawData = prod.productImages[0].imageData.trim();
      if (rawData.startsWith("data:") || rawData.startsWith("http://") || rawData.startsWith("https://")) {
        imageSrc = rawData;
      } else {
        imageSrc = `data:image/jpeg;base64,${rawData}`;
      }
    }

    const rawFormat = (item.format || "").toString().toLowerCase();
    const rawName = (prod?.productName || item.productName || "").toString().toLowerCase();
    const combinedStr = `${rawFormat} ${rawName}`;

    const isEbook = combinedStr.includes("ebook") || combinedStr.includes("елек") || combinedStr.includes("pdf") || combinedStr.includes("epub");
    const isAudio = combinedStr.includes("audio") || combinedStr.includes("аудіо") || combinedStr.includes("mp3");

    const itemFormats: string[] = [];
    if (isEbook) itemFormats.push("ebook");
    if (isAudio) itemFormats.push("audio");
    if (itemFormats.length === 0) itemFormats.push("print");

    return {
      id: `item-${dbOrder?.id || idx}-${idx}`,
      dbOrderId: dbOrder?.id || orderId || 0,
      productId: item.productId ?? undefined,
      orderNumber: `№ ${dbOrder?.id ? String(dbOrder.id).padStart(10, "0") : "0000000001"}`,
      statusText: statusBadgeText,
      statusColor: statusBadgeColor,
      lastStatusDate: `${orderDateStr}, ${orderTimeStr}`,
      bookTitle: prod?.productName || `Книга #${item.productId || idx + 1}`,
      bookImage: imageSrc,
      quantity: item.quantity || 1,
      formats: itemFormats,
      price: item.unitPrice || (dbOrder?.totalPrice ? Math.round(dbOrder.totalPrice) : 350),
    };
  };

  return (
    <div
      className="min-h-screen pt-[160px] md:pt-[210px] pb-16 px-4 sm:px-6 relative text-[#242424]"
      style={{
        backgroundImage: "url('/images/userProfile/Rectangle 326.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-[#005b33] text-white px-6 py-3 rounded-2xl shadow-xl border border-white/20 animate-fade-in font-medium text-sm">
          {toastMessage}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Main Board Container (Matching Figma parchment style) */}
        <div
          className="rounded-3xl p-6 sm:p-10 shadow-2xl border border-[#B7895E]/40 relative overflow-hidden"
          style={{
            backgroundImage: "url('/images/addProducts/Rectangle 312.svg')",
            backgroundSize: "cover",
            backgroundPosition: "top center",
          }}
        >
          {/* Back Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#C8C2B4]">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-semibold text-[#555555] hover:text-[#242424] transition bg-[#E5E0D5] px-4 py-2 rounded-2xl border border-[#C8C2B4]"
            >
              ← Назад до замовлень
            </button>

            <div className="text-right">
              <span className="text-xs text-[#666666] block">Замовлення</span>
              <span className="text-base sm:text-lg font-bold text-[#242424]">
                № {dbOrder?.id ? String(dbOrder.id).padStart(10, "0") : "0000000001"}
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#242424] mb-2 text-center">
            Сторінка замовлення
          </h1>
          <p className="text-center text-sm text-[#666666] mb-8">
            Оформлено {orderDateStr} о {orderTimeStr}
          </p>

          {loading ? (
            <div className="text-center py-12 text-[#666666] font-medium animate-pulse">
              Завантаження деталей замовлення...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600 font-semibold bg-red-50 rounded-2xl border border-red-200">
              {error}
            </div>
          ) : (
            <div className="space-y-8">
              {/* SECTION 1: Status Tracking Stepper (Figma Node 1387:14537) */}
              <div className="bg-[#EBE7DD] rounded-2xl p-6 border border-[#C8C2B4] shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-[#242424]">Статус замовлення</h2>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: statusBadgeColor }}
                  >
                    {statusBadgeText}
                  </span>
                </div>

                {/* Stepper Timeline */}
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0 px-2 py-4">
                  {/* Connecting line for desktop */}
                  <div className="hidden md:block absolute top-1/2 left-8 right-8 h-1 bg-[#C8C2B4] -translate-y-1/2 -z-0" />
                  
                  {timelineSteps.map((step, idx) => {
                    const isPassed = step.completed;
                    const isCurrent = step.active;

                    return (
                      <div key={step.id} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 w-full md:w-auto">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                            isCurrent
                              ? "bg-[#005b33] text-white ring-4 ring-[#005b33]/20 shadow-md scale-110"
                              : isPassed
                              ? "bg-[#005b33] text-white"
                              : "bg-[#C8C2B4] text-[#666666]"
                          }`}
                        >
                          {isPassed ? "✓" : idx + 1}
                        </div>

                        <div className="md:text-center">
                          <p
                            className={`text-sm font-bold ${
                              isCurrent ? "text-[#005b33]" : isPassed ? "text-[#242424]" : "text-[#777777]"
                            }`}
                          >
                            {step.title}
                          </p>
                          {step.date && isPassed && (
                            <span className="text-[11px] text-[#666666] block">{step.date}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: Delivery Details Card */}
              <div className="bg-[#F5F3EE] rounded-2xl p-6 border border-[#C8C2B4] shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🚚</span>
                  <h2 className="text-lg font-bold text-[#242424]">Доставка</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#242424]">
                  <div className="bg-[#EBE7DD] p-3.5 rounded-xl border border-[#D5CFCE]">
                    <span className="text-xs text-[#666666] block mb-0.5">Служба доставки</span>
                    <span className="font-semibold text-base">Нова Пошта</span>
                  </div>
                  <div className="bg-[#EBE7DD] p-3.5 rounded-xl border border-[#D5CFCE]">
                    <span className="text-xs text-[#666666] block mb-0.5">Номер ТТН</span>
                    <span className="font-bold text-base text-[#005b33]">20450918234910</span>
                  </div>
                  <div className="sm:col-span-2 bg-[#EBE7DD] p-3.5 rounded-xl border border-[#D5CFCE]">
                    <span className="text-xs text-[#666666] block mb-0.5">Адреса отримання / Відділення</span>
                    <span className="font-medium">м. Київ, Відділення № 45 (вул. Хрещатик, 22)</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Payment Details Card */}
              <div className="bg-[#F5F3EE] rounded-2xl p-6 border border-[#C8C2B4] shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">💳</span>
                  <h2 className="text-lg font-bold text-[#242424]">Оплата</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#242424]">
                  <div className="bg-[#EBE7DD] p-3.5 rounded-xl border border-[#D5CFCE]">
                    <span className="text-xs text-[#666666] block mb-0.5">Спосіб оплати</span>
                    <span className="font-semibold">Оплата карткою на сайті</span>
                  </div>
                  <div className="bg-[#EBE7DD] p-3.5 rounded-xl border border-[#D5CFCE]">
                    <span className="text-xs text-[#666666] block mb-0.5">Статус оплати</span>
                    <span className="font-bold text-[#005b33] flex items-center gap-1">
                      <span>✓</span> Оплачено ({dbOrder?.totalPrice || 350} грн)
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Seller / Publisher Contacts Card */}
              <div className="bg-[#F5F3EE] rounded-2xl p-6 border border-[#C8C2B4] shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🏢</span>
                  <h2 className="text-lg font-bold text-[#242424]">Контакти продавця</h2>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#EBE7DD] p-4 rounded-xl border border-[#D5CFCE]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#005b33] text-white flex items-center justify-center font-bold text-lg">
                      К
                    </div>
                    <div>
                      <h3 className="font-bold text-[#242424] text-base">Видавництво «Книгарня»</h3>
                      <div className="flex items-center gap-2 text-xs text-[#555555] mt-0.5">
                        <span className="bg-[#005b33]/10 text-[#005b33] px-2 py-0.5 rounded-md font-semibold">
                          ⭐ 98% позитивних відгуків
                        </span>
                        <span>• Менеджер: +380(93) 505-08-19</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/complaints?orderId=${dbOrder?.id || orderId}`)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-[#F5F3EE] border border-[#C8C2B4] text-[#242424] text-xs font-bold transition flex items-center gap-2 shadow-2xs"
                  >
                    💬 Написати продавцю
                  </button>
                </div>
              </div>

              {/* SECTION 5: Order Items List & Actions */}
              <div className="bg-[#F5F3EE] rounded-2xl p-6 border border-[#C8C2B4] shadow-xs">
                <h2 className="text-lg font-bold text-[#242424] mb-4">Товари у замовленні</h2>

                <div className="space-y-4">
                  {((dbOrder?.orderItems && dbOrder.orderItems.length > 0) ? dbOrder.orderItems : [{ id: 1, productId: 1, quantity: 1, unitPrice: dbOrder?.totalPrice || 350 }]).map((item: any, idx: number) => {
                    const mockItem = createMockItem(item, idx);
                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl p-4 border border-[#E0DBD2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-24 relative rounded overflow-hidden shadow shrink-0 bg-gray-100 border border-gray-200">
                            <img
                              src={mockItem.bookImage}
                              alt={mockItem.bookTitle}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/catalog/hunger_games.png";
                              }}
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-[#242424] text-base leading-snug">
                              {mockItem.bookTitle}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-semibold text-[#555555] bg-[#F5F3EE] px-2 py-0.5 rounded-full border border-[#D5CFCE]">
                                {mockItem.quantity} шт.
                              </span>
                              <span className="text-xs font-semibold text-[#005b33] bg-[#E2F0D9] px-2 py-0.5 rounded-full border border-[#B8E0A4]">
                                {mockItem.formats.join(", ")}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-[#242424] mt-2">
                              {mockItem.price} грн
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons for Delivered / Received Status (Figma Node 1324:15339) */}
                        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-center justify-end">
                          <button
                            onClick={() => setSelectedItemForReview(mockItem)}
                            className="px-4 py-2 rounded-xl bg-[#005b33] hover:bg-[#004828] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                          >
                            ✍️ Написати відгук
                          </button>
                          <button
                            onClick={() => setSelectedItemForReturn(mockItem)}
                            className="px-4 py-2 rounded-xl bg-[#E5E0D5] hover:bg-[#D8D2C5] border border-[#C8C2B4] text-[#242424] text-xs font-semibold transition"
                          >
                            📦 Повернути товар
                          </button>
                          <button
                            onClick={() => router.push(`/complaints?orderId=${dbOrder?.id || orderId}`)}
                            className="px-4 py-2 rounded-xl bg-[#F0E6DF] hover:bg-[#E4D7CF] text-[#C0392B] border border-[#D1AFA9] text-xs font-semibold transition"
                          >
                            ⚠️ Скарги
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={!!selectedItemForReview}
        onClose={() => setSelectedItemForReview(null)}
        item={selectedItemForReview}
        onSubmitSuccess={(msg) => showToast(msg)}
      />

      {/* Return Order Modal */}
      <ReturnOrderModal
        isOpen={!!selectedItemForReturn}
        onClose={() => setSelectedItemForReturn(null)}
        item={selectedItemForReturn}
        onSubmitSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
}
