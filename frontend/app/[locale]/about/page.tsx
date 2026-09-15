import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { isLocale } from "@/i18n/config";

type PageProps = {
  params: Promise<{ locale: string }>;
};

const shellClassName = "mx-auto w-full max-w-[1120px] px-3 md:px-4";

const aboutCopy = {
  fr: {
    eyebrow: "A propos",
    title: "Le gout du pain fait maison",
    intro:
      "Chez 23 en voie, chaque fournee est preparee avec soin: croissants au beurre, pains du jour et patisseries simples, genereuses et toujours fraiches.",
    body:
      "Nous gardons l'esprit d'une boulangerie de quartier: des produits que l'on comprend, des prix lisibles, et une commande rapide pour recuperer en boutique ou se faire livrer. Le catalogue met en avant ce qui est disponible, les offres du moment et les zones de livraison.",
    promiseTitle: "Notre promesse",
    promise:
      "Des produits frais, une preparation soignee et un parcours simple du catalogue jusqu'au panier.",
    catalog: "Voir le catalogue",
  },
  ar: {
    eyebrow: "من نحن",
    title: "مذاق الخبز الطازج كل يوم",
    intro:
      "في 23 en voie نحضر كل دفعة بعناية: كرواسون بالزبدة، خبز يومي وحلويات طازجة بطابع بسيط ولذيذ.",
    body:
      "نحافظ على روح مخبز الحي: منتجات واضحة، أسعار مفهومة، وتجربة طلب سريعة للاستلام من المتجر أو للتوصيل. يعرض الكتالوج المنتجات المتاحة، العروض الحالية ومناطق التوصيل.",
    promiseTitle: "وعدنا لكم",
    promise:
      "منتجات طازجة، تحضير بعناية، وطلب سهل من الكتالوج إلى السلة.",
    catalog: "عرض الكتالوج",
  },
} as const;

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const t = aboutCopy[locale];

  return (
    <main className="min-h-screen">
      <Header locale={locale} activePath="about" />

      <section className={`${shellClassName} py-10 md:py-14`}>
        <div className="grid gap-8 md:grid-cols-[0.95fr_1.05fr] md:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)]">
            <Image
              src="/Najjari2.png"
              alt="23 en voie"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-contain"
              priority
            />
          </div>

          <div className={locale === "ar" ? "text-right" : ""}>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[var(--button-hover)]">
              {t.eyebrow}
            </p>
            <h1 className="max-w-2xl text-[2.75rem] leading-none text-[var(--foreground)] md:text-[clamp(3.25rem,7vw,5.75rem)]">
              {t.title}
            </h1>
            <p className="mt-6 text-xl leading-8 text-[var(--foreground)]">
              {t.intro}
            </p>
            <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
              {t.body}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[var(--cream)] py-12 md:py-16">
        <div
          className={`${shellClassName} grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-center ${
            locale === "ar" ? "text-right" : ""
          }`}
        >
          <h2 className="text-3xl md:text-4xl">{t.promiseTitle}</h2>
          <div>
            <p className="text-lg leading-8 text-[var(--muted)]">{t.promise}</p>
            <Link
              href={`/${locale}/catalog`}
              className="mt-6 inline-flex rounded-lg bg-[var(--button)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--button-hover)]"
            >
              {t.catalog}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
