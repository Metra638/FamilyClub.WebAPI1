"use client";

import { useTranslations } from "@/lib/i18n/LocaleProvider";

const MAX_LENGTH = 500;
type Props = {
    about: string;
    setAbout: (val: string) => void;
};

export default function AboutBlockEditUserProfile({ about, setAbout }: Props) {
    const t = useTranslations();

    return (
        <div className="w-[1120px] flex flex-col relative">
            {/* Фон */}
            <img
                src="/images/userProfile/editUserProfile/Rectangle 473.png"
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ objectFit: "fill" }}
            />
            <div className="relative w-[300px] mt-12">
                <img
                    src="/images/userProfile/editUserProfile/Rectangle 474.png"
                    alt="green"
                    className="w-full h-[74px] object-fill"
                />
                <div className="absolute inset-0 -mt-1 flex flex-col justify-center pl-14">
                    <h3 className="text-[24px] text-white font-semibold">{t("profileEdit.aboutTitle")}</h3>
                </div>
            </div>
            <div className="relative z-10 w-[1126px] flex flex-col px-20 pb-12">
                {/* Textarea */}
                <textarea
                    value={about}
                    onChange={(e) => {
                        if (e.target.value.length <= MAX_LENGTH) {
                            setAbout(e.target.value);
                        }
                    }}
                    placeholder="..."
                    rows={7}
                    className="mt-6 w-full px-4 py-3 rounded-[12px] border border-gray-200 bg-[#f5f5f5] text-[15px] outline-none focus:border-[#005B33] resize-none"
                    style={{ boxShadow: "0px 0px 10px 0px #00000040" }}
                />

                {/* Лічильник і кнопки */}
                <div className="flex items-center justify-between mt-2">
                    <span className="text-[18px] text-[var(--color-black)]">
                        {t("profileEdit.charCount")
                            .replace("{count}", String(about.length))
                            .replace("{max}", String(MAX_LENGTH))}
                    </span>
                    <div className="flex gap-6">
                        <button
                            type="button"
                            onClick={() => setAbout("")}
                            className="text-[18px] font-medium text-[var(--color-black)]-600 hover:text-[var(--color-black)]-1000 transition-colors"
                        >
                            {t("profileEdit.cancel")}
                        </button>
                        <button
                            type="button"
                            className="text-[18px] font-medium text-[#005B33] hover:text-[#097E4B] transition-colors"
                        >
                            {t("profileEdit.save")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
