"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface DateOfBirth {
    day: string;
    month: string;
    year: string;
}

interface Props {
    onDateChange: (date: Date | null) => void;
    initialDate?: Date | null;
}
export default function PrivacyAndAgeUserProfile({ onDateChange, initialDate }: Props) {
    const t = useTranslations();
    const [showAdult, setShowAdult] = useState(false);
    const [showFavorites, setShowFavorites] = useState(false);
    const [dateOfBirth, setDateOfBirth] = useState<DateOfBirth>({ day: "", month: "", year: "" });

    useEffect(() => {
        if (initialDate) {
            const d = new Date(initialDate);
            setDateOfBirth({
                day: String(d.getDate()).padStart(2, "0"),
                month: String(d.getMonth() + 1).padStart(2, "0"),
                year: String(d.getFullYear()),
            });
        }
    }, [initialDate]);

    const handleDateChange = (updated: DateOfBirth) => {
        setDateOfBirth(updated);
        const { day, month, year } = updated;
        if (!day || !month || !year || year.length < 4) {
            onDateChange(null);
            return;
        }
        const date = new Date(Number(year), Number(month) - 1, Number(day));
        date.setFullYear(Number(year));
        onDateChange(date);
    };
    const inputClass = "w-[70px] h-[44px] text-center rounded-[8px] border border-gray-200 bg-[#f5f5f5] text-[18px] outline-none focus:border-[#005B33]";
    const inputStyle = { boxShadow: "0px 0px 10px 0px #00000040" };

    const ToggleCircle = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => (
        <button type="button" onClick={onToggle} className="flex-shrink-0 mr-[116px]">
            <img
                src={
                    value
                        ? "/images/userProfile/editUserProfile/radio_button_checked_24px.png"
                        : "/images/userProfile/editUserProfile/iconSircle.png"
                }
                alt="toggle"
                className={`w-[26px] h-[26px] object-contain transition-transform duration-200
                    ${value ? "scale-125 -mr-[6px] w-[28px] h-[28px]" : "scale-90"}`}
            />
        </button>
    );

    return (
        <div
            className="w-[560px] flex flex-col"
            style={{
                backgroundImage: "url('/images/userProfile/editUserProfile/Rectangle 479.png')",
                backgroundSize: "100% 100%",
                backgroundPosition: "center",
            }}
        >
            <div className="relative w-[400px] mt-12">
                <img
                    src="/images/userProfile/editUserProfile/Rectangle 480.png"
                    alt="green"
                    className="w-full h-[74px] object-fill"
                />
                <div className="absolute inset-0 -mt-1 flex flex-col justify-center pl-14">
                    <h3 className="text-[22px] text-white font-semibold">{t("profileEdit.privacyTitle")}</h3>
                </div>
            </div>

            <div className="flex w-full flex-col gap-6 px-2 ml-14 mt-4 pb-10">
                {/* Дата народження */}
                <div className="flex flex-row items-start gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[18px] w-full font-medium">{t("profileEdit.birthDate")}</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                maxLength={2}
                                value={dateOfBirth.day}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    const day = e.target.value.replace(/\D/g, "");
                                    handleDateChange({ ...dateOfBirth, day });
                                }}
                                className={inputClass}
                                style={inputStyle}
                            />
                            <input
                                type="text"
                                maxLength={2}
                                value={dateOfBirth.month}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    const month = e.target.value.replace(/\D/g, "");
                                    handleDateChange({ ...dateOfBirth, month });
                                }}
                                className={inputClass}
                                style={inputStyle}
                            />
                            <input
                                type="text"
                                maxLength={5}
                                value={dateOfBirth.year}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    const year = e.target.value.replace(/\D/g, "");
                                    handleDateChange({ ...dateOfBirth, year });
                                }}
                                className="w-[90px] h-[44px] text-center rounded-[8px] border border-gray-200 bg-[#f5f5f5] text-[18px] outline-none focus:border-[#005B33]"
                                style={inputStyle}
                            />
                        </div>
                    </div>
                    <p className="text-[13px] text-gray-500 text-left text-wrap mt-8 max-w-[170px]">
                        {t("profileEdit.ageHint")}
                    </p>
                </div>
                <div className="flex flex-col">
                    <div className="flex w-full h-[50px] items-center justify-between">
                        <span className="text-[18px]">{t("profileEdit.showAdult")}</span>
                        <ToggleCircle value={showAdult} onToggle={() => setShowAdult(!showAdult)} />
                    </div>

                    <div className="flex w-full h-[50px] items-center justify-between">
                        <span className="text-[18px]">{t("profileEdit.showFavorites")}</span>
                        <ToggleCircle value={showFavorites} onToggle={() => setShowFavorites(!showFavorites)} />
                    </div>
                </div>
            </div>
        </div>
    );
}
