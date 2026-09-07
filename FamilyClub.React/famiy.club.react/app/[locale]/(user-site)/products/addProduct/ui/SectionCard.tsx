type Props = {
  title: string;
  backgroundImage: string;
  children: React.ReactNode;
  className?: string;
  titleMt?: string;
  titlePos?: string;
};

export function SectionCard({
  title,
  backgroundImage,
  children,
  className,
  titleMt,
  titlePos,
}: Props) {
  return (
    <div
      className={`w-full bg-cover bg-center ${className ?? ""}`}
      style={{
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: "100% 100%",
      }}
    >
      <div
        className={`-ml-[5px] ${titleMt} ${titlePos} bg-cover bg-center w-[330px] h-[56px] flex items-center justify-center text-center`}
        style={{
          backgroundImage: "url('/images/addProducts/Rectangle 302.svg')",
        }}
      >
        <p className="text-[var(--color-white)] font-['Roboto_Mono'] font-semibold text-[22px] leading-[150%] tracking-[-0.011em] pb-[10px]">
          {title}
        </p>
      </div>
      <div className="w-[430px] mt-[6px] ml-[38px] flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}
