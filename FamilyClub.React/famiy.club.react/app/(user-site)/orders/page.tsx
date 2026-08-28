"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import OrdersHeader from "./OrdersHeader";
import OrdersTabs from "./OrdersTabs";
import OrderCard from "./OrderCard";
import MobileOrdersView from "./MobileOrdersView";
import OrdersPagination from "./OrdersPagination";
import WriteReviewModal from "./WriteReviewModal";
import ReturnOrderModal from "./ReturnOrderModal";
import { EMPTY_ORDERS_BY_TAB, MockOrderItem, OrderTabId } from "./mockData";
import { orderService, productService } from "@/lib/api/services";
import { getAuthUserId } from "@/lib/auth/tokenStorage";
import { OrderDTO, ProductDto } from "@/lib/api/generated";

export default function OrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OrderTabId>("waiting_payment");
  const [ordersByTab, setOrdersByTab] = useState<Record<OrderTabId, MockOrderItem[]>>(EMPTY_ORDERS_BY_TAB);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [selectedItemForReview, setSelectedItemForReview] = useState<MockOrderItem | null>(null);
  const [selectedItemForReturn, setSelectedItemForReturn] = useState<MockOrderItem | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleTabChange = (tab: OrderTabId) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadDatabaseOrders = async () => {
    setLoading(true);
    try {
      const userId = typeof window !== "undefined" ? getAuthUserId() : null;
      
      // Завантажуємо продукти з БД для визначення назв та обкладинок
      const allProducts: ProductDto[] = (await productService.apiProductsGet().catch(() => [])) || [];
      const productMap = new Map<number, ProductDto>();
      allProducts.forEach((p) => {
        if (p.id != null) productMap.set(p.id, p);
      });

      // Завантажуємо реальні замовлення користувача з БД
      let dbOrders: OrderDTO[] = [];
      if (userId) {
        dbOrders = (await orderService.apiOrdersByUserUserIdGet({ userId }).catch(() => [])) || [];
      }
      if (dbOrders.length === 0) {
        dbOrders = (await orderService.apiOrdersGet().catch(() => [])) || [];
      }

      // Об'єднуємо з локально збереженими замовленнями з localStorage
      if (typeof window !== "undefined") {
        try {
          const localOrders: any[] = JSON.parse(localStorage.getItem("librellis_local_orders") || "[]");
          const existingIds = new Set(dbOrders.map((o) => o.id));
          for (const lo of localOrders) {
            if (lo.id && !existingIds.has(lo.id)) {
              dbOrders.unshift(lo);
            }
          }
        } catch (e) {
          console.warn("Failed to read local orders backup", e);
        }
      }

      const mapped: Record<OrderTabId, MockOrderItem[]> = {
        waiting_payment: [],
        waiting_dispatch: [],
        order_sent: [],
        add_review: [],
        returns: [],
        history: [],
      };

      for (const order of dbOrders) {
        if (!order.id) continue;
        const statusStr = (order.status || "Pending").toLowerCase();
        
        let targetTab: OrderTabId = "waiting_payment";
        let statusText = "Оформлено";
        let statusColor = "#005b33";
        let showConfirmBtn = false;

        if (statusStr.includes("paid") || statusStr.includes("processing") || statusStr.includes("waitingdispatch") || statusStr.includes("очікувана") || statusStr.includes("відправк")) {
          targetTab = "waiting_dispatch";
          statusText = "Очікувана";
        } else if (statusStr.includes("sent") || statusStr.includes("shipped") || statusStr.includes("intransit") || statusStr.includes("надіслано") || statusStr.includes("відправлено")) {
          targetTab = "order_sent";
          statusText = "Відправлено";
          showConfirmBtn = true;
        } else if (statusStr.includes("delivered") || statusStr.includes("received") || statusStr.includes("completed") || statusStr.includes("доставлено") || statusStr.includes("відгук")) {
          targetTab = "add_review";
          statusText = "Доставлено";
        } else if (statusStr.includes("returnrequested") || statusStr.includes("returning") || statusStr.includes("повернення")) {
          targetTab = "returns";
          statusText = "Повернення";
        } else if (statusStr.includes("cancelled") || statusStr.includes("returned") || statusStr.includes("скасовано") || statusStr.includes("повернено")) {
          targetTab = "history";
          statusText = statusStr.includes("cancelled") || statusStr.includes("скасовано") ? "Скасовано" : "Повернено";
          statusColor = statusText === "Скасовано" ? "#C0392B" : "#2A2A2A";
        } else {
          targetTab = "waiting_payment";
          statusText = "Оформлено";
        }

        const orderDateStr = order.orderDate
          ? new Date(order.orderDate).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "2-digit" }) + ", " + new Date(order.orderDate).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })
          : "Щойно";

        const items = order.orderItems && order.orderItems.length > 0 ? order.orderItems : [{ id: order.id, productId: 0, quantity: 1, unitPrice: order.totalPrice || 0 }];

        for (const item of items) {
          const prod = item.productId ? productMap.get(item.productId) : null;
          let imageSrc = "/images/catalog/hunger_games.png";
          if (prod?.productImages && prod.productImages.length > 0 && prod.productImages[0].imageData) {
            const rawData = prod.productImages[0].imageData.trim();
            if (rawData.startsWith("data:") || rawData.startsWith("http://") || rawData.startsWith("https://")) {
              imageSrc = rawData;
            } else if (
              rawData.startsWith("/") &&
              !rawData.startsWith("/9j/") &&
              (rawData.startsWith("/images/") ||
                rawData.startsWith("/static/") ||
                rawData.startsWith("/assets/") ||
                rawData.startsWith("/uploads/") ||
                rawData.startsWith("/_next/") ||
                /\.(jpg|jpeg|png|webp|svg|gif|ico)$/i.test(rawData))
            ) {
              imageSrc = rawData;
            } else {
              let mimeType = "image/jpeg";
              if (rawData.startsWith("UklGR")) mimeType = "image/webp";
              else if (rawData.startsWith("/9j/") || rawData.startsWith("9j/")) mimeType = "image/jpeg";
              else if (rawData.startsWith("iVBORw0KGgo")) mimeType = "image/png";
              else if (rawData.startsWith("R0lGOD")) mimeType = "image/gif";
              imageSrc = `data:${mimeType};base64,${rawData}`;
            }
          }

          const rawFormat = (item.format || "").toString().toLowerCase();
          const rawName = (prod?.productName || item.productName || "").toString().toLowerCase();
          const combinedStr = `${rawFormat} ${rawName}`;

          const isEbook = combinedStr.includes("ebook") || combinedStr.includes("елек") || combinedStr.includes("pdf") || combinedStr.includes("epub");
          const isAudio = combinedStr.includes("audio") || combinedStr.includes("аудіо") || combinedStr.includes("mp3");
          const isPaper = combinedStr.includes("paper") || combinedStr.includes("print") || combinedStr.includes("папер") || combinedStr.includes("тверд") || combinedStr.includes("м'як");

          const itemFormats: ("ebook" | "audio" | "print" | string)[] = [];
          if (isEbook) itemFormats.push("ebook");
          if (isAudio) itemFormats.push("audio");
          if (isPaper || itemFormats.length === 0) {
            if (!isEbook && !isAudio) {
              itemFormats.push("print");
            }
          }

          const isDigital = isEbook || isAudio;

          let itemTargetTab = targetTab;
          let itemStatusText = statusText;
          let itemStatusColor = statusColor;
          let itemShowConfirmBtn = showConfirmBtn;

          // Цифрові товари (електронні та аудіокниги) не потребують фізичної відправки.
          // Вони НІКОЛИ не потрапляють у "Очікувана відправка" (waiting_dispatch) чи "Відправлено" (order_sent).
          // Якщо замовлення оплачено/прийнято/в обробці, вони одразу відображаються у "Доставлено" ("add_review").
          if (isDigital && (targetTab === "waiting_dispatch" || targetTab === "order_sent")) {
            itemTargetTab = "add_review";
            itemStatusText = "Доставлено";
            itemStatusColor = "#005b33";
            itemShowConfirmBtn = false;
          }

          const qty = item.quantity || 1;
          let unitPrice = 0;
          if (item.unitPrice && item.unitPrice > 0) {
            unitPrice = item.unitPrice;
          } else if (prod?.price && prod.price > 0) {
            unitPrice = prod.price;
          } else if (order.totalPrice && order.totalPrice > 0) {
            unitPrice = Math.round(order.totalPrice / qty);
          }
          const linePrice = Math.round(unitPrice * qty);

          const cardItem: MockOrderItem = {
            id: `${order.id}-${item.id || Math.random()}`,
            dbOrderId: order.id,
            productId: item.productId ?? undefined,
            orderNumber: `№${String(order.id).padStart(12, "0")}`,
            statusText: itemStatusText,
            statusColor: itemStatusColor,
            lastStatusDate: orderDateStr,
            bookTitle: prod?.productName || "Книга #" + (item.productId || order.id),
            bookImage: imageSrc,
            quantity: qty,
            price: linePrice,
            formats: itemFormats,
            showConfirmReceiptBtn: itemShowConfirmBtn,
          };

          mapped[itemTargetTab].push(cardItem);
        }
      }

      setOrdersByTab(mapped);

      // Якщо в поточній активній вкладці 0 замовлень, автоперемикаємо на першу вкладку із замовленнями
      const tabsOrder: OrderTabId[] = ["waiting_dispatch", "waiting_payment", "order_sent", "add_review", "returns", "history"];
      const tabWithItems = tabsOrder.find((t) => mapped[t].length > 0);
      if (tabWithItems && mapped[activeTab].length === 0) {
        setActiveTab(tabWithItems);
      }
    } catch (err) {
      console.error("Помилка завантаження замовлень з Бази Даних:", err);
      setOrdersByTab(EMPTY_ORDERS_BY_TAB);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseOrders();
  }, []);

  const removeLocalOrder = (targetDbOrderId?: number, targetItemId?: string) => {
    if (typeof window === "undefined") return;
    try {
      const localOrders: any[] = JSON.parse(localStorage.getItem("librellis_local_orders") || "[]");
      const updated = localOrders.filter((lo) => {
        if (targetDbOrderId && lo.id === targetDbOrderId) return false;
        if (targetItemId && targetItemId.includes(String(lo.id))) return false;
        return true;
      });
      localStorage.setItem("librellis_local_orders", JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to remove local order", e);
    }
  };

  const handleAction = async (actionName: string, itemId: string, dbOrderId?: number) => {
    const userId = typeof window !== "undefined" ? getAuthUserId() : null;
    const foundItem = allItems.find((i) => i.id === itemId);

    if (actionName === "delete") {
      if (dbOrderId) {
        try {
          await orderService.apiOrdersIdDelete({ id: dbOrderId });
        } catch (e) {
          console.warn("Failed to delete order from DB", e);
        }
      }
      removeLocalOrder(dbOrderId, itemId);
      showToast("Замовлення успішно видалено");
      await loadDatabaseOrders();
    } else if (actionName === "pay_order") {
      if (dbOrderId) {
        try {
          await orderService.apiOrdersIdPut({
            id: dbOrderId,
            orderDTO: {
              id: dbOrderId,
              status: "Paid",
              userId: userId ?? undefined,
              totalPrice: foundItem ? foundItem.price : undefined,
            },
          });
        } catch (e) {
          console.error("Failed to pay order in DB", e);
        }
      }
      showToast("Оплату отримано! Замовлення переміщено в «Очікування відправки»");
      await loadDatabaseOrders();
    } else if (actionName === "cancel") {
      if (dbOrderId) {
        try {
          await orderService.apiOrdersIdPut({
            id: dbOrderId,
            orderDTO: {
              id: dbOrderId,
              status: "Cancelled",
              userId: userId ?? undefined,
              totalPrice: foundItem ? foundItem.price : undefined,
            },
          });
        } catch (e) {
          console.error("Failed to cancel order in DB", e);
        }
      }
      removeLocalOrder(dbOrderId, itemId);
      showToast("Замовлення скасовано та переміщено в Історію");
      await loadDatabaseOrders();
    } else if (actionName === "confirm_receipt") {
      if (dbOrderId) {
        try {
          await orderService.apiOrdersIdPut({
            id: dbOrderId,
            orderDTO: {
              id: dbOrderId,
              status: "Delivered",
              userId: userId ?? undefined,
              totalPrice: foundItem ? foundItem.price : undefined,
            },
          });
        } catch (e) {
          console.error("Failed to confirm receipt in DB", e);
        }
      }
      showToast("Отримання підтверджено! Товар переміщено в «Додати відгук»");
      await loadDatabaseOrders();
    } else if (actionName === "return") {
      if (foundItem) {
        setSelectedItemForReturn(foundItem);
      } else {
        if (dbOrderId) {
          try {
            await orderService.apiOrdersIdPut({
              id: dbOrderId,
              orderDTO: {
                id: dbOrderId,
                status: "ReturnRequested",
                userId: userId ?? undefined,
              },
            });
          } catch (e) {
            console.error("Failed to return order in DB", e);
          }
        }
        showToast("Заявку на повернення надіслано в Базу Даних");
        await loadDatabaseOrders();
      }
    } else if (actionName === "complain") {
      showToast("Скаргу зареєстровано в системі");
    } else if (actionName === "write_review") {
      const foundItem = allItems.find((i) => i.id === itemId);
      if (foundItem) {
        setSelectedItemForReview(foundItem);
      } else {
        showToast("Відкриття форми написання відгуку...");
      }
    }
  };

  const counts = useMemo(() => {
    return {
      waiting_payment: ordersByTab.waiting_payment.length,
      waiting_dispatch: ordersByTab.waiting_dispatch.length,
      order_sent: ordersByTab.order_sent.length,
      add_review: ordersByTab.add_review.length,
      returns: ordersByTab.returns.length,
      history: ordersByTab.history.length,
    };
  }, [ordersByTab]);

  // Розрахунок реальних бонусних лапок зі здійснених замовлень у Базі Даних
  const { paws, discount } = useMemo(() => {
    const allCompleted = [...ordersByTab.add_review, ...ordersByTab.history.filter(i => i.statusText !== "Скасовано")];
    const totalSpent = allCompleted.reduce((sum, item) => sum + item.price, 0);
    const calculatedPaws = Math.floor(totalSpent / 10);
    return { paws: calculatedPaws, discount: Math.floor(calculatedPaws / 10) };
  }, [ordersByTab]);

  const allItems = ordersByTab[activeTab] || [];
  const totalPages = Math.ceil(allItems.length / itemsPerPage);
  const currentItems = allItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-[#242424] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in border border-gray-700">
          <span className="text-green-400 text-lg">✓</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={Boolean(selectedItemForReview)}
        onClose={() => setSelectedItemForReview(null)}
        item={selectedItemForReview}
        onSubmitSuccess={(msg) => {
          showToast(msg);
          loadDatabaseOrders();
        }}
      />

      {/* Return Modal */}
      <ReturnOrderModal
        isOpen={Boolean(selectedItemForReturn)}
        onClose={() => setSelectedItemForReturn(null)}
        item={selectedItemForReturn}
        onSubmitSuccess={(msg) => {
          showToast(msg);
          loadDatabaseOrders();
        }}
      />

      {/* Мобільна версія (Figma Node 2544:5283 "Мої замовлення") */}
      <div className="block md:hidden">
        <MobileOrdersView
          ordersByTab={ordersByTab}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          counts={counts}
          loading={loading}
          onAction={handleAction}
          paws={paws}
          discount={discount}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          currentItems={currentItems}
        />
      </div>

      {/* Десктопна версія */}
      <div className="hidden md:block">
        <div
          className="relative min-h-screen pt-[160px] md:pt-[210px] pb-20 font-sans"
          style={{
            backgroundImage: "url('/images/userProfile/Rectangle 326.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Block */}
            <OrdersHeader
              paws={paws}
              discount={discount}
            />

            {/* Brown Background Board Container under cards */}
            <div
              className="relative w-full pt-4 pb-20 px-4 sm:px-8 rounded-3xl min-h-[680px] shadow-xl border border-[#B7895E]/40 mt-4"
              style={{
                backgroundImage: "url('/images/addProducts/Rectangle 312.svg')",
                backgroundSize: "cover",
                backgroundPosition: "top center",
              }}
            >
              {/* Tabs Bar */}
              <div className="-mt-2 mb-6">
                <OrdersTabs activeTab={activeTab} onSelectTab={handleTabChange} counts={counts} />
              </div>

              {/* Informational Text Under Tabs for Certain States */}
              {(activeTab === "add_review" || activeTab === "returns" || activeTab === "history") && (
                <div className="text-center text-sm md:text-base font-semibold text-[#242424] my-4 tracking-wide bg-white/70 backdrop-blur-sm py-2.5 px-6 rounded-2xl max-w-md mx-auto shadow-sm border border-white/40">
                  Всі карточки автоматично приберуться через місяць
                </div>
              )}

              {/* Orders List Container */}
              <div className="mt-8">
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="w-10 h-10 border-4 border-[#005b33] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : currentItems.length === 0 ? (
                  <div className="bg-[#D8D3C8]/90 backdrop-blur-sm rounded-3xl p-12 text-center border border-[#C8C2B4] shadow-md my-6 max-w-xl mx-auto flex flex-col items-center gap-3">
                    <span className="text-4xl block mb-1">📦</span>
                    <h3 className="text-xl font-bold text-[#242424]">На цій вкладці замовлень немає</h3>
                    <p className="text-sm text-[#555555]">Ваші реальні замовлення після оформлення з кошика з&apos;являтимуться тут</p>
                    <button
                      onClick={() => router.push("/categories")}
                      className="mt-2 bg-[#005b33] hover:bg-[#004727] text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm"
                    >
                      Перейти до каталогу
                    </button>
                  </div>
                ) : (
                  <>
                    {currentItems.map((item) => (
                      <OrderCard
                        key={item.id}
                        item={item}
                        activeTab={activeTab}
                        onAction={handleAction}
                      />
                    ))}
                    <OrdersPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

