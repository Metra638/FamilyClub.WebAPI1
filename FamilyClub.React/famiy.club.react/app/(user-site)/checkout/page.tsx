"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, type FormatType } from "@/lib/hooks/useCart";
import {
  productService,
  orderService,
} from "@/lib/api/services";
import type { ProductDto } from "@/lib/api/generated";
import { getAuthToken, getAuthUserId } from "@/lib/auth/tokenStorage";
import { alertError, alertSuccess, alertWarning } from "@/lib/ui/sweetAlert";
import { useCurrentUser } from "@/app/(user-site)/userProfile/hooks/useCurrentUser";
import styles from "./checkout.module.css";
import MobileCheckoutView from "./MobileCheckoutView";

// ─── Types ───
export type DeliveryProvider = "nova_poshta" | "ukr_poshta" | "meest";
export type DeliveryType = "branch" | "postbox";
export type PaymentMethod = "card_online" | "card_dia" | "cash_on_delivery";

// ─── Helpers ───
function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("uk-UA").format(value)} грн`;
}

// ─── SVGs ───
function BackArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
    </svg>
  );
}

// ─── Constants ───
const DELIVERY_COSTS: Record<string, number> = {
  nova_poshta_branch: 75,
  nova_poshta_postbox: 70,
  ukr_poshta: 50,
  meest: 65,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items: cartItems, clearCart } = useCart();

  // Data
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Current user (pre-fill personal data)
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const prefilledUserIdRef = useRef<string | null>(null);

  // Personal data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Pre-fill personal data from /api/AuthClubMember/me once per user id.
  // Wait until userLoading finishes — otherwise an early empty paint can "stick"
  // if a latch is set before the profile response arrives.
  useEffect(() => {
    if (userLoading || !currentUser?.id) return;
    if (prefilledUserIdRef.current === currentUser.id) return;

    const rawName = (currentUser.name ?? "").trim();
    const rawSurname = (currentUser.surname ?? "").trim();
    const cleanEmail = (currentUser.email ?? "").trim();
    const cleanPhone = (currentUser.phoneNumber ?? "").trim();

    const isPlaceholder = (v: string) => !v || v.toLowerCase() === "string";

    let fName = isPlaceholder(rawName) ? "" : rawName;
    let lName = isPlaceholder(rawSurname) ? "" : rawSurname;

    if (fName.includes(" ") && !lName) {
      const parts = fName.split(/\s+/);
      fName = parts[0] || "";
      lName = parts.slice(1).join(" ") || "";
    }

    setFirstName((prev) => (prev.trim() ? prev : fName));
    setLastName((prev) => (prev.trim() ? prev : lName));
    setEmail((prev) => (prev.trim() ? prev : (isPlaceholder(cleanEmail) ? "" : cleanEmail)));
    setPhone((prev) => (prev.trim() ? prev : (isPlaceholder(cleanPhone) ? "" : cleanPhone)));

    prefilledUserIdRef.current = currentUser.id;
  }, [currentUser, userLoading]);

  // Delivery
  const [deliveryProvider, setDeliveryProvider] = useState<DeliveryProvider>("nova_poshta");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("branch");
  const [city, setCity] = useState("");
  const [branch, setBranch] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card_online");

  // Comment
  const [comment, setComment] = useState("");

  // Summary
  const [agreed, setAgreed] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // ─── Determine if order is digital-only ───
  const hasPhysicalItems = useMemo(() => {
    // For now, treat all items as potentially physical
    // This can be refined by checking format types in cart
    for (const item of cartItems) {
      if (item.formatQuantities.paper > 0) return true;
    }
    return false;
  }, [cartItems]);

  // ─── Fetch products ───
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function load() {
      try {
        const productsRes = await productService.apiProductsGet({ signal: controller.signal });
        if (!mounted) return;
        setProducts(productsRes ?? []);
      } catch (error) {
        console.error("Checkout: failed to fetch data", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  // ─── Enforce login ───
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = getAuthToken();
      const userId = getAuthUserId();
      if (!token || !userId) {
        router.push("/login");
      }
    }
  }, [router]);

  // ─── Lookup ───
  const productById = useMemo(() => {
    const map = new Map<number, ProductDto>();
    for (const p of products) {
      if (p.id != null) map.set(p.id, p);
    }
    return map;
  }, [products]);

  // ─── Compute totals ───
  const { subtotal, discount } = useMemo(() => {
    let sub = 0;
    let disc = 0;

    for (const item of cartItems) {
      const product = productById.get(item.productId);
      if (!product) continue;

      const totalQty =
        item.formatQuantities.paper +
        item.formatQuantities.ebook +
        item.formatQuantities.audio;

      const unitPrice = product.price ?? 0;
      const discountUnitPrice = product.discountPrice;

      sub += totalQty * unitPrice;

      if (discountUnitPrice != null && discountUnitPrice < unitPrice) {
        disc += totalQty * (unitPrice - discountUnitPrice);
      }
    }

    return { subtotal: sub, discount: disc };
  }, [cartItems, productById]);

  const deliveryCost = useMemo(() => {
    if (!hasPhysicalItems) return 0;
    if (deliveryProvider === "nova_poshta") {
      return DELIVERY_COSTS[`nova_poshta_${deliveryType}`] ?? 75;
    }
    return DELIVERY_COSTS[deliveryProvider] ?? 0;
  }, [hasPhysicalItems, deliveryProvider, deliveryType]);

  const total = Math.max(0, subtotal - discount + deliveryCost);

  // ─── Validation ───
  const isFormValid = useMemo(() => {
    if (!firstName.trim() || !lastName.trim()) return false;
    if (!agreed) return false;
    if (cartItems.length === 0) return false;
    return true;
  }, [firstName, lastName, agreed, cartItems]);

  // ─── Submit ───
  async function handleSubmit() {
    if (!isFormValid || submitting) return;
    setSubmitting(true);

    try {
      // Build order items from cart
      const orderItems = cartItems.flatMap((item) => {
        const product = productById.get(item.productId);
        if (!product) return [];

        const results: Array<{ productId: number; quantity: number; unitPrice: number; format?: string }> = [];
        const formats: Array<{ type: FormatType; qty: number }> = [
          { type: "paper", qty: item.formatQuantities.paper },
          { type: "ebook", qty: item.formatQuantities.ebook },
          { type: "audio", qty: item.formatQuantities.audio },
        ];

        for (const f of formats) {
          if (f.qty > 0) {
            const unitPrice = product.discountPrice != null && product.discountPrice < (product.price ?? 0)
              ? product.discountPrice
              : (product.price ?? 0);
            results.push({
              productId: item.productId,
              quantity: f.qty,
              unitPrice,
              format: f.type,
            });
          }
        }

        return results;
      });

      // Get the stored member ID
      const storedId = typeof window !== "undefined"
        ? getAuthUserId()
        : null;

      if (!storedId) {
        await alertWarning("Помилка авторизації. Увійдіть в акаунт.");
        router.push("/login");
        return;
      }

      const initialStatus = paymentMethod === "cash_on_delivery" ? "Pending" : "Paid";

      let apiSuccess = false;
      try {
        await orderService.apiOrdersPost({
          orderDTO: {
            userId: storedId,
            status: initialStatus,
            totalPrice: total,
            orderItems: orderItems.map((oi) => ({
              productId: oi.productId,
              quantity: oi.quantity,
              unitPrice: oi.unitPrice,
              format: oi.format,
              orderId: 0,
            })),
          },
        });
        apiSuccess = true;
      } catch (err) {
        console.warn("Orders API warning, fallback to local persistence", err);
      }

      if (!apiSuccess) {
        const orderIdToSave = Math.floor(10000000 + Math.random() * 90000000);
        const localOrderObj = {
          id: orderIdToSave,
          userId: storedId,
          status: initialStatus,
          orderDate: new Date().toISOString(),
          totalPrice: total,
          orderItems: orderItems.map((oi, idx) => ({
            id: idx + 1,
            productId: oi.productId,
            quantity: oi.quantity,
            unitPrice: oi.unitPrice,
            format: oi.format,
          })),
        };

        if (typeof window !== "undefined") {
          const localOrders = JSON.parse(localStorage.getItem("librellis_local_orders") || "[]");
          localOrders.unshift(localOrderObj);
          localStorage.setItem("librellis_local_orders", JSON.stringify(localOrders));
        }
      }

      // Clear cart after successful order
      await clearCart();
      setSuccess(true);
    } catch (error) {
      console.error("Failed to create order", error);
      await alertError("Помилка при оформленні замовлення. Спробуйте ще раз.");
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Radio component ───
  function RadioBtn({ active, onClick }: { active: boolean; onClick: () => void }) {
    return (
      <div
        className={`${styles.radioButton} ${active ? styles.radioActive : ""}`}
        onClick={onClick}
        role="radio"
        aria-checked={active}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      >
        <div className={styles.radioButtonInner} />
      </div>
    );
  }

  const renderDesktopContent = () => {
    // ─── Loading ───
    if (loading) {
    return (
      <div className={styles.checkoutPage}>
        <div className={styles.checkoutHeader}>
          <h1 className={styles.checkoutTitle}>Оформлення замовлення</h1>
        </div>
        <div className={styles.loadingState}>
          <span className={styles.loadingIcon}>⏳</span>
          Завантаження...
        </div>
      </div>
    );
  }

  // ─── Empty cart ───
  if (cartItems.length === 0 && !success) {
    return (
      <div className={styles.checkoutPage}>
        <div className={styles.checkoutHeader}>
          <button
            className={styles.backButton}
            onClick={() => router.back()}
            aria-label="Назад"
            id="checkout-back-btn"
          >
            <BackArrow />
          </button>
          <h1 className={styles.checkoutTitle}>Оформлення замовлення</h1>
        </div>
        <div className={styles.loadingState}>
          <span className={styles.loadingIcon}>🛒</span>
          Ваш кошик порожній. Додайте товари перед оформленням.
        </div>
      </div>
    );
  }

  // ─── Success ───
  if (success) {
    return (
      <div className={styles.checkoutPage}>
        <div className={styles.successOverlay}>
          <div className={styles.successCard}>
            <span className={styles.successIcon}>✅</span>
            <h2 className={styles.successTitle}>Замовлення оформлено!</h2>
            <p className={styles.successText}>
              Дякуємо за замовлення! Товар додано у розділ «Мої замовлення».
            </p>
            <div className="flex items-center gap-3 justify-center mt-4">
              <button
                className={styles.successBtn}
                onClick={() => router.push("/orders")}
                id="success-orders-btn"
              >
                Мої замовлення
              </button>
              <button
                className="bg-[#E5E0D5] hover:bg-[#D8D2C5] text-[#242424] px-6 py-3 rounded-xl font-medium transition"
                onClick={() => router.push("/")}
                id="success-home-btn"
              >
                На головну
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutPage}>
      {/* Header */}
      <div className={styles.checkoutHeader}>
        <button
          className={styles.backButton}
          onClick={() => router.back()}
          aria-label="Назад"
          id="checkout-back-btn"
        >
          <BackArrow />
        </button>
        <h1 className={styles.checkoutTitle}>Оформлення замовлення</h1>
      </div>

      <div className={styles.checkoutContent}>
        {/* ─── Left: Form sections ─── */}
        <div className={styles.checkoutSections}>

          {/* ── Section 1: Personal Data ── */}
          <div className={styles.sectionCard} id="personal-data-section">
            <h2 className={styles.sectionTitle}>Особисті данні</h2>
            <div className={styles.formGrid}>
              <input
                className={styles.formInput}
                type="text"
                placeholder="Ім'я *"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                id="checkout-first-name"
                aria-label="Ім'я"
              />
              <input
                className={styles.formInput}
                type="text"
                placeholder="Прізвище *"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                id="checkout-last-name"
                aria-label="Прізвище"
              />
              <input
                className={styles.formInput}
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="checkout-email"
                aria-label="Email"
              />
              <div className={styles.phoneInputWrap}>
                <input
                  className={`${styles.formInput} ${styles.phoneInput}`}
                  type="tel"
                  placeholder="+ 380 800 555 35 35"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  id="checkout-phone"
                  aria-label="Телефон"
                />
                <ChevronDown />
              </div>
            </div>
          </div>

          {/* ── Section 2: Delivery (only for physical goods) ── */}
          {hasPhysicalItems && (
            <div className={styles.sectionCard} id="delivery-section">
              <h2 className={styles.sectionTitle}>
                Доставка{" "}
                <span className={styles.sectionTitleNote}>
                  (якщо у вас на замовлення паперова книга)
                </span>
              </h2>

              <div className={styles.deliveryOptions}>
                {/* Nova Poshta */}
                <div>
                  <div
                    className={styles.deliveryOption}
                    onClick={() => setDeliveryProvider("nova_poshta")}
                    id="delivery-nova-poshta"
                  >
                    <div className={styles.deliveryOptionLeft}>
                      <RadioBtn
                        active={deliveryProvider === "nova_poshta"}
                        onClick={() => setDeliveryProvider("nova_poshta")}
                      />
                      <span className={styles.deliveryOptionName}>Нова пошта</span>
                    </div>
                    <div className={styles.deliveryOptionRight}>
                      <span className={styles.deliveryTerm}>
                        <span className={styles.deliveryTermLabel}>Термін: </span>
                        2-4 робочі дні
                      </span>
                    </div>
                  </div>

                  {/* Sub-options for Nova Poshta */}
                  {deliveryProvider === "nova_poshta" && (
                    <>
                      <div className={styles.deliverySubOptions}>
                        <div
                          className={styles.deliverySubOption}
                          onClick={() => setDeliveryType("branch")}
                        >
                          <div className={styles.deliverySubOptionRow}>
                            <RadioBtn
                              active={deliveryType === "branch"}
                              onClick={() => setDeliveryType("branch")}
                            />
                            <span className={styles.deliverySubOptionName}>Відділення</span>
                          </div>
                          <span className={styles.deliverySubOptionCost}>Вартість 75 грн</span>
                        </div>
                        <div
                          className={styles.deliverySubOption}
                          onClick={() => setDeliveryType("postbox")}
                        >
                          <div className={styles.deliverySubOptionRow}>
                            <RadioBtn
                              active={deliveryType === "postbox"}
                              onClick={() => setDeliveryType("postbox")}
                            />
                            <span className={styles.deliverySubOptionName}>Поштомат</span>
                          </div>
                          <span className={styles.deliverySubOptionCost}>Вартість 70 грн</span>
                        </div>
                      </div>

                      {/* City + Branch selectors */}
                      <div className={styles.deliverySelectors}>
                        <div className={styles.deliverySelect}>
                          <input
                            className={styles.deliverySelectInput}
                            type="text"
                            placeholder="Оберіть населений пункт *"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            id="delivery-city"
                            aria-label="Населений пункт"
                          />
                          <div className={styles.deliverySelectIcon}>
                            <ChevronDown />
                          </div>
                        </div>
                        <div className={styles.deliverySelect}>
                          <input
                            className={styles.deliverySelectInput}
                            type="text"
                            placeholder="Відділення Нової пошти *"
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            id="delivery-branch"
                            aria-label="Відділення"
                          />
                          <div className={styles.deliverySelectIcon}>
                            <ChevronDown />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Ukr Poshta */}
                <div
                  className={styles.deliveryOption}
                  onClick={() => setDeliveryProvider("ukr_poshta")}
                  id="delivery-ukr-poshta"
                >
                  <div className={styles.deliveryOptionLeft}>
                    <RadioBtn
                      active={deliveryProvider === "ukr_poshta"}
                      onClick={() => setDeliveryProvider("ukr_poshta")}
                    />
                    <span className={styles.deliveryOptionName}>Укр пошта</span>
                  </div>
                  <div className={styles.deliveryOptionRight}>
                    <span className={styles.deliveryTerm}>
                      <span className={styles.deliveryTermLabel}>Термін: </span>
                      3-7 робочі дні
                    </span>
                  </div>
                </div>

                {/* Meest */}
                <div
                  className={styles.deliveryOption}
                  onClick={() => setDeliveryProvider("meest")}
                  id="delivery-meest"
                >
                  <div className={styles.deliveryOptionLeft}>
                    <RadioBtn
                      active={deliveryProvider === "meest"}
                      onClick={() => setDeliveryProvider("meest")}
                    />
                    <span className={styles.deliveryOptionName}>Meest</span>
                  </div>
                  <div className={styles.deliveryOptionRight}>
                    <span className={styles.deliveryTerm}>
                      <span className={styles.deliveryTermLabel}>Термін: </span>
                      2-4 робочі дні
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Section 3: Payment ── */}
          <div className={styles.sectionCard} id="payment-section">
            <h2 className={styles.sectionTitle}>Спосіб оплати</h2>
            <div className={styles.paymentOptions}>
              <div
                className={styles.paymentOption}
                onClick={() => setPaymentMethod("card_online")}
                id="payment-card-online"
              >
                <div className={styles.paymentOptionLeft}>
                  <RadioBtn
                    active={paymentMethod === "card_online"}
                    onClick={() => setPaymentMethod("card_online")}
                  />
                  <span className={styles.paymentOptionName}>Оплата карткою онлайн</span>
                </div>
                <div className={styles.paymentLogos}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1f71" }}>VISA</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#eb001b" }}>●</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#f79e1b" }}>●</span>
                </div>
              </div>

              <div
                className={styles.paymentOption}
                onClick={() => setPaymentMethod("card_dia")}
                id="payment-card-dia"
              >
                <div className={styles.paymentOptionLeft}>
                  <RadioBtn
                    active={paymentMethod === "card_dia"}
                    onClick={() => setPaymentMethod("card_dia")}
                  />
                  <span className={styles.paymentOptionName}>
                    Оплата карткою онлайн ( Дія.Картка: єПідтримка, єКнига)
                  </span>
                </div>
                <div className={styles.paymentLogos}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1f71" }}>VISA</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#eb001b" }}>●</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#f79e1b" }}>●</span>
                </div>
              </div>

              <div
                className={styles.paymentOption}
                onClick={() => setPaymentMethod("cash_on_delivery")}
                id="payment-cash"
              >
                <div className={styles.paymentOptionLeft}>
                  <RadioBtn
                    active={paymentMethod === "cash_on_delivery"}
                    onClick={() => setPaymentMethod("cash_on_delivery")}
                  />
                  <span className={styles.paymentOptionName}>Оплата під час отримання</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 4: Comment (only for physical goods) ── */}
          {hasPhysicalItems && (
            <div className={styles.sectionCard} id="comment-section">
              <h2 className={styles.sectionTitle}>Коментар до замовлення</h2>
              <textarea
                className={styles.commentTextarea}
                placeholder="Ваш коментар..."
                maxLength={500}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                id="checkout-comment"
                aria-label="Коментар до замовлення"
              />
              <div className={styles.commentFooter}>
                <span className={styles.commentCharCount}>{comment.length}/500 символів</span>
                <div className={styles.commentActions}>
                  <button
                    className={styles.commentCancelBtn}
                    type="button"
                    onClick={() => setComment("")}
                  >
                    Скасувати
                  </button>
                  <button className={styles.commentSaveBtn} type="button">
                    Зберегти
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Right: Summary sidebar ─── */}
        <aside className={styles.summaryPanel} id="checkout-summary">
          {/* Apply loyalty points */}
          <button className={styles.applyPointsBtn} type="button" id="checkout-apply-points">
            Застосувати лапки до знижки
          </button>

          {/* Summary lines */}
          <div className={styles.summaryLines}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Сума:</span>
              <span className={styles.summaryValue}>{formatPrice(subtotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Знижка:</span>
              <span className={`${styles.summaryValue} ${styles.discountValue}`}>
                {discount > 0 ? `- ${formatPrice(discount)}` : "0 грн"}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Вартість доставки:</span>
              <span className={styles.summaryValue}>
                {hasPhysicalItems ? formatPrice(deliveryCost) : "Безкоштовно"}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Сума до сплати:</span>
              <span className={`${styles.summaryValue} ${styles.totalValue}`}>
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <div className={styles.summaryDivider} />

          {/* Agreement checkbox */}
          <div className={styles.agreement}>
            <input
              type="checkbox"
              className={styles.agreementCheckbox}
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              id="checkout-agreement"
              aria-label="Погоджуюсь з умовами"
            />
            <span className={styles.agreementText}>
              Погоджуюсь з{" "}
              <a href="/privacy-policy" className={styles.agreementLink}>
                Політикою конфіденційності
              </a>{" "}
              та з{" "}
              <a href="/terms-of-service" className={styles.agreementLink}>
                Користувацькою угодою
              </a>
            </span>
          </div>

          {/* Order button */}
          <button
            className={styles.orderBtn}
            disabled={!isFormValid || submitting}
            type="button"
            onClick={handleSubmit}
            id="checkout-order-btn"
          >
            {submitting ? "Оформлення..." : "Замовити"}
          </button>

          {/* Promo code */}
          <div className={styles.promoSection}>
            <span className={styles.promoLabel}>Є промокод?</span>
            <input
              type="text"
              className={styles.promoInput}
              placeholder="Промокод..."
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              id="checkout-promo-input"
              aria-label="Введіть промокод"
            />
          </div>
        </aside>
      </div>
    </div>
    );
  };

  return (
    <>
      <div className="block md:hidden">
        <MobileCheckoutView
          loading={loading}
          cartItems={cartItems}
          success={success}
          hasPhysicalItems={hasPhysicalItems}
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          deliveryProvider={deliveryProvider}
          setDeliveryProvider={setDeliveryProvider}
          deliveryType={deliveryType}
          setDeliveryType={setDeliveryType}
          city={city}
          setCity={setCity}
          branch={branch}
          setBranch={setBranch}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          comment={comment}
          setComment={setComment}
          subtotal={subtotal}
          discount={discount}
          deliveryCost={deliveryCost}
          total={total}
          agreed={agreed}
          setAgreed={setAgreed}
          promoCode={promoCode}
          setPromoCode={setPromoCode}
          isFormValid={isFormValid}
          submitting={submitting}
          handleSubmit={handleSubmit}
          formatPrice={formatPrice}
        />
      </div>

      <div className="hidden md:block">
        {renderDesktopContent()}
      </div>
    </>
  );
}
