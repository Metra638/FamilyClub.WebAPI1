type Props = {
  label: string;
  placeholder?: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  className?: string;
  textSize?: string;
};

export function NumberInput({ label, placeholder, value, onChange, className,textSize }: Props) {
  return (
    <div className={`flex flex-col gap-0 ${className ?? ""}`}>
      <p className={`text-[var(--color-black)] font-sans-pro font-normal ${textSize} leading-[150%] tracking-[-0.011em]`}>
        {label}
      </p>
      <input
        className="input-field rounded-[9px] px-4 bg-[var(--color-white)] shadow-[0px_0px_10px_0px_#00000040] h-[40px]"
        type="number"
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? undefined : Number(e.target.value))
        }
      />
    </div>
  );
}