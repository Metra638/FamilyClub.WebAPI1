"use client";

import { useTranslations } from "@/lib/i18n/LocaleProvider";

type SocialLink = { id: number; name: string; url: string };

type Props = {
    links: SocialLink[];
    setLinks: (links: SocialLink[]) => void;
};

export default function SocialLinkEditUserProfile({ links, setLinks }: Props) {
    const t = useTranslations();

    const addLink = () => {
        setLinks([...links, { id: Date.now(), name: "", url: "" }]);
    };

    const removeLink = (id: number) => {
        setLinks(links.filter((l) => l.id !== id));
    };

    const updateLink = (id: number, field: "name" | "url", value: string) => {
        setLinks(links.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
    };
    return (
        <div
            className="w-[1120px]  flex flex-col"
            style={{
                backgroundImage: "url('/images/userProfile/editUserProfile/Rectangle 418.png')",
                backgroundSize: "100% 100%",
                backgroundPosition: "center",
            }}
        >
            {/* Заголовок */}
            <div className="relative w-[630px] mt-12">
                <img
                    src="/images/userProfile/editUserProfile/Rectangle 304.png"
                    alt="green"
                    className="w-full h-[74px] object-fill"
                />
                <div className="absolute inset-0 -mt-1 flex flex-col justify-center pl-14">
                    <h3 className="text-[24px] text-[var(--color-white)] font-semibold">{t("profileEdit.linksTitle")}</h3>
                    <p className="text-[13px] -mt-1 text-[var(--color-white)]">
                        {t("profileEdit.linksHint")}
                    </p>
                </div>
            </div>

            {/* Рядки посилань */}
            <div className="flex w-[1120px] items-center flex-col gap-3 mt-6 px-6">
                {links.map((link) => (
                    <div key={link.id} className="flex items-center gap-3">
                        <img
                            src="/images/userProfile/editUserProfile/Group 647.png"
                            alt="drag"
                            className="w-[25px] mt-4 h-[14px] cursor-grab opacity-50"
                        />

                        {/* Назва */}
                        <div className="flex flex-col gap-0.5 w-[236px]">
                            <label className="text-[11px] text-gray-400 px-1">
                                {t("profileEdit.linkNameLabel")}
                            </label>
                            <input
                                required
                                placeholder="Telegram"
                                type="text"
                                value={link.name}
                                onChange={(e) => updateLink(link.id, "name", e.target.value)}
                                className="w-full h-[52px] px-4 rounded-[8px] border border-gray-200 bg-[#f5f5f5] text-[15px] outline-none focus:border-[#005B33]"
                                style={{ boxShadow: "0px 0px 10px 0px #00000040" }}
                            />
                        </div>

                        {/* URL */}
                        <div className="flex w-[700px] flex-col gap-0.5 flex-1">
                            <label className="text-[11px] text-gray-400 px-1">
                                {t("profileEdit.linkUrlLabel")}
                            </label>
                            <input
                                required
                                type="url"
                                placeholder="https://"
                                value={link.url}
                                onChange={(e) => updateLink(link.id, "url", e.target.value)}
                                className="w-full h-[52px] px-4 rounded-[8px] border border-gray-200 bg-[#f5f5f5] text-[15px] outline-none focus:border-[#005B33]"
                                style={{ boxShadow: "0px 0px 10px 0px #00000040" }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Кнопки */}
            <div className="flex w-[1040px] items-center justify-between ml-10 px-6 mt-auto mt-4 pt-4 mb-6 pb-6 ">
                <button
                    type="button"
                    onClick={addLink}
                    className="flex items-center gap-2 px-6 py-2 bg-[#005B33] text-[var(--color-white)] text-[18px] rounded-[48px] font-semibold hover:bg-[#097E4B] transition-colors h-[52px]"
                >
                    <img
                        src="/images/userProfile/editUserProfile/plus-solid-user.png"
                        alt="+"
                        className="w-[20px] h-[20px] object-contain"
                    />
                    {t("profileEdit.addLink")}
                </button>

                {/* Видалити останній */}
                <button
                    type="button"
                    onClick={() => removeLink(links[links.length - 1]?.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={t("profileEdit.deleteLinkAria")}
                >
                    <img
                        src="/images/userProfile/editUserProfile/Vector.png"
                        alt="delete"
                        className="w-[30px] h-[36px] object-contain"
                    />
                </button>
            </div>
        </div>
    );
}
