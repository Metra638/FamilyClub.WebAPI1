import { useState } from "react";
import { BlockReasonDto } from "../types";

const initialForm: BlockReasonDto = {
  name: "",
  description: null,
};

export function useBlockReasonForm() {
  const [form, setForm] = useState<BlockReasonDto>(initialForm);

  const setField = <K extends keyof BlockReasonDto>(key: K, value: BlockReasonDto[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return { form, setField };
}