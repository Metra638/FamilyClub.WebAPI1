import Image from "next/image";
import type { PawsHistoryItem as PawsHistoryItemType } from "../hooks/usePaws";

type Props = {
    item: PawsHistoryItemType;
};

export default function PawsHistoryItem({ item }: Props) {
    return (
        <li className="flex items-center justify-between py-3 gap-4">
            <div>
                <p className="text-[20px] text-[var(--color-black)]">{item.title}</p>
                <p className="text-[15px] text-[var(--color-black)]">{item.date}</p>
            </div>
            <div className="flex flex-row gap-4">
                <span
                    className="text-[32px] font-semibold flex items-center gap-1"
                    style={{ color: item.amount > 0 ? "var(--color-black)" : "#B03A2E" }}
                >
                    {item.amount > 0 ? "+" : ""}
                    {item.amount}
                </span>
                <Image src="/images/userProfile/Лапка.png" width={36} height={22} alt="paws" />
            </div>
        </li>
    );
}