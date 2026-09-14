"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";
import styles from "../checkout.module.css";

export default function CheckoutCancelPage() {
  const t = useTranslations();
  const lp = useLocalizedPath();
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId") ?? "";
  const cancelText = t("checkout.cancelText").replace("{orderId}", orderId || "—");

  return (
    <div className={styles.checkoutPage}>
      <div className={styles.successOverlay}>
        <div className={styles.successCard}>
          <span className={styles.successIcon}>⚠️</span>
          <h2 className={styles.successTitle}>{t("checkout.cancelTitle")}</h2>
          <p className={styles.successText}>{cancelText}</p>
          <div className="flex items-center gap-3 justify-center mt-4 flex-wrap">
            <button
              className={styles.successBtn}
              onClick={() => router.push(lp("/checkout"))}
              type="button"
            >
              {t("checkout.tryAgain")}
            </button>
            <button
              className="bg-[#E5E0D5] hover:bg-[#D8D2C5] text-[#242424] px-6 py-3 rounded-xl font-medium transition"
              onClick={() => router.push(lp("/orders"))}
              type="button"
            >
              {t("checkout.myOrders")}
            </button>
            <button
              className="bg-[#E5E0D5] hover:bg-[#D8D2C5] text-[#242424] px-6 py-3 rounded-xl font-medium transition"
              onClick={() => router.push(lp("/"))}
              type="button"
            >
              {t("checkout.goHome")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
