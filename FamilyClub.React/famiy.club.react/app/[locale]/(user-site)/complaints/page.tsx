import { Suspense } from "react";
import ComplaintsPageClient from "./ComplaintsPageClient";
import styles from "./complaints.module.css";

export default function ComplaintsPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.loading} style={{ minHeight: "60vh", paddingTop: 120 }}>
          Завантаження...
        </div>
      }
    >
      <ComplaintsPageClient />
    </Suspense>
  );
}
