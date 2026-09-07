"use client";

import styles from "../complaints.module.css";
import { usePlatformSettingsOptional } from "@/lib/platformSettings/PlatformSettingsContext";
import { mediaSrc } from "@/lib/platformSettings/platformSettingsApi";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  publisherName?: string | null;
  positivePercent?: number;
};

export default function PublisherBanner({
  publisherName,
  positivePercent = 88,
}: Props) {
  const t = useTranslations();
  const { settings } = usePlatformSettingsOptional();
  const name =
    publisherName ?? settings.companyName ?? t("complaints.defaultPublisher");
  const logo =
    mediaSrc(settings.logoData, settings.logoContentType) ??
    "/images/main_page/logo.png";

  return (
    <div className={styles.publisherBanner}>
      <img src={logo} alt="" className={styles.publisherLogo} />
      <div>
        <div className={styles.publisherName}>{name}</div>
        <div className={styles.publisherMeta}>
          {settings.supportEmail || settings.supportPhone
            ? [settings.supportEmail, settings.supportPhone]
                .filter(Boolean)
                .join(" · ")
            : t("complaints.positiveReviews").replace(
                "{percent}",
                String(positivePercent),
              )}
        </div>
      </div>
    </div>
  );
}
