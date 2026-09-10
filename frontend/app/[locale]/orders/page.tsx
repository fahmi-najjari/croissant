import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { formatTnd, getDeliveryZones } from "@/lib/api";
import { Header } from "../../../components/Header";

type PageProps = {
  params: Promise<{ locale: string }>;
};

const shellClassName = "mx-auto w-full max-w-[1120px] px-3 md:px-4";

export default async function OrdersPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  const deliveryZones = await getDeliveryZones();

  return (
    <main className="min-h-screen">
      <Header locale={locale} activePath="orders" />
      <section
        className={`${shellClassName} grid grid-cols-1 gap-7 py-11 md:grid-cols-[minmax(0,1fr)_360px] md:py-[72px] md:pb-14`}
      >
        <div>
          <h1 className="mb-5 max-w-[720px] text-[2.5rem] leading-none text-[var(--foreground)] md:text-[clamp(3rem,6vw,5rem)]">
            {dictionary.secondaryAction}
          </h1>
          <p className="mb-7 max-w-2xl text-[1.1rem] leading-7 text-[var(--muted)]">
            {dictionary.heroText}
          </p>
          <Link
            className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-[18px] py-3 font-bold text-[var(--foreground)] transition-colors hover:border-[#cccccc] hover:bg-[var(--background-soft)] hover:text-[var(--foreground)]"
            href={`/${locale}/catalog`}
          >
            {dictionary.primaryAction}
          </Link>
        </div>

        <aside className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="mb-4 text-xl">Zones de livraison</h2>
          {deliveryZones.length > 0 ? (
            <ul className="grid gap-3">
              {deliveryZones.map((zone) => (
                <li
                  key={zone.id}
                  className="rounded-md border border-[var(--line)] bg-[var(--cream)] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-[var(--foreground)]">
                        {zone.city}
                        {zone.area ? ` - ${zone.area}` : ""}
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        Minimum {formatTnd(zone.minimum_order_amount)}
                      </p>
                    </div>
                    <p className="text-sm font-extrabold text-[var(--button-hover)]">
                      {formatTnd(zone.delivery_fee)}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Environ {zone.estimated_delivery_minutes} min
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[var(--muted)]">
              Aucune zone de livraison active n'est publiee.
            </p>
          )}
        </aside>
      </section>
    </main>
  );
}
