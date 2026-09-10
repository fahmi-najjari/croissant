import { notFound } from "next/navigation";
import { CartPageClient } from "@/components/CartPageClient";
import { Header } from "@/components/Header";
import { isLocale } from "@/i18n/config";
import { getDeliveryZones } from "@/lib/api";

type PageProps = {
  params: Promise<{ locale: string }>;
};

const shellClassName = "mx-auto w-full max-w-[1120px] px-3 md:px-4";

export default async function CartPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const deliveryZones = await getDeliveryZones();

  return (
    <main className="min-h-screen">
      <Header locale={locale} />
      <section className={`${shellClassName} py-10 md:py-14`}>
        <CartPageClient locale={locale} deliveryZones={deliveryZones} />
      </section>
    </main>
  );
}
