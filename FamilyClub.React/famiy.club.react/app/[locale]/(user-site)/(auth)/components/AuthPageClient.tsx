"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import LoginSection from "./LoginSection";
import RegisterSection from "./RegisterSection";
import MobileAuthView from "../MobileAuthView";
import MobileRegisterView from "../MobileRegisterView";
import { useLocalizedPath } from "@/lib/i18n/LocaleProvider";

type AuthSection = "login" | "register";

const SCROLL_DURATION_MS = 800;
const MAX_CORNER_RADIUS = 150;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function AuthPageClient() {
  const router = useRouter();
  const lp = useLocalizedPath();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const skipPathAnimation = useRef(false);
  const offsetRef = useRef(0);
  const slideDistanceRef = useRef(0);

  const section: AuthSection = pathname.endsWith("/register") ? "register" : "login";

  const [translateY, setTranslateY] = useState(0);
  const [cornerRadius, setCornerRadius] = useState(
    section === "login" ? MAX_CORNER_RADIUS : 0,
  );

  const measureSlideDistance = useCallback(() => {
    const distance = panelRef.current?.clientHeight ?? window.innerHeight;
    if (distance > 0) slideDistanceRef.current = distance;
    return slideDistanceRef.current;
  }, []);

  const applySlideProgress = useCallback(
    (offset: number) => {
      const distance = slideDistanceRef.current || measureSlideDistance();
      const progress = distance > 0 ? Math.min(Math.max(offset / distance, 0), 1) : 0;

      offsetRef.current = offset;
      setTranslateY(-offset);
      setCornerRadius(MAX_CORNER_RADIUS * (1 - progress));
    },
    [measureSlideDistance],
  );

  const animateToSection = useCallback(
    (target: AuthSection, instant = false) => {
      const distance = measureSlideDistance();
      const destination = target === "login" ? 0 : distance;

      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      if (instant || distance === 0) {
        applySlideProgress(destination);
        return;
      }

      const start = offsetRef.current;
      const delta = destination - start;
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / SCROLL_DURATION_MS, 1);
        applySlideProgress(start + delta * easeInOutCubic(t));

        if (t < 1) {
          animationRef.current = requestAnimationFrame(step);
        } else {
          animationRef.current = null;
        }
      };

      animationRef.current = requestAnimationFrame(step);
    },
    [applySlideProgress, measureSlideDistance],
  );

  const goToSection = useCallback(
    (target: AuthSection) => {
      skipPathAnimation.current = true;
      animateToSection(target);
      router.replace(target === "login" ? lp("/login") : lp("/register"), { scroll: false });
    },
    [animateToSection, router, lp],
  );

  useEffect(() => {
    measureSlideDistance();
    const onResize = () => measureSlideDistance();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measureSlideDistance]);

  useEffect(() => {
    if (skipPathAnimation.current) {
      skipPathAnimation.current = false;
      return;
    }

    requestAnimationFrame(() => {
      animateToSection(section, true);
    });
  }, [section, animateToSection]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const blockManualScroll = (event: Event) => {
      event.preventDefault();
    };

    panel.addEventListener("wheel", blockManualScroll, { passive: false });
    panel.addEventListener("touchmove", blockManualScroll, { passive: false });

    return () => {
      panel.removeEventListener("wheel", blockManualScroll);
      panel.removeEventListener("touchmove", blockManualScroll);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Mobile Auth View (hidden on md and up) */}
      <div className="block md:hidden">
        {section === "register" ? <MobileRegisterView /> : <MobileAuthView />}
      </div>

      {/* Desktop Auth View (hidden on mobile) */}
      <div className="hidden md:flex fixed inset-0 z-[100] justify-end">
        <div
          className="absolute inset-0 z-[-1]"
          style={{
            backgroundImage: 'url("/images/login register/background.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div
          style={{
            width: "50%",
            minWidth: "600px",
            background:
              "linear-gradient(193.17deg, #C7A381 0%, #E0C3A9 54.33%, #B7895E 82.69%, #BF8D5D 100%)",
            borderTopLeftRadius: `${cornerRadius}px`,
          }}
          className="relative h-screen shadow-[-20px_0_30px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          <button
            onClick={() => router.back()}
            className="absolute z-10 w-[44px] h-[44px] rounded-full flex items-center justify-center text-[20px] transition-all hover:bg-[#F5F3EE] active:scale-95"
            style={{
              top: "70px",
              left: "65px",
              backgroundColor: "#F5F3EE80",
              color: "var(--color-black)",
              opacity: 0.5,
            }}
          >
            ←
          </button>

          <div
            ref={panelRef}
            className="h-full overflow-hidden touch-none"
            style={{ touchAction: "none" }}
          >
            <div
              style={{
                transform: `translateY(${translateY}px)`,
                willChange: "transform",
              }}
            >
              <section
                id="login"
                className="flex flex-col items-center h-screen px-4 box-border"
                style={{ paddingTop: "110px", paddingBottom: "32px" }}
              >
                <LoginSection onGoToRegister={() => goToSection("register")} />
              </section>

              <section
                id="register"
                className="flex flex-col items-center justify-center min-h-screen px-4 box-border overflow-y-auto"
                style={{ paddingTop: "15px", paddingBottom: "15px" }}
              >
                <RegisterSection onGoToLogin={() => goToSection("login")} />
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
