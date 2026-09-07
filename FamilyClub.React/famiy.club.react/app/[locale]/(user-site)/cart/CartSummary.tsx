"use client";

import { alertWarning } from "@/lib/ui/sweetAlert";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";
import styles from "./cart.module.css";

export interface CartSummaryProps {
  subtotal: number;
  discount: number;
  deliveryCost: number;
}

export default function CartSummary({ subtotal, discount, deliveryCost }: CartSummaryProps) {
  const t = useTranslations();
  const lp = useLocalizedPath();
  const { locale } = useLocale();
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  const effectiveDelivery = subtotal > 0 ? deliveryCost : 0;
  const total = subtotal > 0 ? Math.max(0, subtotal - discount + deliveryCost) : 0;

  function formatPrice(value: number): string {
    if (value === 0) return t("cart.zeroPrice");
    const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "uk-UA").format(value);
    return t("cart.price").replace("{value}", formatted);
  }

  return (
    <aside className={styles.summaryPanel} id="cart-summary">
      {/* Apply loyalty points */}
      <button className={styles.applyPointsBtn} type="button" id="apply-points-btn">
        {t("cart.applyPoints")}
      </button>

      {/* Summary lines */}
      <div className={styles.summaryLines}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>{t("cart.subtotal")}</span>
          <span className={styles.summaryValue}>{formatPrice(subtotal)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>{t("cart.discount")}</span>
          <span className={`${styles.summaryValue} ${styles.discountValue}`}>
            {discount > 0 ? `- ${formatPrice(discount)}` : t("cart.zeroPrice")}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>{t("cart.delivery")}</span>
          <span className={styles.summaryValue}>{formatPrice(effectiveDelivery)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>{t("cart.total")}</span>
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
          id="agreement-checkbox"
          aria-label={t("cart.agreeAria")}
        />
        <span className={styles.agreementText}>
          {t("cart.agreePrefix")}{" "}
          <a href={lp("/personal-data-protection")} className={styles.agreementLink}>
            {t("cart.privacyPolicy")}
          </a>{" "}
          {t("cart.agreeAnd")}{" "}
          <a href={lp("/terms-of-use")} className={styles.agreementLink}>
            {t("cart.termsOfService")}
          </a>
        </span>
      </div>

      {/* Checkout button */}
      <button
        className={styles.checkoutBtn}
        disabled={subtotal === 0}
        type="button"
        id="checkout-btn"
        onClick={async () => {
          if (!agreed) {
            await alertWarning(t("cart.agreeWarning"));
            return;
          }
          router.push(lp("/checkout"));
        }}
      >
        {t("cart.checkout")}
      </button>

      {/* Promo code */}
      <div className={styles.promoSection}>
        <span className={styles.promoLabel}>{t("cart.hasPromo")}</span>
        <input
          type="text"
          className={styles.promoInput}
          placeholder={t("cart.promoPlaceholder")}
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          id="promo-code-input"
          aria-label={t("cart.promoAria")}
        />
      </div>
    </aside>
  );
}
