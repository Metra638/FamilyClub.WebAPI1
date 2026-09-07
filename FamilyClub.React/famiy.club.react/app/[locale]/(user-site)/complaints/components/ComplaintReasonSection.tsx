"use client";

import {
  COMPLAINT_REASONS,
  type ComplaintReason,
} from "../hooks/useComplaintForm";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import styles from "../complaints.module.css";

type Props = {
  value: ComplaintReason | null;
  onChange: (value: ComplaintReason) => void;
};

function RadioBtn({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`${styles.radioButton} ${active ? styles.radioActive : ""}`}
      onClick={onClick}
      role="radio"
      aria-checked={active}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <div className={styles.radioInner} />
    </div>
  );
}

export default function ComplaintReasonSection({ value, onChange }: Props) {
  const t = useTranslations();

  return (
    <div className={styles.card}>
      <div className={styles.sectionLabel}>{t("complaints.reasonTitle")}</div>
      <div className={styles.reasonList}>
        {COMPLAINT_REASONS.map((opt) => (
          <label key={opt.value} className={styles.reasonOption}>
            <RadioBtn
              active={value === opt.value}
              onClick={() => onChange(opt.value)}
            />
            <span className={styles.reasonLabel}>
              {t(`complaints.reasons.${opt.value}`)}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
