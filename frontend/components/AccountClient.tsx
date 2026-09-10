"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import type { Locale } from "@/i18n/config";

type AccountClientProps = {
  locale: Locale;
};

const copy = {
  fr: {
    title: "Votre compte",
    text: "Retrouvez vos informations client pour commander plus vite.",
    email: "Email",
    phone: "Telephone",
    name: "Nom",
    orders: "Voir les commandes",
    signin: "Se connecter",
    signout: "Se deconnecter",
    anonymous: "Connectez-vous pour acceder a votre compte.",
  },
  ar: {
    title: "Account",
    text: "Manage your customer details for faster bakery orders.",
    email: "Email",
    phone: "Phone",
    name: "Name",
    orders: "View orders",
    signin: "Sign in",
    signout: "Sign out",
    anonymous: "Sign in to access your account.",
  },
} as const;

export function AccountClient({ locale }: AccountClientProps) {
  const auth = useAuth();
  const router = useRouter();
  const t = copy[locale];

  if (auth.isLoading) {
    return (
      <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6 text-[var(--muted)]">
        ...
      </div>
    );
  }

  if (!auth.user) {
    return (
      <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6">
        <p className="mb-5 text-[var(--muted)]">{t.anonymous}</p>
        <Link
          className="inline-flex rounded-lg bg-[var(--button)] px-5 py-3 font-bold text-white hover:bg-[var(--button-hover)]"
          href={`/${locale}/signin`}
        >
          {t.signin}
        </Link>
      </div>
    );
  }

  const fullName = [auth.user.first_name, auth.user.last_name].filter(Boolean).join(" ");

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-[var(--button-hover)]">
          23 en voie
        </p>
        <h1 className="mb-3 text-4xl">{t.title}</h1>
        <p className="mb-6 max-w-2xl leading-7 text-[var(--muted)]">{t.text}</p>
        <dl className="grid gap-4">
          <div className="rounded-md border border-[var(--line)] bg-[var(--cream)] p-4">
            <dt className="text-sm font-bold text-[var(--muted)]">{t.email}</dt>
            <dd className="mt-1 text-lg">{auth.user.email}</dd>
          </div>
          <div className="rounded-md border border-[var(--line)] bg-[var(--cream)] p-4">
            <dt className="text-sm font-bold text-[var(--muted)]">{t.name}</dt>
            <dd className="mt-1 text-lg">{fullName || "-"}</dd>
          </div>
          <div className="rounded-md border border-[var(--line)] bg-[var(--cream)] p-4">
            <dt className="text-sm font-bold text-[var(--muted)]">{t.phone}</dt>
            <dd className="mt-1 text-lg">{auth.user.phone_number || "-"}</dd>
          </div>
        </dl>
      </section>

      <aside className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
        <Link
          className="mb-3 flex justify-center rounded-lg bg-[var(--button)] px-5 py-3 font-bold text-white hover:bg-[var(--button-hover)]"
          href={`/${locale}/orders`}
        >
          {t.orders}
        </Link>
        <button
          type="button"
          className="w-full rounded-lg border border-[var(--line)] bg-[var(--cream)] px-5 py-3 font-bold text-[var(--foreground)] hover:bg-[var(--background-soft)]"
          onClick={async () => {
            await auth.signOut();
            router.push(`/${locale}`);
          }}
        >
          {t.signout}
        </button>
      </aside>
    </div>
  );
}
