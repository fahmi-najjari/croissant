import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function OrdersPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);

  return (
    <main className="page shell">
      <section className="hero">
        <div>
          <h1>{dictionary.secondaryAction}</h1>
          <p>{dictionary.heroText}</p>
          <Link className="button secondary" href={`/${locale}`}>
            {dictionary.brand}
          </Link>
        </div>
      </section>
    </main>
  );
}
