import { blockReasonsService } from "@/lib/api/services";
import { useEffect, useState } from "react";
import { BlockReasonDto } from "../../../addBlockReasons/types";

const emptyForm: BlockReasonDto = {
  name: "",
};

export default function useEditBlockReasonForm(id: number) {
  const [form, setForm] = useState<BlockReasonDto>(emptyForm);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blockReasonsService
      .apiBlockReasonsIdGet({ id })
      .then((blockReason) => {
        setForm({
          name: blockReason.name ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const setField = <K extends keyof BlockReasonDto>(
    key: K,
    value: BlockReasonDto[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return { form, setField, loading };
}