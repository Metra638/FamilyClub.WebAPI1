"use client";

import { CategoryDto } from "@/lib/api/generated";

export default function CategoryList({
  categories,
  selectedIds,
  onToggle,
}: {
  categories: CategoryDto[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}) {
  return (
    <div className="w-[600px] ml-15 p-2">
      <ul className="grid grid-cols-[200px_200px] gap-x-0 mt-4 w-[100%] justify-items-left">
        {categories.map((category) => {
          return (
            <li
              key={category.id}
              onClick={() => onToggle(category.id!)}
              className={` inline-block w-fit
    px-2 p-2 rounded-full cursor-pointer
    font-['Source_Sans_Pro'] font-normal text-[18px] leading-[100%]
    transition-all duration-200 border
    ${
      selectedIds.includes(category.id!)
        ? "border-[1px] border-[#242424] text-[#242424]"
        : "border-transparent text-[#242424] hover:border-gray-400 hover:bg-gray-100"
    }
  `}
            >
              {category.categoryName}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
