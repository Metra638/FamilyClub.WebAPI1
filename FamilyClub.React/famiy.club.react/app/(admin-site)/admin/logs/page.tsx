"use client";

import ActionLogPanel from "./components/ActionLogPanel";

export default function ActionLogPage() {
  return (
    <div className="w-full min-h-screen overflow-x-hidden relative m-0 p-0">
      <div
        className="relative min-h-screen pb-10"
        style={{ marginLeft: "-1rem", width: "calc(100% + 2rem)" }}
      >
        <img
          src="/images/usersPageAdmin/Rectangle 675.png"
          className="absolute pointer-events-none"
          style={{
            width: "calc(100% + 20px)",
            height: "calc(100% + 40px)",
            top: "-40px",
            left: "-20px",
            objectFit: "fill",
          }}
          alt=""
        />

        <div className="relative z-10 mt-24 px-10 pb-6 flex flex-col gap-6 box-border">
          <ActionLogPanel />
        </div>
      </div>
    </div>
  );
}
