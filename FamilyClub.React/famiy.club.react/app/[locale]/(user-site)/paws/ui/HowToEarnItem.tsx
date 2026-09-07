import Image from "next/image";

type Props = {
  icon: string;
  title: string;
  desc: string;
};

export default function HowToEarnItem({ icon, title, desc }: Props) {
  return (
    <li className="flex items-center gap-2 h-[62px]">
      <span className="w-20 h-20 flex items-center justify-center">
        <Image src={icon} width={60} height={60} alt={title} />
      </span>
      <div className="flex flex-col items-left">
        <span className="text-[24px] text-[var(--color-white)]">
          {title}
        </span>
        <span className="text-[12px] text-[var(--color-white)]">{desc}</span>
      </div>
    </li>
  );
}