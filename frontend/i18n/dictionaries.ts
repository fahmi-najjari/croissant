import "server-only";
import type { Locale } from "./config";

const dictionaries = {
  fr: () => import("./locales/fr.json").then((module) => module.default),
  ar: () => import("./locales/ar.json").then((module) => module.default),
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
