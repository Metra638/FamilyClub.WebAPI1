"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePaws } from "../hooks/usePaws";
import Image from "next/image";
import { useCurrentUser } from "../../userProfile/hooks/useCurrentUser";
import { usePagination } from "@/app/(admin-site)/admin/users/hooks/usePagination";
import Pagination from "@/app/(admin-site)/admin/users/Pagination";
import ButtonReturn from "../components/ButtonReturn";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

export default function HistoryPaws({ userId }: { userId?: string }) {
  const t = useTranslations();
  const lp = useLocalizedPath();
  const { user } = useCurrentUser();

  const { history, loading } = usePaws(user?.id ?? userId);
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedPawsHistory,
    setCurrentPage,
  } = usePagination(history, 1);

  useEffect(() => {
    document.body.style.backgroundImage = "url('/images/authorsUserPage/Rectangle 326.png')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";

    return () => {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundAttachment = "";
      document.body.style.backgroundPosition = "";
      document.body.style.backgroundRepeat = "";
    };
  }, []);

  return (
    <div className="min-h-screen w-[1000px] flex flex-col ml-[24vw] px-10 py-8" style={{ backgroundColor: "#C7A381" }}>
      <div className="flex items-center gap-4 mt-36 mb-8 relative z-10">
        <Link href={lp("/paws")} className="w-10 h-10 cursor-pointer flex items-center justify-center">
          <ButtonReturn />
        </Link>
        <h2 className="text-[48px] font-bold text-[var(--color-black)] px-4">
          {t("paws.historyTitle")}
        </h2>
      </div>
      <div className="w-[1110px] -mt-12 -ml-24 h-[800px] relative flex flex-col text-[var(--color-black)]">
        <Image
          src="/images/pawsUser/Rectangle 513.png"
          alt=""
          width={1110}
          height={800}
          className="absolute inset-0 object-cover"
        />

        <div className="relative w-full flex-1 min-h-0 flex flex-col items-center text-left justify-center p-2">
          <p className="text-[24px] -mt-110 font-semibold text-[var(--color-black)] mb-6">
            {t("paws.historyHint")}
          </p>

          <div className="flex flex-col space-y-4 ml-6 w-[82%] mt-4 overflow-y-auto max-h-[600px] pr-4">
            {loading ? (
              <div className="text-center py-8 text-gray-600">{t("paws.historyLoading")}</div>
            ) : paginatedPawsHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-600">{t("paws.historyEmpty")}</div>
            ) : (
              paginatedPawsHistory.map((item) => {
                const isPositive = item.amount >= 0;
                return (
                  <div
                    key={item.id}
                    className="flex w-full flex-col items-center justify-between pb-3 text-[28px]"
                  >
                    <div className="flex w-full flex-row items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-[var(--color-black)]">{item.title}</span>
                        <span className="text-[14px] text-[var(--color-black)] mt-0.5">{item.date}</span>
                      </div>
                      <div className="flex items-center gap-2 font-bold text-[20px]">
                        <span className={isPositive ? "text-[var(--color-black)]" : "text-[var(--color-red)]"}>
                          {isPositive ? `+${item.amount}` : item.amount}
                        </span>
                        <Image src="/images/pawsUser/Лапка.png" width={34} height={34} alt="" />
                      </div>
                    </div>
                    <div className="border-b border-[var(--color-black)]/50 w-[90%] -ml-22"></div>
                  </div>
                );
              })
            )}
          </div>

          <div className="w-full absolute bottom-0 flex justify-center shrink-0 px-8 pb-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
