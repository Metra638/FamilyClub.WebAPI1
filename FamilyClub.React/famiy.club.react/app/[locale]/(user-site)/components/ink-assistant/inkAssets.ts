export const INK_ASSETS = {
  inHouse: "/images/Ink/InkInHouse.png",
  /** House with cat but without the static bell — for ringing overlay */
  inHouseRinging: "/images/Ink/InkInHouseRinging.png",
  outOfHouse: "/images/Ink/InkOutOfHouse.png",
  lying: "/images/Ink/lying.png",
  ringingBell: [
    "/images/Ink/RingingBell/1.png",
    "/images/Ink/RingingBell/2.png",
    "/images/Ink/RingingBell/3.png",
    "/images/Ink/RingingBell/4.png",
  ],
  jumpDown: [
    "/images/Ink/jump-down0000.png",
    "/images/Ink/jump-down0001.png",
    "/images/Ink/jump-down0002.png",
    "/images/Ink/jump-down0003.png",
    "/images/Ink/jump-down0004.png",
  ],
  walk: [
    "/images/Ink/walk0000.png",
    "/images/Ink/walk0001.png",
    "/images/Ink/walk0002.png",
    "/images/Ink/walk0003.png",
  ],
  game: {
    mouse: "/images/Ink/game/ink-game-mouse.png",
    catHappy: "/images/Ink/game/ink-game-cat-happy.png",
    catWithMouse: "/images/Ink/game/ink-game-cat-with-mouse.png",
    jump: [
      "/images/Ink/game/ink-game-cat-jump-1.png",
      "/images/Ink/game/ink-game-cat-jump-2.png",
      "/images/Ink/game/ink-game-cat-jump-3.png",
    ],
  },
} as const;

export type InkPhase = "idle" | "ringing" | "emerging" | "open" | "playing";
export type InkPreyKind = "laser" | "mouse";
