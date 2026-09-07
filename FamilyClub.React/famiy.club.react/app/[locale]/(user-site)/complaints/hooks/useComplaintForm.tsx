"use client";

import { useState } from "react";
import {
  type ComplaintReason,
  COMPLAINT_REASONS,
} from "@/lib/constants/complaintTypes";

export type { ComplaintReason } from "@/lib/constants/complaintTypes";
export { COMPLAINT_REASONS } from "@/lib/constants/complaintTypes";

const MAX_TEXT = 2000;

export function useComplaintForm(initialEmail = "") {
  const [reason, setReason] = useState<ComplaintReason | null>(null);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState(initialEmail);

  const setDescriptionClamped = (value: string) => {
    setDescription(value.slice(0, MAX_TEXT));
  };

  const isValid =
    reason !== null &&
    description.trim().length > 0 &&
    email.trim().length > 0;

  return {
    reason,
    setReason,
    description,
    setDescription: setDescriptionClamped,
    email,
    setEmail,
    maxText: MAX_TEXT,
    isValid,
  };
}
