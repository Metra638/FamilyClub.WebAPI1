import { Suspense } from "react";
import CatalogClient from "./CatalogClient";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";

/** Products load on the client via /api rewrite — avoids SSR TLS issues with localhost. */
export default async function CatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(isLocale(locale) ? locale : "uk");

  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[var(--background-main)] pt-[200px] flex justify-center">
          <p className="font-mono text-[#6B6B6B]">{dictionary.catalog.loadingPage}</p>
        </div>
      }
    >
      <CatalogClient />
    </Suspense>
  );
}
