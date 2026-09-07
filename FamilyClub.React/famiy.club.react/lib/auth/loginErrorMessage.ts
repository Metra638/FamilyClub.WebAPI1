import { readApiErrorMessage } from "@/lib/api/readApiError";

type LoginErrorCopy = {
  invalidCredentials: string;
  accountLocked: string;
};

/** Maps login API errors to short localized UI copy. */
export async function loginErrorMessage(
  err: unknown,
  copy: LoginErrorCopy,
): Promise<string> {
  const raw = await readApiErrorMessage(err, copy.invalidCredentials);
  if (/locked/i.test(raw)) {
    return copy.accountLocked;
  }
  if (/wrong email or password/i.test(raw) || /unauthorized/i.test(raw)) {
    return copy.invalidCredentials;
  }
  return raw;
}
