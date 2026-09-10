import Image from "next/image";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { BACKEND_BASE_URL } from "@/lib/api";

type FooterProps = {
  locale: Locale;
};

const labels = {
  fr: {
    brand: "23 en voie",
    text: "Boulangerie artisanale pour commander les pains, viennoiseries et patisseries du jour.",
    shop: "Boutique",
    products: "Produits",
    orders: "Commandes",
    cart: "Panier",
    account: "Compte",
    about: "A propos",
    admin: "Administration",
    adminHint: "Acces reserve",
  },
  ar: {
    brand: "23 en voie",
    text: "Artisan bakery for daily breads, pastries, and sweets.",
    shop: "Shop",
    products: "Products",
    orders: "Orders",
    cart: "Cart",
    account: "Account",
    about: "About",
    admin: "Admin",
    adminHint: "Private access",
  },
} as const;

export function Footer({ locale }: FooterProps) {
  const t = labels[locale];
  const localePrefix = `/${locale}`;

  const links = [
    { label: t.products, href: `${localePrefix}/catalog` },
    { label: t.orders, href: `${localePrefix}/orders` },
    { label: t.cart, href: `${localePrefix}/cart` },
    { label: t.account, href: `${localePrefix}/account` },
    { label: t.about, href: `${localePrefix}#about` },
  ];

  return (
    <footer className="border-t border-[var(--line)] bg-[var(--foreground)] text-white">
      <div className="mx-auto grid w-full max-w-[1120px] gap-8 px-3 py-10 md:grid-cols-[1fr_auto_auto] md:px-4">
        <div className="max-w-md">
          <Link href={localePrefix} className="mb-4 flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-md bg-[var(--cream)]">
              <Image
                src="/images/croissantlogo.png"
                alt=""
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </span>
            <span className="text-lg font-extrabold">{t.brand}</span>
          </Link>
          <p className="leading-7 text-[#fff4e3]">{t.text}</p>
        </div>

        <nav aria-label={t.shop}>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#f7d7a7]">
            {t.shop}
          </h2>
          <div className="grid gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-[#fff4e3] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#f7d7a7]">
            {t.adminHint}
          </h2>
          <a
            href={`${BACKEND_BASE_URL}/admin/`}
            className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/18"
          >
            <LockKeyhole className="h-4 w-4" />
            {t.admin}
          </a>
        </div>
      </div>
    </footer>
  );
}
