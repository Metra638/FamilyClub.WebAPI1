"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { complaintsService } from "@/lib/api/services";
import { getAuthToken } from "@/lib/auth/tokenStorage";
import { ResponseError } from "@/lib/api/generated/runtime";
import { useLocalizedPath, useTranslations } from "@/lib/i18n/LocaleProvider";
import type { ComplaintReason } from "./useComplaintForm";
import type { useComplaintImages } from "./useComplaintImages";

type ImagesApi = Pick<
  ReturnType<typeof useComplaintImages>,
  "toCreateDtos"
>;

type SubmitParams = {
  reason: ComplaintReason;
  description: string;
  clubMemberId: string;
  images: ImagesApi;
};

type ErrorMessages = {
  generic: string;
  sessionExpired: string;
  format: string;
  tooLarge: string;
  accountMissing: string;
  invalidForm: string;
  server: string;
  withCode: string;
};

async function parseApiError(
  err: unknown,
  messages: ErrorMessages,
): Promise<string> {
  if (!(err instanceof ResponseError)) {
    return messages.generic;
  }

  const status = err.response.status;
  let body = "";
  try {
    body = await err.response.text();
  } catch {
    /* ignore */
  }

  console.error("Complaint API error:", status, body);

  if (status === 401) {
    return messages.sessionExpired;
  }
  if (status === 415) {
    return messages.format;
  }
  if (status === 413) {
    return messages.tooLarge;
  }
  if (status === 400) {
    if (body.includes("ClubMember") || body.includes("club_member")) {
      return messages.accountMissing;
    }
    return messages.invalidForm;
  }
  if (status >= 500) {
    return messages.server;
  }

  return messages.withCode.replace("{status}", String(status));
}

export function useSubmitComplaint() {
  const router = useRouter();
  const lp = useLocalizedPath();
  const t = useTranslations();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async ({
    reason,
    description,
    clubMemberId,
    images,
  }: SubmitParams) => {
    setSubmitting(true);
    setError(null);

    const errorMessages: ErrorMessages = {
      generic: t("complaints.errors.generic"),
      sessionExpired: t("complaints.errors.sessionExpired"),
      format: t("complaints.errors.format"),
      tooLarge: t("complaints.errors.tooLarge"),
      accountMissing: t("complaints.errors.accountMissing"),
      invalidForm: t("complaints.errors.invalidForm"),
      server: t("complaints.errors.server"),
      withCode: t("complaints.errors.withCode"),
    };

    try {
      const token = typeof window !== "undefined" ? getAuthToken() : null;

      const imageDtos = await images.toCreateDtos();

      await complaintsService.apiComplaintsPost(
        {
          complaintsCreateDto: {
            complaintText: description.trim(),
            complaintType: reason,
            clubMemberId,
            images: imageDtos.length > 0 ? imageDtos : undefined,
          },
        },
        token
          ? async ({ init }) => ({
              headers: {
                ...init.headers,
                Authorization: `Bearer ${token}`,
              },
            })
          : undefined
      );

      setSuccess(true);
      setTimeout(() => router.push(lp("/orders")), 2500);
    } catch (err) {
      console.error("Failed to submit complaint:", err);
      setError(await parseApiError(err, errorMessages));
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, error, success };
}
