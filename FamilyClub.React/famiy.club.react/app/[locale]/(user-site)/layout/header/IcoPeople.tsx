import Image from "next/image";

export default function IcoPeople() {
  return (
    <div className="group flex items-center justify-center">
      <div
        className="
          w-[40px]
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
          src="/images/header/people_24px.png"
          alt="people"
          width={32}
          height={32}
        />
      </div>
    </div>
  );
}
