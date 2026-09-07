import Image from "next/image";

export default function ShoppingCartButton() {
  return (
    <div className="group flex items-center justify-center">
      <div
        className="w-[38px]
          h-[38px]
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
          src="/images/header/shopping_basket_24px.png"
          alt=""
          className="object-contain"
          priority
          width={30}
          height={26}
        />
      </div>
    </div>
  );
}
