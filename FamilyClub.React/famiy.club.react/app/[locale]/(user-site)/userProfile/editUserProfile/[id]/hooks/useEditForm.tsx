import { useState, useEffect } from "react";
import { ClubMemberReadDto, UpdateClubMemberDto } from "@/lib/api/generated";
import { clubMemberService } from "@/lib/api/services";
import { useCurrentUser } from "../../../hooks/useCurrentUser";


export default function useEditForm(id: string) {
    const { user, loading: userLoading } = useCurrentUser();
    const [form, setForm] = useState<UpdateClubMemberDto>({
        name: "",
        surname: "",
        phoneNumber: "",
        dateOfBirth: null,
    });
    const [avatarData, setAvatarData] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [about, setAbout] = useState("");
    const [links, setLinks] = useState<{ id: number; name: string; url: string }[]>([
        { id: 1, name: "", url: "" },
    ]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    useEffect(() => {
        if (!user) return;
        setForm({
            name: user.name ?? "",
            surname: user.surname ?? "",
            phoneNumber: user.phoneNumber ?? "",
            dateOfBirth: user.dateOfBirth
            ? new Date(user.dateOfBirth)
            : null,
        });
        if (user.avatarData) {
            setAvatarData(user.avatarData);
        }
        setLoading(false);
    }, [user]);

    const setField = <K extends keyof UpdateClubMemberDto>(
        key: K,
        value: UpdateClubMemberDto[K]
    ) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    return {
        form,
        setField,
        avatarData,
        setAvatarData,
        loading: loading || userLoading,
        about,
        setAbout,
        links,
        setLinks,
        selectedCategories,
        setSelectedCategories,

    };
}