import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import {
  formatTnd,
  getCategories,
  getProducts,
  localizedDescription,
  localizedName,
  mediaUrl,
} from "@/lib/api";
import { AddToCartButton } from "../../../components/AddToCartButton";
import { Header } from "../../../components/Header";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string }>;
};

const shellClassName = "mx-auto w-full max-w-[1120px] px-3 md:px-4";

export default async function CatalogPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { category, q } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ category, search: q }),
  ]);

  return (
    <main className="min-h-screen">
      <Header locale={locale} activePath="catalog" />
      <section className={`${shellClassName} py-10 md:py-14`}>
        <div className="mb-8">
          <h1 className="mb-5 max-w-[720px] text-[2.5rem] leading-none text-[var(--foreground)] md:text-[clamp(3rem,6vw,5rem)]">
            {dictionary.primaryAction}
          </h1>
          <p className="mb-7 max-w-2xl text-[1.1rem] leading-7 text-[var(--muted)]">
            {dictionary.heroText}
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            className={`rounded-md border px-4 py-2 text-sm font-bold transition-colors ${
              category
                ? "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--background-soft)]"
                : "border-[var(--button)] bg-[var(--button)] text-white"
            }`}
            href={`/${locale}/catalog${q ? `?q=${encodeURIComponent(q)}` : ""}`}
          >
            Tous
          </Link>
          {categories.map((item) => {
            const active = category === item.slug;
            const query = new URLSearchParams();
            query.set("category", item.slug);
            if (q) query.set("q", q);

            return (
              <Link
                key={item.id}
                className={`rounded-md border px-4 py-2 text-sm font-bold transition-colors ${
                  active
                    ? "border-[var(--button)] bg-[var(--button)] text-white"
                    : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--background-soft)]"
                }`}
                href={`/${locale}/catalog?${query.toString()}`}
                title={localizedDescription(item, locale)}
              >
                {localizedName(item, locale)}
              </Link>
            );
          })}
        </div>

        {products.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="flex min-h-[360px] flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)]"
              >
                <div className="aspect-[4/3] bg-[var(--background-soft)]">
                  {mediaUrl(product.primary_image?.image) ? (
                    <img
                      src={mediaUrl(product.primary_image?.image) ?? ""}
                      alt={
                        locale === "ar"
                          ? product.primary_image?.alt_text_ar ||
                            localizedName(product, locale)
                          : product.primary_image?.alt_text_fr ||
                            localizedName(product, locale)
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center px-6 text-center text-sm font-bold text-[var(--muted)]">
                      {localizedName(product, locale)}
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-normal text-[var(--muted)]">
                      {localizedName(product.category, locale)}
                    </p>
                    <h2 className="text-xl leading-tight">
                      {localizedName(product, locale)}
                    </h2>
                  </div>
                  {product.is_featured && (
                    <span className="rounded-full bg-[var(--background-soft)] px-3 py-1 text-xs font-bold text-[var(--button-hover)]">
                      Special
                    </span>
                  )}
                  {product.discount_price && (
                    <span className="rounded-full bg-[#f9e2a8] px-3 py-1 text-xs font-bold text-[#6a390f]">
                      Promo
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-end justify-between gap-4">
                  <div>
                    {product.discount_price && (
                      <p className="text-sm text-[var(--muted)] line-through">
                        {formatTnd(product.price)}
                      </p>
                    )}
                    <p className="text-2xl font-extrabold text-[var(--foreground)]">
                      {formatTnd(product.current_price)}
                    </p>
                  </div>
                  <span
                    className={`rounded-md px-3 py-2 text-xs font-bold ${
                      product.in_stock
                        ? "bg-[#e7f4df] text-[#315c20]"
                        : "bg-[#f8ded8] text-[#7b2f1d]"
                    }`}
                  >
                    {product.in_stock ? "Disponible" : "Indisponible"}
                  </span>
                </div>
                <AddToCartButton product={product} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6 text-[var(--muted)]">
            Aucun produit ne correspond a votre recherche.
          </div>
        )}
      </section>
    </main>
  );
}
