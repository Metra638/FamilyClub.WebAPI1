import { locales } from "@/lib/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
