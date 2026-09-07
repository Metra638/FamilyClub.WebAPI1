import Image from "next/image";
import ellipse from "@/public/images/addProducts/Ellipse 36.svg";
import plus from "@/public/images/addProducts/plus-solid-full 1.svg";

type Props = {
  preview: string | null;
  onChange: (file: File | null) => void;
  width?: string;
  height?: string;
  iconSize?: string;
  ellipseSize?: string;
  titleMt?: string;
  titleMl?: string;
};

export function ImageUploadSlot({
  preview,
  onChange,
  width,
  height,
  iconSize,
  ellipseSize,
  titleMt,
  titleMl,
}: Props) {
  return (
    <label
      className={`${width} ${height} ${titleMt} ${titleMl} relative flex items-center justify-center cursor-pointer bg-cover bg-center`}
    >
      <img
        src="/images/addProducts/Rectangle 305.svg"
        alt=""
        className={`absolute inset-0 w-full h-full`}
        style={{ objectFit: 'fill' }}
      />
      <input
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />

      {preview ? (
        <img src={preview} className="w-full relative z-50 h-full p-2 object-cover" />
      ) : (
        <div className="relative flex z-50 items-center inset-0 justify-center">
          <Image src={ellipse} alt="ellipse" className={`${ellipseSize} `}/>

          <Image src={plus} alt="plus" className={`absolute ${iconSize}`} />
        </div>
      )}
    </label>
  );
}
