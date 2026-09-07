export type CarrierBlock = {
  subtitle?: string;
  paragraphs?: string[];
  items?: string[];
};

export type Carrier = {
  name: string;
  accent: string;
  blocks: CarrierBlock[];
};

export type PaymentMethod = {
  title: string;
  items?: string[];
  subsections?: { title: string; items: string[] }[];
};

export type PaymentDeliveryContent = {
  backAria: string;
  deliveryTitle: string;
  deliveryIntro: string[];
  carriers: Carrier[];
  deliveryNote: string;
  paymentTitle: string;
  paymentMethods: PaymentMethod[];
  returnsTitle: string;
  returnsIntro: string;
  returnsItems: string[];
  returnsNote: string;
};

export type PersonalDataSubsection = {
  heading: string;
  items: string[];
};

export type PersonalDataSection = {
  title: string;
  subsections?: PersonalDataSubsection[];
  items?: string[];
  note?: string;
  noteBeforeEmail?: string;
  noteAfterEmail?: string;
};

export type PersonalDataContent = {
  backAria: string;
  title: string;
  whoWeAre: {
    title: string;
    companyBold: string;
    companyRest: string;
    legalAddress: string;
    physicalAddress: string;
    contactLabel: string;
    email: string;
    phoneHref: string;
    phoneDisplay: string;
    supportLabel: string;
  };
  sections: PersonalDataSection[];
};

export type ProductReturnStep =
  | { type: "text"; text: string }
  | { type: "link"; before: string; linkText: string; after: string; href: string };

export type ProductReturnContent = {
  backAria: string;
  title: string;
  badge: string;
  highlight: string;
  intro: string;
  cancelTitle: string;
  cancelIntro: string;
  cancelSteps: ProductReturnStep[];
  defectTitle: string;
  defectItems: string[];
  qualityTitle: string;
  qualityIntroBefore: string;
  qualityIntroStrong: string;
  qualityIntroAfter: string;
  qualityItems: string[];
  refundTitle: string;
  refundBefore: string;
  refundStrong: string;
  refundAfter: string;
  helpTitle: string;
  supportTitle: string;
  phoneLabel: string;
  phoneHref: string;
  phoneDisplay: string;
  freeNote: string;
  schedule: string;
};

export type PolicySection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
  afterItems?: string[];
};

export type ProductPublicationPolicyContent = {
  backAria: string;
  title: string;
  sections: PolicySection[];
  footerBeforeEmail: string;
  footerAfterEmail: string;
  email: string;
};

export type TermsDefinition = {
  name: string;
  definition: string;
};

export type TermsClause = {
  number: string;
  text: string;
};

export type TermsOfUseContent = {
  backAria: string;
  title: string;
  preambleTitle: string;
  preamble: string;
  definitionsTitle: string;
  definitions: TermsDefinition[];
  generalTitle: string;
  general: TermsClause[];
};

export type LocalizedContent<T> = {
  uk: T;
  en: T;
};
