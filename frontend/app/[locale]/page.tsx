import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales, type Locale } from "@/i18n/config";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleHome({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);

  return (
    <main className="page">
      <header className="topbar">
        <div className="shell topbar-inner">
          <Link className="brand" href={`/${locale}`}>
            {dictionary.brand}
          </Link>
          <nav className="nav" aria-label="Language">
            {locales.map((item) => (
              <Link
                key={item}
                href={`/${item}`}
                hrefLang={item}
                aria-current={item === locale ? "page" : undefined}
              >
                {item.toUpperCase()}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <section className="shell hero">
        <div>
          <h1>{dictionary.heroTitle}</h1>
          <p>{dictionary.heroText}</p>
          <div className="actions">
            <Link className="button primary" href={`/${locale}/catalog`}>
              {dictionary.primaryAction}
            </Link>
            <Link className="button secondary" href={`/${locale}/orders`}>
              {dictionary.secondaryAction}
            </Link>
          </div>
        </div>

        <aside className="panel">
          <h2>{dictionary.panelTitle}</h2>
          <ul className="feature-list">
            {dictionary.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </aside>
      </section>
    </main>
  );
}
