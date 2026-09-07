"use client";

import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { INK_ASSETS, type InkPhase } from "./inkAssets";
import { useSpriteAnimation } from "./useSpriteAnimation";

type InkHouseProps = {
  phase: InkPhase;
  onActivate: () => void;
  onBellComplete: () => void;
  reducedMotion: boolean;
};

/** Intrinsic size of InkInHouse.png */
const IMG_W = 342;
const IMG_H = 460;
/** Widget box (matches Tailwind w/h on wrapper) */
const BOX_W = 210;
const BOX_H = 280;

const DISP_SCALE = Math.min(BOX_W / IMG_W, BOX_H / IMG_H);
const DISP_W = IMG_W * DISP_SCALE;
const DISP_H = IMG_H * DISP_SCALE;

/**
 * Cat opening circle in source-image pixels (measured from cream hole + rim).
 * Overlay is positioned in the displayed image box, so it tracks object-contain.
 */
const HOLE_CX = 243.5;
const HOLE_CY = 78.5;
const HOLE_R = 44;

const HOLE_LEFT = ((HOLE_CX - HOLE_R) / IMG_W) * 100;
const HOLE_TOP = ((HOLE_CY - HOLE_R) / IMG_H) * 100;
const HOLE_SIZE = ((HOLE_R * 2) / IMG_W) * 100;

export default function InkHouse({
  phase,
  onActivate,
  onBellComplete,
  reducedMotion,
}: InkHouseProps) {
  const t = useTranslations();
  const isOpen = phase === "open" || phase === "emerging";
  const isRinging = phase === "ringing";
  const interactive = phase === "idle";

  const bellFrame = useSpriteAnimation({
    frames: INK_ASSETS.ringingBell,
    active: isRinging && !reducedMotion,
    frameMs: 85,
    loops: 3,
    onComplete: onBellComplete,
  });

  const houseSrc = isOpen
    ? INK_ASSETS.outOfHouse
    : isRinging
      ? INK_ASSETS.inHouseRinging
      : INK_ASSETS.inHouse;

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: BOX_W, height: BOX_H }}
    >
      <div className="relative" style={{ width: DISP_W, height: DISP_H }}>
        <img
          src={houseSrc}
          alt={isOpen ? t("ink.houseEmptyAlt") : t("ink.houseWithCatAlt")}
          className="pointer-events-none absolute inset-0 h-full w-full object-fill"
          draggable={false}
        />

        {/* Perfect circle aligned to the cat opening; 5px dark ring, clear center */}
        {interactive && (
          <button
            type="button"
            aria-label={t("ink.callCatAria")}
            onClick={onActivate}
            className="group absolute z-10 cursor-pointer rounded-full border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005B33]"
            style={{
              left: `${HOLE_LEFT}%`,
              top: `${HOLE_TOP}%`,
              width: `${HOLE_SIZE}%`,
              aspectRatio: "1 / 1",
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
              style={{
                background:
                  "radial-gradient(circle, transparent 0%, transparent calc(100% - 5px), rgba(42, 24, 10, 0.78) calc(100% - 5px), rgba(30, 16, 6, 0.92) 100%)",
              }}
            />
          </button>
        )}

        <button
          type="button"
          aria-label={t("ink.ringBellAria")}
          disabled={!interactive && !isRinging}
          onClick={interactive ? onActivate : undefined}
          className={`absolute z-20 border-0 bg-transparent p-0 ${
            interactive ? "cursor-pointer" : "cursor-default"
          } ${isRinging ? "ink-bell-shake" : ""}`}
          style={{
            left: "55%",
            top: "37.5%",
            width: "22%",
            height: "29%",
          }}
        >
          {isRinging && !reducedMotion && (
            <img
              src={bellFrame}
              alt=""
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 h-full w-auto max-w-none -translate-x-1/2 object-contain object-top"
              draggable={false}
            />
          )}
        </button>
      </div>
    </div>
  );
}
