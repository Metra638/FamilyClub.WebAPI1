"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { setAuthSession } from "@/lib/auth/tokenStorage";
import Link from "next/link";
import {
  useLocalizedPath,
  useTranslations,
} from "@/lib/i18n/LocaleProvider";

function AuthCallbackContent() {
  const router = useRouter();
  const t = useTranslations();
  const lp = useLocalizedPath();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    const params = new URLSearchParams(hash);
    const token = params.get("token");
    const userId = params.get("userId") ?? undefined;
    const err = params.get("error");

    if (err) {
      setError(decodeURIComponent(err));
      return;
    }

    if (token) {
      setAuthSession(token, userId, true);
      window.dispatchEvent(new Event("auth-change"));
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", window.location.pathname);
      }
      router.push(lp("/"));
    } else {
      setError(t("auth.callbackMissingToken"));
    }
  }, [router, lp, t]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 font-sans text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md w-full shadow-sm">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {t("auth.callbackErrorTitle")}
          </h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link
            href={lp("/login")}
            className="inline-block bg-[var(--color-green)] text-white font-medium px-6 py-3 rounded-lg hover:brightness-110 transition shadow-md"
          >
            {t("auth.callbackBackToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] font-sans">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-green)] mb-4"></div>
      <p className="text-lg text-gray-700">{t("auth.callbackAuthorizing")}</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  const t = useTranslations();

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] font-sans">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-green)] mb-4"></div>
          <p className="text-lg text-gray-700">{t("auth.callbackLoading")}</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
