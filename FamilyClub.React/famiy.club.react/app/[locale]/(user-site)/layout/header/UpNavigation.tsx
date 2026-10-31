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
import ThemeToggle from "./ThemeToggle";
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

  const handleLogout = () => {
    clearAuthSession();
    setMember(null);
    router.push(localizedPath("/", locale));
  };
  return (
    <>
      <div className="w-full flex items-center justify-between h-full relative flex-nowrap">
        {/* Left: Logo */}
        <div className="w-[120px] h-[65px] shrink-0 relative">
          <Logo />
        </div>

        {/* Center: Language + Theme + Search bar */}
        <div className="flex items-center justify-center flex-1 min-w-0 max-w-[480px] mx-2 lg:mx-4 gap-2">
          <div className="flex h-[50px] items-center justify-center gap-1 shrink-0">
            <UaCircle />
            <ThemeToggle />
          </div>
          <div className="group flex items-center justify-center flex-1 min-w-[140px] max-w-[320px]">
            <div
              className="flex items-center bg-[var(--color-white)] rounded-[25px] px-2 h-[36px] w-full shadow-[0px_0px_10px_0px_#24242466] transition-all
          duration-300
          group-hover:bg-[var(--color-white)]
          group-hover:shadow-[0px_0px_15px_0px_#242424CC]"
            >
              <SearchIco />
            </div>
          </div>
        </div>

        {/* Right: Community, Favorites, Cart + User Dropdown / Auth */}
        <div className="flex items-center gap-2 lg:gap-4 shrink-0">
          <div className="flex items-center h-[50px] gap-2 shrink-0">
            <div className="relative w-[40px] h-[40px]">
              <Link href={localizedPath("/community", locale)}>
                <IcoPeople />
              </Link>
            </div>
            <div className="relative w-[40px] h-[40px]">
              <Link href={localizedPath("/userProfile?tab=favorite", locale)}>
                <FavoriteButton />
              </Link>
            </div>
            <div className="relative w-[40px] h-[40px]">
              <Link href={localizedPath("/cart", locale)}>
                <ShoppingCartButton />
              </Link>
            </div>
          </div>
          <div className="flex items-center h-[40px] shrink-0">
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
              <div className="flex items-center gap-1.5 shrink-0">
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
    </>
  );
}