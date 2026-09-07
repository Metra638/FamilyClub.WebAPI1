import Image from "next/image";

type LeftBlockProps = {
    label: string;
    count?: number;
    active?: boolean;
    onClick?: () => void;
};

export default function LeftBlock({ label, count, active, onClick }: LeftBlockProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`group relative w-[326px] h-[50px] ${active ? "translate-x-[14px]" : ""}`}
        >
            <Image
                src="/images/notifications/Rectangle 304.png"
                alt=""
                fill
                className="transition-transform duration-500 group-hover:translate-x-[14px]"
            />

            <span
                className="
            absolute inset-0
            flex items-center justify-center
            text-white
            transition-transform duration-500
            group-hover:translate-x-[14px]
        "
            >
                {label}
                {typeof count === "number" && (
                    <span className="ml-2 text-xs bg-white/20 rounded-full px-2 py-0.5">
                        {count}
                    </span>
                )}
            </span>
        </button>
    );
}