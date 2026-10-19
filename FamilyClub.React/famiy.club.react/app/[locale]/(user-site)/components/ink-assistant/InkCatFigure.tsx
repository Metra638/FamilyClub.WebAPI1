"use client";

import { INK_ASSETS } from "./inkAssets";
import { useSpriteAnimation } from "./useSpriteAnimation";

export type InkCatActivity = "idle" | "thinking" | "writing";

type InkCatFigureProps = {
  emerging: boolean;
  jumpFrame: string;
  /** thinking = не знає відповідь; writing = друкує її */
  activity: InkCatActivity;
  userTyping: boolean;
  reducedMotion: boolean;
  alt: string;
};

export default function InkCatFigure({
  emerging,
  jumpFrame,
  activity,
  userTyping,
  reducedMotion,
  alt,
}: InkCatFigureProps) {
  const thinkingAnim = activity === "thinking" && !emerging && !reducedMotion;
  const writingAnim = activity === "writing" && !emerging && !reducedMotion;

  const thinkFrame = useSpriteAnimation({
    frames: INK_ASSETS.thinking,
    active: thinkingAnim,
    frameMs: 500,
    loops: 999,
  });

  const writeFrame = useSpriteAnimation({
    frames: INK_ASSETS.replyWrite,
    active: writingAnim,
    frameMs: 160,
    loops: 999,
  });

  const src = emerging
    ? jumpFrame || INK_ASSETS.jumpDown[0]
    : thinkingAnim
      ? thinkFrame || INK_ASSETS.thinking[0]
      : activity === "thinking"
        ? INK_ASSETS.thinking[0]
        : writingAnim
          ? writeFrame || INK_ASSETS.replyWrite[0]
          : activity === "writing"
            ? INK_ASSETS.replyWrite[0]
            : userTyping
              ? INK_ASSETS.waitingRequest
              : INK_ASSETS.sit;

  return (
    <div className="ink-cat-in relative mb-10 h-[336px] w-[504px] shrink-0">
      <img
        src={src}
        alt={alt}
        className="pointer-events-none absolute inset-0 h-full w-full object-contain object-bottom drop-shadow-md"
        draggable={false}
      />
    </div>
  );
}
