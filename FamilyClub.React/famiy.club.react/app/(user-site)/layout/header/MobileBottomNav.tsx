"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { apiBasePath } from "@/lib/api/services";
import { clearAuthSession, getAuthToken } from "@/lib/auth/tokenStorage";

type User = {
  id: string;
  name: string;
  surname: string;
  avatarData: string;
};

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [member, setMember] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = getAuthToken();
      if (!token) {
        setMember(null);
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
      }
    };

    fetchUser();
    const handler = () => fetchUser();
    window.addEventListener("auth-change", handler);
    return () => window.removeEventListener("auth-change", handler);
  }, []);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname?.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    {
      name: "Головна",
      href: "/",
      icon: (active: boolean) => (
        <svg
          className={`w-[24px] h-[24px] transition-colors ${
            active ? "text-[#005B33] fill-current" : "text-[#242424]/60 fill-current"
          }`}
          viewBox="0 0 24 24"
        >
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      name: "Бібліотека",
      href: "/library",
      icon: (active: boolean) => (
        <svg
          className={`w-[24px] h-[24px] transition-colors ${
            active ? "text-[#005B33] fill-current" : "text-[#242424]/60 fill-current"
          }`}
          viewBox="0 0 24 24"
        >
          <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0-2-.9-2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
        </svg>
      ),
    },
    {
      name: "Читальня",
      href: "/categories",
      icon: (active: boolean) => (
        <svg
          className={`w-[24px] h-[24px] transition-colors ${
            active ? "text-[#005B33] fill-current" : "text-[#242424]/60 fill-current"
          }`}
          viewBox="0 0 24 24"
        >
          <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
        </svg>
      ),
    },
    {
      name: "Спільнота",
      href: "/community",
      icon: (active: boolean) => (
        <svg
          className={`w-[24px] h-[24px] transition-colors ${
            active ? "text-[#005B33] fill-current" : "text-[#242424]/60 fill-current"
          }`}
          viewBox="0 0 24 24"
        >
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] block md:hidden h-[70px] bg-[#f5f3ee] border-t border-[#d4b595] shadow-[0px_-4px_15px_rgba(0,0,0,0.15)]">
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1"
            >
              {item.icon(active)}
              <span
                className={`text-[12px] font-medium leading-none tracking-tight ${
                  active ? "text-[#005B33] font-semibold" : "text-[#242424]/70"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* Profile Item */}
        <Link
          href={member ? "/userProfile" : "/login"}
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1"
        >
          <div className="w-[24px] h-[24px] rounded-full overflow-hidden flex items-center justify-center bg-[rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.1)]">
            {member && member.avatarData ? (
              <img
                src={
                  member.avatarData.startsWith("http") ||
                  member.avatarData.startsWith("data:")
                    ? member.avatarData
                    : `data:image/jpeg;base64,${member.avatarData}`
                }
                alt={member.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src="/images/header/person_24px.png"
                alt="Профіль"
                className={`w-[18px] h-[18px] object-contain ${
                  isActive("/userProfile") || isActive("/login")
                    ? "opacity-100"
                    : "opacity-60"
                }`}
              />
            )}
          </div>
          <span
            className={`text-[12px] font-medium leading-none tracking-tight ${
              isActive("/userProfile") || isActive("/login")
                ? "text-[#005B33] font-semibold"
                : "text-[#242424]/70"
            }`}
          >
            Профіль
          </span>
        </Link>
      </div>
    </nav>
  );
}
