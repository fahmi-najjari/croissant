"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import type { Locale } from "@/i18n/config";

type AuthFormProps = {
  locale: Locale;
  mode: "signin" | "signup";
};

const copy = {
  fr: {
    signinTitle: "Connexion",
    signupTitle: "Creer un compte",
    signinText: "Connectez-vous pour retrouver vos commandes plus facilement.",
    signupText: "Creez un compte pour accelerer vos prochaines commandes.",
    email: "Email",
    password: "Mot de passe",
    firstName: "Prenom",
    lastName: "Nom",
    phone: "Telephone",
    signin: "Se connecter",
    signup: "Creer le compte",
    noAccount: "Pas encore de compte ?",
    hasAccount: "Deja un compte ?",
    goSignup: "S'inscrire",
    goSignin: "Se connecter",
    loading: "Veuillez patienter...",
  },
  ar: {
    signinTitle: "Sign in",
    signupTitle: "Create account",
    signinText: "Sign in to manage your bakery orders faster.",
    signupText: "Create an account for faster future orders.",
    email: "Email",
    password: "Password",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone",
    signin: "Sign in",
    signup: "Create account",
    noAccount: "No account yet?",
    hasAccount: "Already have an account?",
    goSignup: "Sign up",
    goSignin: "Sign in",
    loading: "Please wait...",
  },
} as const;

export function AuthForm({ locale, mode }: AuthFormProps) {
  const router = useRouter();
  const auth = useAuth();
  const t = copy[locale];
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignup = mode === "signup";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError("");
    setIsSubmitting(true);

    try {
      if (isSignup) {
        await auth.signUp({
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
          first_name: String(formData.get("first_name") ?? ""),
          last_name: String(formData.get("last_name") ?? ""),
          phone_number: String(formData.get("phone_number") ?? ""),
          preferred_language: locale,
        });
      } else {
        await auth.signIn({
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        });
      }

      router.push(`/${locale}/account`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Authentication failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-[980px] overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)] md:grid-cols-[0.9fr_1.1fr]">
      <div className="bg-[var(--foreground)] p-8 text-white md:p-10">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#f7d7a7]">
          23 en voie
        </p>
        <h1 className="mb-4 text-4xl leading-none text-white">
          {isSignup ? t.signupTitle : t.signinTitle}
        </h1>
        <p className="leading-7 text-[#fff4e3]">
          {isSignup ? t.signupText : t.signinText}
        </p>
      </div>

      <form className="grid gap-4 p-6 md:p-8" onSubmit={handleSubmit}>
        {isSignup && (
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="cart-input" name="first_name" placeholder={t.firstName} />
            <input className="cart-input" name="last_name" placeholder={t.lastName} />
          </div>
        )}
        <input
          className="cart-input"
          name="email"
          type="email"
          placeholder={t.email}
          required
        />
        {isSignup && (
          <input className="cart-input" name="phone_number" placeholder={t.phone} />
        )}
        <input
          className="cart-input"
          name="password"
          type="password"
          placeholder={t.password}
          required
        />

        {error && (
          <p className="rounded-md bg-[#f8ded8] p-3 text-sm font-bold text-[#7b2f1d]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-[var(--button)] px-5 py-3 font-bold text-white transition-colors hover:bg-[var(--button-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t.loading : isSignup ? t.signup : t.signin}
        </button>

        <p className="text-sm text-[var(--muted)]">
          {isSignup ? t.hasAccount : t.noAccount}{" "}
          <Link
            className="font-bold text-[var(--button-hover)]"
            href={`/${locale}/${isSignup ? "signin" : "signup"}`}
          >
            {isSignup ? t.goSignin : t.goSignup}
          </Link>
        </p>
      </form>
    </div>
  );
}
