import Image from "next/image";


export default function UserCabinetButton() {
  return (
    <>
      <div className="w-[40px] h-[40px] flex items-center">
        <Image
          src="/images/header/person_24px.png"
          alt="person"
          className="object-contain h-auto w-auto"
          priority
          width={27}
          height={27}
        />
      </div>
    </>
  );
}
