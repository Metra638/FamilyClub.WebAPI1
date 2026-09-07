"use client";

import { useEffect, useState } from "react";
import { categoriesService } from "@/lib/api/services";
import { CategoryDto } from "@/lib/api/generated";
import CategoryButton from "../ui/CategoryButton";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Props = {
    selectedCategories: number[];
    setSelectedCategories: (ids: number[]) => void;
};

export default function FavoriteCategoryUserProfile({ selectedCategories, setSelectedCategories }: Props) {
    const t = useTranslations();
    const [categories, setCategories] = useState<CategoryDto[]>([]);

    useEffect(() => {
        categoriesService.apiCategoriesGet().then(setCategories).catch(console.error);
    }, []);

    const toggle = (id: number) => {
        if (selectedCategories.includes(id)) {
            setSelectedCategories(selectedCategories.filter((c) => c !== id));
        } else {
            setSelectedCategories([...selectedCategories, id]);
        }
    };

    const half = Math.ceil(categories.length / 2);
    const left = categories.slice(0, half);
    const right = categories.slice(half);

    return (
        <div
            className="w-[560px] h-[712px] flex flex-col"
            style={{
                backgroundImage: "url('/images/userProfile/editUserProfile/Rectangle 314.png')",
                backgroundSize: "100% 100%",
                backgroundPosition: "center",
            }}
        >
            <div className="relative w-[470px] mt-12">
                <img
                    src="/images/userProfile/editUserProfile/Rectangle 304.png"
                    alt="green"
                    className="w-full h-[74px] object-fill"
                />
                <div className="absolute inset-0 -mt-1 flex flex-col justify-center pl-14">
                    <h3 className="text-[24px] text-white font-semibold">{t("profileEdit.genresTitle")}</h3>
                    <p className="text-[13px] -mt-1 text-white">{t("profileEdit.genresHint")}</p>
                </div>
            </div>

            <div className="flex relative items-start flex-row gap-0 mt-4 ml-22 pr-4">
                <div className="flex flex-col gap-3 flex-1">
                    {left.map((cat) => (
                        <CategoryButton
                            key={cat.id}
                            name={cat.categoryName ?? ""}
                            selected={selectedCategories.includes(cat.id!)}
                            onClick={() => toggle(cat.id!)}
                        />
                    ))}
                </div>
                <div className="flex flex-col gap-3 flex-1">
                    {right.map((cat) => (
                        <CategoryButton
                            key={cat.id}
                            name={cat.categoryName ?? ""}
                            selected={selectedCategories.includes(cat.id!)}
                            onClick={() => toggle(cat.id!)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
