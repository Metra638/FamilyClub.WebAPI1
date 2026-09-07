import type { Locale } from "../config";
import { paymentDeliveryContent } from "./payment-delivery";
import { personalDataProtectionContent } from "./personal-data-protection";
import { productPublicationPolicyContent } from "./product-publication-policy";
import { productReturnContent } from "./product-return";
import { termsOfUseContent } from "./terms-of-use";
import type {
  LocalizedContent,
  PaymentDeliveryContent,
  PersonalDataContent,
  ProductPublicationPolicyContent,
  ProductReturnContent,
  TermsOfUseContent,
} from "./types";

function pickLocalized<T>(content: LocalizedContent<T>, locale: Locale): T {
  return content[locale] ?? content.uk;
}

export function getPaymentDeliveryContent(
  locale: Locale,
): PaymentDeliveryContent {
  return pickLocalized(paymentDeliveryContent, locale);
}

export function getPersonalDataProtectionContent(
  locale: Locale,
): PersonalDataContent {
  return pickLocalized(personalDataProtectionContent, locale);
}

export function getProductReturnContent(locale: Locale): ProductReturnContent {
  return pickLocalized(productReturnContent, locale);
}

export function getProductPublicationPolicyContent(
  locale: Locale,
): ProductPublicationPolicyContent {
  return pickLocalized(productPublicationPolicyContent, locale);
}

export function getTermsOfUseContent(locale: Locale): TermsOfUseContent {
  return pickLocalized(termsOfUseContent, locale);
}

export type {
  PaymentDeliveryContent,
  PersonalDataContent,
  ProductPublicationPolicyContent,
  ProductReturnContent,
  TermsOfUseContent,
} from "./types";
