"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import styles from "../complaints.module.css";

export default function ComplaintPageHeader() {
  const router = useRouter();
  const t = useTranslations();

  return (
    <div className={styles.headerRow}>
      <button
        type="button"
        className={styles.backButton}
        onClick={() => router.back()}
        title={t("complaints.backAria")}
        aria-label={t("complaints.backAria")}
      >
        ←
      </button>
      <h1 className={styles.title}>{t("complaints.title")}</h1>
    </div>
  );
}
