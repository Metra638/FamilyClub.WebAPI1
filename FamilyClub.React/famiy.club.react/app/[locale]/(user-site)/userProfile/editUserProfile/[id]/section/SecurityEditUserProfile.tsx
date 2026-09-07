"use client";

import { useState } from "react";
import { usePasswordChange } from "@/lib/hooks/usePasswordChange";
import PasswordToggleButton from "../ui/PasswordToggleButton";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
    userId: string;
    userEmail: string;
};

export default function SecurityEditUserProfile({ userId, userEmail }: Props) {
    const t = useTranslations();
    const {
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        submitting,
        error,
        handleChangePassword,
    } = usePasswordChange(userId);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const inputClass = "w-full h-[52px] px-4 rounded-[8px] border border-gray-200 bg-[#f5f5f5] text-[15px] outline-none focus:border-[#005B33]";
    const inputStyle = { boxShadow: "0px 0px 10px 0px #00000040" };

    return (
        <div className="w-[560px] h-[822px]"
            style={{
                backgroundImage: "url('/images/userProfile/editUserProfile/Rectangle 471.png')",
                backgroundSize: "100% 100%",
                backgroundPosition: "center",
            }}>
            <div className="relative w-[260px] mt-12">
                <img
                    src="/images/userProfile/editUserProfile/Rectangle 477.png"
                    alt="green"
                    className="w-full h-[74px] object-fill"
                />
                <div className="absolute inset-0 -mt-1 flex flex-col justify-center pl-14">
                    <h3 className="text-[24px] text-[var(--color-white)] font-semibold">{t("profileEdit.securityTitle")}</h3>
                </div>
            </div>
            <div className="flex w-[460px] flex-col gap-4 px-4 ml-13 mt-4 pb-8">
                <div className="flex flex-col gap-1">
                    <label className="text-[20px] font-medium">Email</label>
                    <input
                        type="email"
                        value={userEmail}
                        readOnly
                        className={inputClass}
                        style={inputStyle}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[20px] font-medium">{t("profileEdit.currentPassword")}</label>
                    <div className="relative">
                        <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className={inputClass}
                            style={inputStyle}
                        />
                        <PasswordToggleButton
                            show={showCurrentPassword}
                            onToggle={() => setShowCurrentPassword((p) => !p)}
                        />
                    </div>
                </div>

                <hr className="border-black-300 mt-6" />

                <div className="flex flex-col gap-1 mt-8">
                    <label className="text-[20px] font-medium">{t("profileEdit.newPassword")}</label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={inputClass}
                            style={inputStyle}
                        />
                        <PasswordToggleButton
                            show={showNewPassword}
                            onToggle={() => setShowNewPassword((p) => !p)}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[20px] font-medium">{t("profileEdit.confirmPassword")}</label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={inputClass}
                            style={inputStyle}
                        />
                        <PasswordToggleButton
                            show={showConfirmPassword}
                            onToggle={() => setShowConfirmPassword((p) => !p)}
                        />
                    </div>
                </div>

                {/* Кнопки */}
                <button
                    type="button"
                    onClick={handleChangePassword}
                    className="flex items-center justify-center gap-2 w-full h-[52px] bg-[#005B33] text-white text-[20px] font-semibold rounded-[8px] hover:bg-[#097E4B] transition-colors"
                >
                    <img
                        src="/images/userProfile/editUserProfile/lock-solid-full 1.png"
                        alt="ic"
                        className="w-[20px] h-[20px] object-contain"
                    />
                    {submitting ? t("profileEdit.changing") : t("profileEdit.changePassword")}
                </button>

                <button
                    type="button"
                    className="flex items-center justify-center w-full h-[52px] border-2 border-[#005B33] text-[#005B33] text-[20px] font-semibold rounded-[8px] hover:bg-[#f0f9f4] transition-colors"
                >
                    {t("profileEdit.twoFactor")}
                </button>
            </div>
        </div>
    )
}
