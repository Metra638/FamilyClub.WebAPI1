import { BlockReasonDto } from "../../../addBlockReasons/types";
import { SectionCard } from "../../../addBlockReasons/ui/SectionCard";

type Props = {
  form: BlockReasonDto;
  setField: <K extends keyof BlockReasonDto>(
    key: K,
    value: BlockReasonDto[K],
  ) => void;
  loading: boolean;
  handleDelete: () => void;
};

export function BasicInfoSectionEditBlockReason({ form, setField, loading, handleDelete }: Props) {
  return (
    <div className="w-full flex pb-4">
      <SectionCard
        title="Основна інформація"
        backgroundImage="/images/addProducts/Rectangle 313.svg"
        className="w-[600px] h-[580px]"
        backgroundSize="100% 100%"
      >
        <div className="flex w-[390px] relative top-[46px] flex-col gap-1">
          <p className="text-[var(--color-black)] font-sans-pro font-normal text-[18px] leading-[150%] tracking-[-0.011em]">
            Назва причини блокування *
          </p>
          <input
            placeholder="Назва причини блокування"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            className="relative z-10 input rounded-[9px] px-3 bg-[var(--color-white)] shadow-[0px_0px_10px_0px_#00000040] h-[44px]"
          />

          <div className="p-4 top-[24px] relative w-full flex flex-col gap-5 ">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[40px] rounded-[55px] bg-[var(--color-green)] text-[var(--color-white)] text-[20px] font-medium transition-all duration-200 hover:opacity-90 hover:shadow-[0px_0px_20px_0px_#00000080] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Збереження..." : "Зберегти зміни"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleDelete}
              className="
                w-full
                 h-[40px] 
                 rounded-[55px] 
                 bg-transparent 
                 text-[var(--color-green)] 
                 border-2 border-[#005B3380]
                 text-[#005B33]
                 text-[20px] 
                 font-medium transition-all duration-200 hover:opacity-90 hover:shadow-[0px_0px_20px_0px_#00000080] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Видалення..." : "Видалити"}
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
