import { useState } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { BlockReasonDto } from "../types";
import { blockReasonsService } from "@/lib/api/services";

type Props = {
  form: BlockReasonDto;
  router: AppRouterInstance;
};

export function useSubmitBlockReason({ form, router }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      await blockReasonsService.apiBlockReasonsPost({
        blockReasonDto: {
          name: form.name,
          description: form.description || null,
        },
      });

      router.push("/admin/books/blockReasons");
    } catch (err) {
      console.error(err);
      setError("Помилка при створенні причини блокування");
    } finally {
      setLoading(false);
    }
  };

  return { handleSubmit, loading, error };
}