"use client";

import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";

const SOCIALS = [
    { name: "telegram", href: "https://t.me", icon: `/images/userProfile/Vector1.png` },
    { name: "facebook", href: "https://facebook.com", icon: `/images/userProfile/Vector2.png` },
    { name: "instagram", href: "https://instagram.com", icon: `/images/userProfile/Vector3.png` },
];

type Props = { userId?: string };

export default function SocialLinks({ userId }: Props) {
    const t = useTranslations();
    const lp = useLocalizedPath();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const anchorRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ top: 0, left: 0 });

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        let rafId: number;

        function updatePos() {
            rafId = requestAnimationFrame(() => {
                if (!anchorRef.current) return;
                const rect = anchorRef.current.getBoundingClientRect();
                setPos({
                    top: rect.top,
                    left: rect.right + 400,
                });
            });
        }

        updatePos();
        window.addEventListener("scroll", updatePos, { passive: true });
        window.addEventListener("resize", updatePos);
        return () => {
            window.removeEventListener("scroll", updatePos);
            window.removeEventListener("resize", updatePos);
            cancelAnimationFrame(rafId);
        };
    }, [mounted]);

    const editButton = (
        <button
            style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                zIndex: 19,
            }}
            className="hidden md:block px-4 py-2 text-[var(--color-white)] cursor-pointer rounded-[20px] text-[16px] bg-[#005B33] font-semibold hover:bg-[#097E4B] transition-colors duration-200"
            onClick={() => router.push(lp(`/userProfile/editUserProfile/${userId}`))}
        >
            {t("profile.editProfile")}
        </button>
    );

    return (
        <div className="flex items-center gap-4">
            {SOCIALS.map(({ name, href, icon }) => (
                <a key={name} href={href} target="_blank" rel="noopener noreferrer">
                    <Image
                        src={icon}
                        alt={name}
                        width={36}
                        height={36}
                        className="object-contain cursor-pointer hover:opacity-80 transition-opacity duration-200"
                    />
                </a>
            ))}

            {/* Anchor — невидима точка прив'язки для позиції кнопки */}
            <div ref={anchorRef} className="w-0 h-[36px]" />

            {mounted && createPortal(editButton, document.body)}
        </div>
    );
}
