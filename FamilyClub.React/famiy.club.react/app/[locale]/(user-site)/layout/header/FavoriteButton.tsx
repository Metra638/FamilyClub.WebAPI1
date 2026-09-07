import Image from "next/image";

export default function FavoriteButton() {
  return (
    <div className="group flex items-center justify-center">
      <div
        className="w-[40px]
          h-[40px]
          flex
          items-center
          justify-center
          rounded-full
          transition-all
          duration-300
          group-hover:bg-[var-(--color-white)]
          group-hover:shadow-[0px_0px_15px_0px_#242424CC]
        "
      >
        <Image
          src="/images/header/favorite_border_24px.png"
          alt="favor"
          className="object-contain p-1"
          priority
          width={36}
          height={36}
        />
      </div>
    </div>
  );
}
