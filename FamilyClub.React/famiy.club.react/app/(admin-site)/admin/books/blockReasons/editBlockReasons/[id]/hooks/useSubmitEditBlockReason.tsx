import { alertError, showConfirm } from "@/lib/ui/sweetAlert";
import { useState } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { BlockReasonDto } from "../../../addBlockReasons/types";
import { blockReasonsService } from "@/lib/api/services";

type Props = {
  id: number;
  form: BlockReasonDto;
  router: AppRouterInstance;
};

export default function useSubmitEditBlockReason({ id, form, router }: Props) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await blockReasonsService.apiBlockReasonsIdPut({
        id,
        blockReasonDto: {
          name: form.name,
        },
      });

      router.push("/admin/books/blockReasons");
    } catch (e) {
      console.error(e);
      await alertError("Помилка при редагуванні причини блокування");
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    const confirmDelete = await showConfirm("Ви точно хочете видалити причину блокування?");
    if (!confirmDelete) return;

    try {
      await blockReasonsService.apiBlockReasonsIdDelete({
        id: Number(id),
      });
      router.push("/admin/books/blockReasons");
    } catch (e) {
      console.error(e);
      await alertError("Помилка при видаленні причини блокування");
    }
  };
  return { handleSubmit, loading, handleDelete };
}