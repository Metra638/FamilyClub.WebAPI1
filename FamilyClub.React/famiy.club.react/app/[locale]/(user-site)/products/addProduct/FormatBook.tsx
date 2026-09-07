"use client";

import AudioFormat from "./AudioFormat";
import EbookFormat from "./EbookFormat";
import { FormatDto } from "@/lib/api/generated";
import Image from "next/image";

type Props = {
  formats: FormatDto[];
  value?: number[];
  onChange: (ids: number[]) => void;
};

export default function DigitalFormatsBlock({
  value = [],
  formats,
  onChange,
}: Props) {
  const ebookFormat = formats.find((x) => x.code === "Ebook");
  const audioFormat = formats.find((x) => x.code === "Audiobook");
  const printFormat = formats.find((x) => x.code === "Printed");

  const isSelected = (id: number) => {
    return value.includes(id);
  };

  const toggleFormat = (id: number) => {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-[400px]">
      {printFormat && (
        <div className="absolute -mt-[130px] ml-[332px] w-[70px] h-[30px] flex flex-row items-center justify-center gap-2 pb-4">
          <button
            type="button"
            onClick={() => toggleFormat(printFormat.id!)}
            className="relative w-[26px] h-[26px] flex items-center justify-center"
          >
            <Image
              src="/images/addProducts/icon.svg"
              alt="circle"
              width={26}
              height={26}
              className="object-contain"
            />

            {isSelected(printFormat.id!) && (
              <Image
                src="/images/addProducts/check_24px.svg"
                alt="check"
                width={26}
                height={26}
                className="absolute ml-2 -mt-2"
              />
            )}
          </button>

          <div
            className="w-[30px] h-[30px] bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/addProducts/Group 140.png')",
            }}
          />
        </div>
      )}
      {ebookFormat && (
        <div className="flex flex-col  h-[84px]">
          <label className="flex flex-row justify-between items-center">
            <span className="text-[18px]">{ebookFormat.name}</span>
            <div className="w-[70px] h-[30px] flex flex-row items-center justify-center gap-2 pb-4">
              <button
                type="button"
                onClick={() => toggleFormat(ebookFormat.id!)}
                className="relative w-[26px] h-[26px] flex items-center justify-center"
              >
                <Image
                  src="/images/addProducts/icon.svg"
                  alt="circle"
                  width={26}
                  height={26}
                  className="object-contain"
                />
                {isSelected(ebookFormat.id!) && (
                  <Image
                    src="/images/addProducts/check_24px.svg"
                    alt="check"
                    width={26}
                    height={26}
                    className="absolute ml-2 -mt-2"
                  />
                )}
              </button>

              <div
                className="w-[26px] h-[26px] bg-cover bg-center"
                style={{
                  backgroundImage: "url('/images/addProducts/Group 139.svg')",
                }}
              />
            </div>
          </label>
          <EbookFormat onSelect={() => !isSelected(ebookFormat.id!) && toggleFormat(ebookFormat.id!)} />
          {/* <EbookFormat /> */}
        </div>
      )}
      {audioFormat && (
        <div className="flex flex-col  h-[94px]">
          <label className="flex flex-row justify-between items-center">
            <span className="text-[18px]">{audioFormat?.name}</span>
            <div className="w-[70px] h-[30px] flex flex-row items-center justify-center gap-2 pb-4">
              <button
                type="button"
                onClick={() => toggleFormat(audioFormat.id!)}
                className="relative w-[26px] h-[26px] flex items-center justify-center"
              >
                <Image
                  src="/images/addProducts/icon.svg"
                  alt="circle"
                  width={26}
                  height={26}
                  className="object-contain"
                />
                {isSelected(audioFormat.id!) && (
                  <Image
                    src="/images/addProducts/check_24px.svg"
                    alt="check"
                    width={26}
                    height={26}
                    className="absolute ml-2 -mt-2"
                  />
                )}
              </button>

              <div
                className="w-[30px] h-[30px] bg-cover bg-center"
                style={{
                  backgroundImage: "url('/images/addProducts/Group 141.svg')",
                }}
              />
            </div>
          </label>
          <AudioFormat onSelect={() => !isSelected(audioFormat.id!) && toggleFormat(audioFormat.id!)}/>
        </div>
      )}
    </div>
  );
}
