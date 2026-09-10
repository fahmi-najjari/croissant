import { notFound } from "next/navigation";
import { AccountClient } from "@/components/AccountClient";
import { Header } from "@/components/Header";
import { isLocale } from "@/i18n/config";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AccountPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <Header locale={locale} />
      <section className="mx-auto w-full max-w-[1120px] px-3 py-10 md:px-4 md:py-14">
        <AccountClient locale={locale} />
      </section>
    </main>
  );
}
