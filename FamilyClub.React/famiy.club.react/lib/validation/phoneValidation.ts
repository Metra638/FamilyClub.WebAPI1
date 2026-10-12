import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js";

export function validateUkrainianPhone(phone: string): { isValid: boolean; normalized: string } {
  if (!phone) return { isValid: false, normalized: "" };

  const digits = phone.replace(/\D/g, "");
  let subNumber = "";

  if (digits.startsWith("380") && digits.length === 12) {
    subNumber = digits.slice(3);
  } else if (digits.startsWith("0") && digits.length === 10) {
    subNumber = digits.slice(1);
  } else if (digits.length === 9 && !digits.startsWith("0")) {
    subNumber = digits;
  } else {
    return { isValid: false, normalized: "" };
  }

  const code = subNumber.slice(0, 2);
  const isValidCode = /^(3[1-9]|4[1-8]|5[0-7]|6[1-9]|7[357]|89|9[1-9])$/.test(code);
  if (!isValidCode) {
    return { isValid: false, normalized: "" };
  }

  const normalized = `+380${subNumber}`;

  try {
    if (!isValidPhoneNumber(normalized, "UA")) {
      return { isValid: false, normalized: "" };
    }
  } catch {
  }

  return { isValid: true, normalized };
}

export function validatePhoneNumber(
  phone: string,
  countryCode: string = "ua"
): { isValid: boolean; normalized: string } {
  const trimmed = (phone || "").trim();
  if (!trimmed) return { isValid: false, normalized: "" };

  const digits = trimmed.replace(/\D/g, "");
  const isUkrainian =
    countryCode.toLowerCase() === "ua" ||
    digits.startsWith("380") ||
    (trimmed.startsWith("0") && digits.length <= 10 && !trimmed.startsWith("+"));

  if (isUkrainian) {
    return validateUkrainianPhone(trimmed);
  }

  const upperCountry = (countryCode || "UA").toUpperCase() as any;
  const withPlus = trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
  try {
    if (isValidPhoneNumber(withPlus, upperCountry)) {
      const parsed = parsePhoneNumberFromString(withPlus, upperCountry);
      return {
        isValid: true,
        normalized: parsed ? parsed.format("E.164") : withPlus,
      };
    }
  } catch {
  }

  if (digits.length >= 8 && digits.length <= 15) {
    return { isValid: true, normalized: withPlus };
  }

  return { isValid: false, normalized: "" };
}

