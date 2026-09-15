import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import {
  formatTnd,
  getDeliveryZones,
  getProducts,
  localizedName,
  mediaUrl,
} from "@/lib/api";
import { Header } from "../../components/Header";

type PageProps = {
  params: Promise<{ locale: string }>;
};

const shellClassName = "mx-auto w-full max-w-[1120px] px-3 md:px-4";
const buttonBaseClassName =
  "rounded-lg border border-transparent px-[18px] py-3 font-bold transition-colors";

const homeCopy = {
  fr: {
    eyebrow: "Boulangerie artisanale",
    title: "23 en voie",
    subtitle:
      "Viennoiseries feuilletees, pains de caractere et patisseries du jour, prepares pour la boutique, la livraison et les commandes a emporter.",
    catalog: "Commander les produits",
    orders: "Suivre une commande",
    fresh: "Fait du jour",
    freshText:
      "Fournées regulieres, pieces limitees et produits disponibles selon le stock reel.",
    delivery: "Livraison locale",
    deliveryText:
      "Zones, minimum de commande et frais alignes avec le backend Django.",
    payment: "Paiement simple",
    paymentText:
      "Commande en especes a la livraison ou paiement Konnect selon le choix client.",
    promoEyebrow: "Offres et services",
    promoFallbackTitle: "Box petit-dejeuner disponible",
    promoFallbackText:
      "Composez une selection de viennoiseries, pains et douceurs depuis le catalogue.",
    promoDiscountText: "Prix reduit directement applique dans le catalogue.",
    promoDeliveryTitle: "Livraison locale",
    promoDeliveryFallback:
      "Choisissez votre zone au panier pour calculer les frais.",
    promoFreshTitle: "Fournées du jour",
    promoFreshText:
      "Produits disponibles selon le stock publie par la boulangerie.",
    featured: "Les favoris du moment",
    featuredText: "Produits marques comme populaires dans le catalogue.",
    aboutEyebrow: "A propos",
    aboutTitle: "Le gout du pain fait maison",
    aboutText:
      "Chez 23 en voie, chaque fournee est preparee avec soin: croissants au beurre, pains du jour et patisseries simples, genereuses et toujours fraiches. Nous gardons l'esprit d'une boulangerie de quartier, avec un service clair pour commander vite, recuperer en boutique ou se faire livrer.",
    aboutNote:
      "Notre promesse: des produits frais, des prix lisibles et une commande facile du catalogue jusqu'au panier.",
    aboutCta: "Lire notre histoire",
    empty:
      "Ajoutez des produits populaires dans le backend pour les afficher ici.",
  },
  ar: {
    eyebrow: "مخبز حرفي",
    title: "23 en voie",
    subtitle:
      "كرواسون طازج، خبز يومي وحلويات جاهزة للطلب من المتجر أو للتوصيل.",
    catalog: "اطلب المنتجات",
    orders: "تتبع الطلب",
    fresh: "طازج يوميا",
    freshText: "منتجات متاحة حسب المخزون الحقيقي في النظام.",
    delivery: "توصيل محلي",
    deliveryText: "المناطق والحد الادنى ورسوم التوصيل متوافقة مع Django.",
    payment: "دفع مرن",
    paymentText: "الدفع عند الاستلام أو عبر Konnect حسب اختيار العميل.",
    featured: "الاكثر طلبا",
    featuredText: "منتجات مميزة من الكتالوج.",
    aboutEyebrow: "من نحن",
    aboutTitle: "مذاق الخبز الطازج كل يوم",
    aboutText:
      "في 23 en voie نحضر كل دفعة بعناية: كرواسون بالزبدة، خبز يومي وحلويات طازجة بطابع بسيط ولذيذ. نعمل بروح مخبز الحي، مع تجربة طلب سهلة للاستلام من المتجر أو للتوصيل.",
    aboutNote:
      "وعدنا لكم: منتجات طازجة، أسعار واضحة، وطلب سريع من الكتالوج إلى السلة.",
    aboutCta: "اقرأ قصتنا",
    empty: "أضف منتجات مميزة في الخلفية لتظهر هنا.",
  },
} as const;

const promoCopy = {
  fr: {
    eyebrow: "Offres et services",
    fallbackTitle: "Box petit-dejeuner disponible",
    fallbackText:
      "Composez une selection de viennoiseries, pains et douceurs depuis le catalogue.",
    discountText: "Prix reduit directement applique dans le catalogue.",
    deliveryTitle: "Livraison locale",
    deliveryFallback:
      "Choisissez votre zone au panier pour calculer les frais.",
    freshTitle: "Fournées du jour",
    freshText: "Produits disponibles selon le stock publie par la boulangerie.",
  },
  ar: {
    eyebrow: "Offers",
    fallbackTitle: "Breakfast box available",
    fallbackText: "Choose pastries, bread, and sweets from the catalog.",
    discountText: "Discounted price is applied in the catalog.",
    deliveryTitle: "Local delivery",
    deliveryFallback: "Choose your zone in the cart to calculate delivery.",
    freshTitle: "Today baked",
    freshText: "Products are shown according to published stock.",
  },
} as const;

