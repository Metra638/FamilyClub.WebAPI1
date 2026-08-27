"use client";

import { useRouter } from "next/navigation";
import { BasicInfoSection } from "./sections/BasicInfoSection";
import { useSubmitBlockReason } from "./hooks/useSubmitBlockReason";
import { useBlockReasonForm } from "./hooks/useBlockReasonForm";
import ButtonReturn from "../editBlockReasons/[id]/ButtonReturn";

export default function AddBlockReasonPage() {
  const router = useRouter();
  const { form, setField } = useBlockReasonForm();
  const { handleSubmit, loading } = useSubmitBlockReason({ form, router });

  return (
  <div
      className="w-full min-h-screen overflow-hidden relative m-0 p-0 flex flex-col"
      style={{
        backgroundImage: "url('/images/authorPageAdmin/Rectangle 326.png')",
        backgroundSize: "100% 100%",
      }}
    >
      <div
        className="relative w-[1200px] pb-[60px] -mt-[68px] mx-auto bg-no-repeat"
        style={{
          backgroundImage: "url('/images/addProducts/Rectangle 312.svg')",
          backgroundSize: "cover",
          backgroundPosition: "top",
          height: "1100px",
        }}
      >
        <div className="flex z-20 relative top-[130px] ml-[64px]">
          <ButtonReturn />
        </div>
        <div className="flex flex-col items-center mt-[120px]">
          <h1 className="text-[var(--color-black)] w-[800px] font-['Roboto_Mono'] font-bold text-[44px] leading-[150%] tracking-[-0.011em] text-center">
            Додати причину блокування
          </h1>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="w-full flex mt-[48px] gap-[4vw] justify-center">
            <div className="w-[645px] flex flex-col">
              <BasicInfoSection
                form={form}
                setField={setField}
                loading={loading}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
