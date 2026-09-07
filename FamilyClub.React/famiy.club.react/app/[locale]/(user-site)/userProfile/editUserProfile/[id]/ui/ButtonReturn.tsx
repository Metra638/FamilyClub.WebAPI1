import Image from "next/image";
import { useRouter, useParams } from "next/navigation";

export default function ButtonReturn() {
  const router = useRouter();
 
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => router.push(`/userProfile/`)}
        className=" w-[50px] h-[50px] flex items-center justify-center cursor-pointer"
      >
        <Image
          src="/images/userProfile/editUserProfile/Ellipse 9.png"
          alt="circle"
          width={60}
          height={60}
          className="object-contain"
        />
        <Image src="/images/userProfile/editUserProfile/keyboard_backspace_24px.png"
          alt="back"
          width={30}
          height={30}
          className="object-contain absolute" />
      </button>
    </div>
  );
}