export default async function LocaleHome({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  const [featuredProducts, allProducts, deliveryZones] = await Promise.all([
    getProducts({ featured: true }),
    getProducts(),
    getDeliveryZones(),
  ]);
  const t = homeCopy[locale];
  const promo = promoCopy[locale];
  const discountedProduct = allProducts.find(
    (product) => product.discount_price,
  );
  const homeProducts =
    featuredProducts.length > 0 ? featuredProducts.slice(0, 3) : allProducts.slice(0, 3);
  const cheapestZone = deliveryZones
    .slice()
    .sort((a, b) => Number(a.delivery_fee) - Number(b.delivery_fee))[0];
  const promoCards = [
    discountedProduct
      ? {
          title: `Promo ${localizedName(discountedProduct, locale)}`,
          text: `${formatTnd(discountedProduct.current_price)} au lieu de ${formatTnd(
            discountedProduct.price,
          )}. ${promo.discountText}`,
          href: `/${locale}/catalog?q=${encodeURIComponent(
            localizedName(discountedProduct, locale),
          )}`,
        }
      : {
          title: promo.fallbackTitle,
          text: promo.fallbackText,
          href: `/${locale}/catalog`,
        },
    cheapestZone
      ? {
          title: promo.deliveryTitle,
          text: `${cheapestZone.city}${
            cheapestZone.area ? ` - ${cheapestZone.area}` : ""
          }: ${formatTnd(cheapestZone.delivery_fee)}. Minimum ${formatTnd(
            cheapestZone.minimum_order_amount,
          )}.`,
          href: `/${locale}/cart`,
        }
      : {
          title: promo.deliveryTitle,
          text: promo.deliveryFallback,
          href: `/${locale}/cart`,
        },
    {
      title: promo.freshTitle,
      text: promo.freshText,
      href: `/${locale}/catalog`,
    },
  ];

  return (
    <main className="min-h-screen">
      <Header locale={locale} />

      <section className="relative isolate overflow-hidden">
        <Image
          src="/images/bakery-hero.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(61,38,24,0.78),rgba(61,38,24,0.48)_42%,rgba(61,38,24,0.1)_75%)]" />

        <div
          className={`${shellClassName} relative z-10 flex min-h-[calc(100vh-9rem)] flex-col justify-center py-16 text-white md:min-h-[650px] md:py-20`}
        >
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[#f7d29c]">
            {t.eyebrow}
          </p>
          <h1 className="mb-5 max-w-[760px] text-[clamp(3.25rem,10vw,7.5rem)] leading-[0.88] !text-[#e0d5c5]">
            {t.title}
          </h1>
          <p className="mb-8 max-w-2xl text-[1.08rem] leading-8 text-[#fff4e3] md:text-xl">
            {t.subtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              className={`${buttonBaseClassName} bg-[#f2a64a] text-[#3d2618] hover:bg-[#ffd08a] hover:text-[#3d2618]`}
              href={`/${locale}/catalog`}
            >
              {t.catalog}
            </Link>
            <Link
              className={`${buttonBaseClassName} border-white/45 bg-white/12 text-white backdrop-blur hover:bg-white/22 hover:text-white`}
              href={`/${locale}/orders`}
            >
              {t.orders}
            </Link>
          </div>

          <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
            {[
              [t.fresh, t.freshText],
              [t.delivery, t.deliveryText],
              [t.payment, t.paymentText],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-lg border border-white/18 bg-white/14 p-4 backdrop-blur"
              >
                <h2 className="mb-2 text-base text-white">{title}</h2>
                <p className="text-sm leading-6 text-[#fff4e3]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-10">
        <div className={shellClassName}>
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_24px_60px_rgba(61,38,24,0.16)]">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[var(--button-hover)]">
              {promo.eyebrow}
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {promoCards.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-md border border-[var(--line)] bg-[var(--cream)] p-4 transition-colors hover:bg-[var(--background-soft)]"
                >
                  <h2 className="mb-2 text-lg">{item.title}</h2>
                  <p className="text-sm leading-6 text-[var(--muted)]">
                    {item.text}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`${shellClassName} py-12 md:py-16`}>
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-[var(--button-hover)]">
              {dictionary.brand}
            </p>
            <h2 className="text-3xl md:text-4xl">{t.featured}</h2>
            <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
              {t.featuredText}
            </p>
          </div>
          <Link
            className="w-fit rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--foreground)] transition-colors hover:bg-[var(--background-soft)]"
            href={`/${locale}/catalog`}
          >
            {dictionary.primaryAction}
          </Link>
        </div>

        {homeProducts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {homeProducts.map((product) => (
              <article
                key={product.id}
                className="flex min-h-[340px] flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)]"
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
                    <div className="grid h-full place-items-center px-6 text-center text-lg font-bold text-[var(--muted)]">
                      {localizedName(product, locale)}
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase text-[var(--muted)]">
                        {localizedName(product.category, locale)}
                      </p>
                      <h3 className="text-xl leading-tight">
                        {localizedName(product, locale)}
                      </h3>
                    </div>
                    {product.discount_price && (
                      <span className="shrink-0 rounded-full bg-[#f9e2a8] px-3 py-1 text-xs font-bold text-[#6a390f]">
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
                    <Link
                      className="rounded-md bg-[var(--button)] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--button-hover)]"
                      href={`/${locale}/catalog?q=${encodeURIComponent(
                        localizedName(product, locale),
                      )}`}
                    >
                      Voir
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6 text-[var(--muted)]">
            {t.empty}
          </div>
        )}
      </section>

      <section className="bg-[var(--cream)] py-12 md:py-16">
        <div
          className={`${shellClassName} grid gap-5 md:grid-cols-[0.9fr_1.1fr] md:items-center ${
            locale === "ar" ? "text-right" : ""
          }`}
        >
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-[var(--button-hover)]">
              {t.aboutEyebrow}
            </p>
            <h2 className="text-3xl md:text-4xl">{t.aboutTitle}</h2>
          </div>
          <div>
            <p className="text-lg leading-8 text-[var(--muted)]">
              {t.aboutNote}
            </p>
            <Link
              href={`/${locale}/about`}
              className="mt-5 inline-flex rounded-lg bg-[var(--button)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--button-hover)]"
            >
              {t.aboutCta}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
