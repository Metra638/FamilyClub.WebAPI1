"use client";

import { useState } from "react";
import ButtonCloseList from "./ButtonCloseList";
import DropDownList from "./DropDownList";

export default function HeaderDropDownSection() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="relative flex flex-row items-center gap-2 pointer-events-none">
            <ButtonCloseList isOpen={isOpen} onToggle={() => setIsOpen((v) => !v)} />

            <div
                className={`transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-y-0" : "-translate-y-[120px]"
                }`}
            >
                <DropDownList />
            </div>
        </div>
    );
}