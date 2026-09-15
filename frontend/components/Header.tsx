"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import type { Locale } from "@/i18n/config";

type HeaderProps = {
  locale: Locale;
  activePath?: "home" | "about" | "catalog" | "orders";
  cartItemsCount?: number;
  isAuthenticated?: boolean;
};

const labels = {
  fr: {
    brand: "23 en voie",
    menu: "Menu",
    close: "Fermer",
    search: "Rechercher",
    searchPlaceholder: "Pain, croissant, gateau...",
    about: "A propos",
    products: "Produits",
    orders: "Commandes",
    signin: "Connexion",
    account: "Compte",
    logout: "Deconnexion",
    cart: "Panier",
  },
  ar: {
    brand: "23 en voie",
    menu: "القائمة",
    close: "إغلاق",
    search: "بحث",
    searchPlaceholder: "خبز، كرواسون، كعك...",
    about: "حولنا",
    products: "المنتجات",
    orders: "الطلبات",
    signin: "تسجيل الدخول",
    account: "الحساب",
    cart: "السلة",
  },
} as const;

export function Header({
  locale,
  activePath = "home",
  cartItemsCount,
  isAuthenticated = false,
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const cart = useCart();
  const auth = useAuth();
  const t = labels[locale];
  const isRtl = locale === "ar";
  const localePrefix = `/${locale}`;
  const visibleIsAuthenticated = isAuthenticated || auth.isAuthenticated;
  const accountHref = visibleIsAuthenticated
    ? `${localePrefix}/account`
    : `${localePrefix}/signin`;
  const accountLabel = visibleIsAuthenticated ? t.account : t.signin;
  const logoutLabel = "logout" in t ? t.logout : "Logout";
  const visibleCartItemsCount = cartItemsCount ?? cart.itemsCount;

  const navItems = [
    { key: "orders", label: t.orders, href: `${localePrefix}/orders` },
    { key: "catalog", label: t.products, href: `${localePrefix}/catalog` },
    { key: "about", label: t.about, href: `${localePrefix}/about` },
  ] as const;

  return (
    <header
      dir={isRtl ? "rtl" : "ltr"}
      className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--surface)]/95 shadow-sm backdrop-blur"
    >
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-md text-[var(--foreground)] transition-colors hover:bg-[var(--background-soft)] md:hidden"
          aria-label={open ? t.close : t.menu}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link href={localePrefix} className="flex shrink-0 items-center gap-2">
          <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-md bg-[var(--cream)] ring-1 ring-[var(--line)]">
            <Image
              src="/images/croissantlogo.png"
              alt=""
              width={40}
              height={40}
              className="h-full w-full object-cover"
              priority
            />
          </span>
        </Link>

        <div className="hidden flex-1 justify-center lg:flex">
          <form
            action={`/${locale}/catalog`}
            className="flex w-full max-w-md items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--cream)] px-3 py-2"
            role="search"
          >
            <Search className="h-4 w-4 shrink-0 text-[var(--muted)]" />
            <input
              name="q"
              type="search"
              aria-label={t.search}
              placeholder={t.searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
            />
          </form>
        </div>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:bg-[var(--background-soft)] hover:text-[var(--foreground)] ${
                activePath === item.key
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1 sm:gap-2">
          <Link
            href={`/${locale === "fr" ? "ar" : "fr"}`}
            className="rounded-md border border-[var(--line)] bg-[var(--cream)] px-3 py-2 text-xs font-bold text-[var(--foreground)] transition-colors hover:bg-[var(--background-soft)]"
          >
            {locale === "fr" ? "AR" : "FR"}
          </Link>

          <Link
            href={`${localePrefix}/catalog`}
            className="grid h-10 w-10 place-items-center rounded-md text-[var(--foreground)] transition-colors hover:bg-[var(--background-soft)] lg:hidden"
            aria-label={t.search}
          >
            <Search className="h-5 w-5" />
          </Link>

          <Link
            href={`${localePrefix}/cart`}
            className="relative grid h-10 w-10 place-items-center rounded-md text-[var(--foreground)] transition-colors hover:bg-[var(--background-soft)]"
            aria-label={t.cart}
          >
            <ShoppingBag className="h-5 w-5" />
            {visibleCartItemsCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--button)] px-1 text-[11px] font-bold text-white">
                {visibleCartItemsCount}
              </span>
            )}
          </Link>

          <Link
            href={accountHref}
            className="grid h-10 w-10 place-items-center rounded-md text-[var(--foreground)] transition-colors hover:bg-[var(--background-soft)]"
            aria-label={accountLabel}
            title={accountLabel}
          >
            <UserRound className="h-5 w-5" />
          </Link>
          {visibleIsAuthenticated && (
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-md text-[var(--foreground)] transition-colors hover:bg-[var(--background-soft)]"
              aria-label={logoutLabel}
              title={logoutLabel}
              onClick={() => auth.signOut()}
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--line)] bg-[var(--surface)] px-4 py-4 md:hidden">
          <form
            action={`/${locale}/catalog`}
            className="mb-4 flex items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--cream)] px-3 py-2"
            role="search"
          >
            <Search className="h-4 w-4 shrink-0 text-[var(--muted)]" />
            <input
              name="q"
              type="search"
              aria-label={t.search}
              placeholder={t.searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
            />
          </form>

          <nav className="grid gap-1">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--background-soft)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
