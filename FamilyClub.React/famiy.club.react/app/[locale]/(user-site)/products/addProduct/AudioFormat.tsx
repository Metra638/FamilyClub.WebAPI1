"use client";

import { useRef, useState } from "react";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
  onSelect?: () => void;
};

export default function AudioFormat({ onSelect }: Props) {
  const t = useTranslations();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="h-[40px] flex flex-row items-center px-4 justify-between rounded-[9px] bg-[var(--color-white)] shadow-[0px_0px_10px_0px_#00000040]">
      <p className="text-[14px] text-[#242424]/50 ">
        {file ? file.name : t("sellerProduct.uploadAudio")}
      </p>
      <button
        type="button"
        onClick={handleClick}
        className="w-[16px] h-[20px] bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/addProducts/file-solid-full 1.svg')",
        }}
      />

      <input
        ref={inputRef}
        type="file"
        accept=".mp3,.m4b,.aax"
        className="hidden"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0] ?? null;
          setFile(selectedFile);
          if (selectedFile) {
            onSelect?.();
          }
        }}
      />
    </div>
  );
}
