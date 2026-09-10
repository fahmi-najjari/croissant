import type { Locale } from "@/i18n/config";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const MEDIA_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");
export const BACKEND_BASE_URL = MEDIA_BASE_URL;

type PaginatedResponse<T> = {
  results: T[];
};

export type Category = {
  id: number;
  name_fr: string;
  name_ar: string;
  slug: string;
  description_fr: string;
  description_ar: string;
  image: string | null;
  is_active: boolean;
  sort_order: number;
};

export type ProductImage = {
  id: number;
  image: string;
  alt_text_fr: string;
  alt_text_ar: string;
  is_primary: boolean;
  sort_order: number;
};

export type Product = {
  id: number;
  category: Category;
  name_fr: string;
  name_ar: string;
  slug: string;
  price: string;
  discount_price: string | null;
  current_price: string;
  is_available: boolean;
  is_featured: boolean;
  in_stock: boolean;
  primary_image: ProductImage | null;
};

export type DeliveryZone = {
  id: number;
  city: string;
  area: string;
  delivery_fee: string;
  minimum_order_amount: string;
  estimated_delivery_minutes: number;
  is_active: boolean;
  sort_order: number;
};

export type CheckoutPayload = {
  customer_name: string;
  phone_number: string;
  city: string;
  area?: string;
  delivery_address: string;
  building_details?: string;
  payment_method: "cash_on_delivery" | "konnect";
  customer_note?: string;
  preferred_delivery_date?: string | null;
  preferred_delivery_time?: string | null;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
};

export type Order = {
  id: number;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  customer_name: string;
  phone_number: string;
  city: string;
  area: string;
  delivery_address: string;
  building_details: string;
  subtotal: string;
  delivery_fee: string;
  discount_total: string;
  total: string;
  customer_note: string;
  preferred_delivery_date: string | null;
  preferred_delivery_time: string | null;
  payment: {
    id: number;
    order: number;
    method: string;
    status: string;
    amount: string;
    gateway_payment_ref: string | null;
    gateway_payment_url: string;
    paid_at: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  created_at: string;
};

export type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  preferred_language: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

function endpoint(path: string, params?: Record<string, string | undefined>) {
  const url = new URL(`${API_BASE_URL}${path}`);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url;
}

async function apiGet<T>(path: string, params?: Record<string, string | undefined>) {
  try {
    const response = await fetch(endpoint(path, params), {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as T[] | PaginatedResponse<T>;
    return Array.isArray(data) ? data : data.results;
  } catch {
    return [];
  }
}

export async function createCheckout(payload: CheckoutPayload) {
  const response = await fetch(endpoint("/orders/checkout/"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as Order | { detail?: string } | null;

  if (!response.ok) {
    const message =
      data && "detail" in data && data.detail
        ? data.detail
        : "La commande n'a pas pu etre envoyee.";
    throw new Error(message);
  }

  return data as Order;
}

async function apiPost<T>(path: string, payload?: unknown, token?: string) {
  const response = await fetch(endpoint(path), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  const data = (await response.json().catch(() => null)) as T | { detail?: string } | null;

  if (!response.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "detail" in data &&
      typeof data.detail === "string"
        ? data.detail
        : "La demande n'a pas pu etre envoyee.";
    throw new Error(message);
  }

  return data as T;
}

export function signin(payload: { email: string; password: string }) {
  return apiPost<AuthResponse>("/accounts/signin/", payload);
}

export function signup(payload: {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  preferred_language: Locale;
}) {
  return apiPost<AuthResponse>("/accounts/signup/", payload);
}

export async function logout(token: string) {
  await apiPost<null>("/accounts/logout/", undefined, token);
}

export async function getMe(token: string) {
  const response = await fetch(endpoint("/accounts/me/"), {
    headers: {
      Accept: "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Session expired.");
  }

  return (await response.json()) as User;
}

export async function getCategories() {
  return apiGet<Category>("/catalog/categories/");
}

export async function getProducts(params?: {
  category?: string;
  search?: string;
  featured?: boolean;
}) {
  return apiGet<Product>("/catalog/products/", {
    category: params?.category,
    search: params?.search,
    featured: params?.featured ? "true" : undefined,
    available: "true",
  });
}

export async function getDeliveryZones() {
  return apiGet<DeliveryZone>("/delivery/zones/");
}

export function localizedName(
  item: Pick<Category | Product, "name_fr" | "name_ar">,
  locale: Locale,
) {
  return locale === "ar" ? item.name_ar : item.name_fr;
}

export function localizedDescription(
  item: Pick<Category, "description_fr" | "description_ar">,
  locale: Locale,
) {
  return locale === "ar" ? item.description_ar : item.description_fr;
}

export function formatTnd(value: string | number) {
  return new Intl.NumberFormat("fr-TN", {
    style: "currency",
    currency: "TND",
    minimumFractionDigits: 3,
  }).format(Number(value));
}

export function mediaUrl(path: string | null | undefined) {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${MEDIA_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
