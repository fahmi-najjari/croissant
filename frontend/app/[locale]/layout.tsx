import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { getDirection, isLocale, locales, type Locale } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <html lang={locale} dir={getDirection(locale as Locale)}>
      <body>
        <Providers>
          {children}
          <Footer locale={locale} />
        </Providers>
      </body>
    </html>
  );
}
