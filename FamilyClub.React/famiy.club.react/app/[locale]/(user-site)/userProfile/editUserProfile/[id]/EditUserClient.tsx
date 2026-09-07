"use client"

import { useEffect } from "react";
import HeaderEditUserProfile from "./section/HeaderEditUserProfile";
import SocialLinkEditUserProfile from "./section/SocialLinkEditUserProfile";
import AboutBlockEditUserProfile from "./section/AboutBlockEditUserProfile";
import SecurityEditUserProfile from "./section/SecurityEditUserProfile";
import FavoriteCategoryUserProfile from "./section/FavoriteCategoryUserProfile";
import SettingsUserProfile from "./section/SettingsUserProfile";
import PrivacyAndAgeUserProfile from "./section/PrivacyAndAgeUserProfile";
import ButtonSubmitEditUserProfile from "./section/ButtonSubmitEditUserProfile";
import useEditForm from "./hooks/useEditForm";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import ButtonReturn from "./ui/ButtonReturn";
import { apiBasePath } from "@/lib/api/services";
import { getAuthToken } from "@/lib/auth/tokenStorage";
import { useTranslations } from "@/lib/i18n/LocaleProvider";


export default function EditUserClient({ id }: { id: string }) {
    const t = useTranslations();
    const {
        form,
        setField,
        avatarData,
        setAvatarData,
        loading,
        about,
        setAbout,
        links,
        setLinks,
        selectedCategories,
        setSelectedCategories } = useEditForm(id);
    const { user } = useCurrentUser();
    const router = useRouter();
    useEffect(() => {
        document.body.style.backgroundImage =
            "url('/images/userProfile/editUserProfile/Rectangle 326.png')";
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
    const handleSave = async () => {
        const token = getAuthToken();

        const formData = new FormData();
        formData.append("name", form.name ?? "");
        formData.append("surname", form.surname ?? "");
        formData.append("phoneNumber", form.phoneNumber ?? "");
        if (form.dateOfBirth) {
            const d = new Date(form.dateOfBirth);
            const dateOnly = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            formData.append("dateOfBirth", dateOnly);
        }
        if (avatarData) {
            const byteString = atob(avatarData);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: "image/jpeg" });
            formData.append("avatar", blob, "avatar.jpg");
        }

        await fetch(`${apiBasePath}/api/ClubMember/${id}/form`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });

        await fetch(`${apiBasePath}/api/ClubMember/${id}/favorite-categories`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(selectedCategories),
        });

        // Спочатку диспатч — даємо час хедеру оновитись
        window.dispatchEvent(new Event("auth-change"));

        // Чекаємо поки fetchUser завершиться
        await new Promise((resolve) => setTimeout(resolve, 500));

        router.back();
    };

    return (
        <div
            className="relative min-h-screen w-full mt-[40vh] flex flex-col items-center"
            style={{
                backgroundImage: "url('/images/userProfile/editUserProfile/Rectangle194.png')",
                backgroundSize: "100% auto",
                backgroundPosition: "top center",
                backgroundRepeat: "no-repeat",
                minHeight: "100vh",
            }}
        >
            <div className="w-full flex flex-col text-left -top-[28vh] gap-2 ml-[53vw] justify-center relative">
                <h2 className="text-[48px] text-[var(--color-white)]">{t("profileEdit.title")}</h2>
                <p className="text-[18px] text-[var(--color-white)] w-[600px]">{t("profileEdit.subtitle")}</p>
            </div>
            <div className="flex z-10 relative -top-[38vh] -ml-[53vw]">
                <ButtonReturn />
            </div>

            <div className="w-full flex items-center justify-center relative -mt-[33vh]">
                <HeaderEditUserProfile
                    form={form}
                    setField={setField}
                    avatarData={avatarData}
                    setAvatarData={setAvatarData} />
            </div>
            {/* чи потрібне? */}
            <div className="w-full flex items-center justify-center relative mt-[1vh]">
                <SocialLinkEditUserProfile
                    links={links}
                    setLinks={setLinks} />
            </div>
            <div className="w-full flex items-center justify-center relative mt-[1vh]">
                <AboutBlockEditUserProfile
                    about={about}
                    setAbout={setAbout} />
            </div>
            <div className="flex flex-row items-center mb-6 pb-4">
                <div className="flex flex-col items-center ">
                    <SecurityEditUserProfile
                        userId={id}
                        userEmail={user?.email ?? ""} />
                    <SettingsUserProfile />
                </div>
                <div className="flex flex-col items-center -mt-16 mb-2 pb-2">
                    <FavoriteCategoryUserProfile
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories} />
                    <PrivacyAndAgeUserProfile
                        initialDate={form.dateOfBirth ? new Date(form.dateOfBirth) : null}
                        onDateChange={(date) => setField("dateOfBirth", date)} />
                    <ButtonSubmitEditUserProfile onSave={handleSave}
                        onCancel={() => router.back()}
                        loading={loading} />
                </div>
            </div>
        </div>
    )
}
