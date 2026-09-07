"use client";

type Props = {
    name: string;
    selected: boolean;
    onClick: () => void;
};

export default function CategoryButton({ name, selected, onClick }: Props) {
    return (
        <div className="group relative flex items-center justify-center" style={{ width: "130px", height: "36px" }}>
            <img
                src="/images/userProfile/editUserProfile/Rectangle 205.png"
                alt=""
                aria-hidden
                className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-200
                    ${selected ? "opacity-130" : "opacity-0 group-hover:opacity-130"}`}
                style={{ objectFit: "fill" }}
            />
            <button
                type="button"
                onClick={onClick}
                className="relative z-10 w-full h-full text-[24px] text-left truncate px-2"
            >
                {name}
            </button>
        </div>
    );
}