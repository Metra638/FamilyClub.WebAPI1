import Image from "next/image";

export default function ButtonReturn() {
  return (
    <div
      role="button"
      className="relative w-[50px] h-[50px] flex items-center justify-center cursor-pointer"
    >
      <Image
        src="/images/userProfile/editUserProfile/Ellipse 9.png"
        alt="circle"
        width={60}
        height={60}
        className="object-contain"
      />
      <Image
        src="/images/userProfile/editUserProfile/keyboard_backspace_24px.png"
        alt="back"
        width={30}
        height={30}
        className="object-contain absolute inset-0 m-auto"
      />
    </div>
  );
}