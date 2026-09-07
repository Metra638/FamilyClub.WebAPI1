"use client";

import { useRef } from "react";
import { UpdateClubMemberDto } from "@/lib/api/generated";
import iconDeleteAvatar from "@/public/images/userProfile/editUserProfile/trash-can-solid-full (1) 1.png"
import Image from "next/image";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
    form: UpdateClubMemberDto;
    setField: <K extends keyof UpdateClubMemberDto>(key: K, value: UpdateClubMemberDto[K]) => void;
    avatarData: string | null;
    setAvatarData: (val: string | null) => void;
};

export default function HeaderEditUserProfile({ form, setField, avatarData, setAvatarData }: Props) {
    const t = useTranslations();
    const fileRef = useRef<HTMLInputElement>(null);

    const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = (reader.result as string).split(",")[1];
            setAvatarData(base64);
        };
        reader.readAsDataURL(file);
    };

     const avatarSrc = avatarData
        ? `data:image/jpeg;base64,${avatarData}`
        : null;

    return (
        <div
            className="w-[1120px] h-[396px] flex flex-row items-center px-10 gap-12"
            style={{
                backgroundImage: "url('/images/userProfile/editUserProfile/Rectangle 418.png')",
                backgroundSize: "100% 100%",
                backgroundPosition: "center",
            }}
        >
            {/* Аватар */}
            <div className="flex w-[210px] flex-col items-center gap-3 flex-shrink-0">
                {avatarSrc ? (
                    <img
                        src={avatarSrc}
                        alt={t("profileEdit.avatarAlt")}
                        className="w-[200px] h-[200px] rounded-full object-cover"
                    />
                ) : (
                    <div className="w-[200px] h-[200px] rounded-full bg-[#A87E52] flex items-center justify-center">
                        <span className="text-white text-[80px] font-semibold select-none">
                            {(form.name?.[0] ?? form.surname?.[0] ?? "?").toUpperCase()}
                        </span>
                    </div>
                )}
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatar}
                />
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="px-4 relative mt-1 py-2 bg-[#005B33] text-[22px] w-full h-[56px] text-[var(--color-white)] rounded-[8px] font-semibold hover:bg-[#097E4B] transition-colors"
                >
                    {t("profileEdit.changeAvatar")}
                </button>
                <div className="flex flex-row mt-1 items-center">
                    <button
                        type="button"
                        onClick={() => setAvatarData(null)}
                        className="flex relative items-center w-full h-[36px] gap-2 text-center text-[20px] text-[var(--color-black)] hover:text-red-500 transition-colors"
                    >
                        <Image
                            src={iconDeleteAvatar.src}
                            width={22}
                            height={22}
                            alt="del"
                            className="object-contain"
                        /> {t("profileEdit.deleteAvatar")}
                    </button>
                </div>
            </div>

            {/* Поля */}
            <div className="flex w-full flex-col gap-6 flex-1">
                <div className="flex w-[760px] flex-col gap-1">
                    <label className="text-[22px] font-medium text-[var(--color-black)]">{t("profileEdit.username")}</label>
                    <input
                        type="text"
                        placeholder={t("profileEdit.firstNamePlaceholder")}
                        value={form.name ?? ""}
                        onChange={(e) => setField("name", e.target.value)}
                        className="w-full h-[52px] px-4 rounded-[8px] border border-gray-200 bg-[#f5f5f5] text-[15px] outline-none focus:border-[#005B33]"
                        style={{ boxShadow: "0px 0px 10px 0px #00000040" }}
                    />
                </div>
                <div className="flex w-[760px] flex-col gap-1">
                    <label className="text-[22px] font-medium text-[var(--color-black)]">{t("profileEdit.surname")}</label>
                    <input
                        type="text"
                        placeholder={t("profileEdit.surnamePlaceholder")}
                        value={form.surname ?? ""}
                        onChange={(e) => setField("surname", e.target.value)}
                        className="w-full h-[52px] px-4 rounded-[8px] border border-gray-200 bg-[#f5f5f5] text-[15px] outline-none focus:border-[#005B33]"
                        style={{ boxShadow: "0px 0px 10px 0px #00000040" }}
                    />
                </div>
            </div>
        </div>
    );
}
