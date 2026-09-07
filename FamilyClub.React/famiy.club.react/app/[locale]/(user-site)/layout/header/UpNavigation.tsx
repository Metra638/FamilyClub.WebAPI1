"use client";

import Link from "next/link";
import Logo from "./Logo";
import UaCircle from "./UaCircle";
import SearchIco from "./SearchIco";
import IcoPeople from "./IcoPeople";
import FavoriteButton from "./FavoriteButton";
import ShoppingCartButton from "./ShoppingCartButton";
import UserMenuDrop from "./userMenu/UserMenuDrop";
import UserAuthorizationButton from "./UserAuthorizationButton";
import { useEffect, useState } from "react";
import UserLoginButton from "./UserLoginButton";
import { useRouter } from "next/navigation";
import { apiBasePath } from "@/lib/api/services";
import { clearAuthSession, getAuthToken } from "@/lib/auth/tokenStorage";
import { canAccessPath } from "@/lib/auth/accessControl";
import { useUnreadNotificationsCount } from "@/lib/hooks/useUnreadNotificationsCount";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { localizedPath } from "@/lib/i18n/localized-path";

type User = {
  id: string;
  email: string;
  phoneNumber: string;
  name: string;
  surname: string;
  dateOfBirth: string;
  roles: string[];
  avatarData: string;
};

export default function UpNavigation() {
  const [member, setMember] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { locale } = useLocale();

  // єдине джерело правди для лічильника непрочитаних —
  // хук сам перезапитує кількість при події "notifications-updated"
  const notificationCount = useUnreadNotificationsCount(member?.id);

  const fetchUser = async () => {
    const token = getAuthToken();

    if (!token) {
      setMember(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiBasePath}/api/AuthClubMember/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          clearAuthSession(false);
        }
        setMember(null);
        return;
      }

      const data: User = await res.json();
      setMember(data);
    } catch (error) {
      console.log(error);
      setMember(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const handler = () => {
      fetchUser();
    };

    window.addEventListener("auth-change", handler);

    return () => {
      window.removeEventListener("auth-change", handler);
    };
  }, []);

  const isAuthenticated = !!member?.id;
  const showAdminPanel = member?.roles
    ? canAccessPath("/admin/desktop", member.roles) ||
      canAccessPath("/admin/books", member.roles)
    : false;

  if (loading) {
    return null;
  }

  const handleLogout = () => {
    clearAuthSession();
    setMember(null);
    router.push(localizedPath("/", locale));
  };
  return (
    <>
      <div className="max-w-[1100px] mx-auto flex items-center h-full ml-[92px] relative flex-nowrap justify-between">
        <Logo />
        <div className="flex items-center w-[800px] relative ml-[140px] gap-1 mt-[2px]">
          <div className="w-[80px] gap-5 h-[50px] flex items-center justify-center">
            <UaCircle />
          </div>
          <div className="group flex items-center justify-center">
            <div
              className="flex items-center bg-[var(--color-white)] relative left-[8px] rounded-[25px] px-2 h-[36px] w-[290px] shadow-[0px_0px_10px_0px_#24242466] transition-all
          duration-300
          group-hover:bg-[var(--color-white)]
          group-hover:shadow-[0px_0px_15px_0px_#242424CC]"
            >
              <SearchIco />
            </div>
          </div>
          <div className="flex relative items-center gap-4 h-[50px] w-[384px] left-[2vw] ">
            <div className="flex items-center h-[50px] w-[170px] mt-[4px] gap-[8px]">
              <div className=" relative w-[40px] h-[40px] ">
                <Link href={localizedPath("/community", locale)}>
                  <IcoPeople />
                </Link>
              </div>
              <div className=" relative w-[40px] h-[40px] ">
                <Link href={localizedPath("/userProfile?tab=favorite", locale)}>
                  <FavoriteButton />
                </Link>
              </div>
              <div className=" relative w-[40px] h-[40px] ">
                <Link href={localizedPath("/cart", locale)}>
                  <ShoppingCartButton />
                </Link>
              </div>
            </div>
            <div className="flex relative mt-1 -ml-5 items-center h-[40px] w-[144px]">
              {isAuthenticated ? (
                <UserMenuDrop
                  member={{
                    fullName: `${member?.name} ${member?.surname}`,
                    email: member?.email,
                    avatarData: member?.avatarData,
                  }}
                  notificationCount={notificationCount}
                  onCabinet={() => router.push(localizedPath("/userProfile", locale))}
                  onNotifications={() => router.push(localizedPath("/notifications", locale))}
                  onOrders={() => router.push(localizedPath("/orders", locale))}
                  onLibrary={() => router.push(localizedPath("/library", locale))}
                  showAdminPanel={showAdminPanel}
                  onAdminPanel={() => router.push("/admin/desktop")}
                  onLogout={handleLogout}
                />
              ) : (
                <div className="flex w-[196px] items-center gap-1">
                  <Link href={localizedPath("/login", locale)}>
                    <UserLoginButton />
                  </Link>
                  <Link href={localizedPath("/register", locale)}>
                    <UserAuthorizationButton />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}