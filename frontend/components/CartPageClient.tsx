"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import type { Locale } from "@/i18n/config";
import type { DeliveryZone, Order } from "@/lib/api";
import { createCheckout, formatTnd } from "@/lib/api";

type CartPageClientProps = {
  locale: Locale;
  deliveryZones: DeliveryZone[];
};

const labels = {
  fr: {
    title: "Votre panier",
    empty: "Votre panier est vide.",
    catalog: "Voir les produits",
    checkout: "Finaliser la commande",
    subtotal: "Sous-total",
    delivery: "Livraison",
    total: "Total estime",
    remove: "Supprimer",
    customer: "Vos informations",
    name: "Nom complet",
    phone: "Telephone",
    city: "Ville",
    area: "Zone",
    address: "Adresse de livraison",
    building: "Batiment, etage, details",
    note: "Note pour la boulangerie",
    payment: "Paiement",
    cash: "Especes a la livraison",
    konnect: "Konnect",
    submit: "Envoyer la commande",
    success: "Commande recue",
    orderNumber: "Numero",
    error: "Impossible d'envoyer la commande.",
    chooseZone: "Choisir une zone",
  },
  ar: {
    title: "السلة",
    empty: "السلة فارغة.",
    catalog: "عرض المنتجات",
    checkout: "إتمام الطلب",
    subtotal: "المجموع",
    delivery: "التوصيل",
    total: "المجموع التقريبي",
    remove: "حذف",
    customer: "معلوماتك",
    name: "الاسم الكامل",
    phone: "الهاتف",
    city: "المدينة",
    area: "المنطقة",
    address: "عنوان التوصيل",
    building: "تفاصيل المبنى",
    note: "ملاحظة",
    payment: "الدفع",
    cash: "الدفع عند الاستلام",
    konnect: "Konnect",
    submit: "إرسال الطلب",
    success: "تم استلام الطلب",
    orderNumber: "الرقم",
    error: "تعذر إرسال الطلب.",
    chooseZone: "اختر منطقة",
  },
} as const;

const checkoutLabels = {
  fr: {
    preferredDate: "Date souhaitee",
    preferredTime: "Heure souhaitee",
    status: "Statut",
    paymentStatus: "Paiement",
    orderTotal: "Total",
    konnectRedirect: "Redirection vers Konnect...",
  },
  ar: {
    preferredDate: "Preferred date",
    preferredTime: "Preferred time",
    status: "Status",
    paymentStatus: "Payment",
    orderTotal: "Total",
    konnectRedirect: "Redirecting to Konnect...",
  },
} as const;

function itemName(item: { name_fr: string; name_ar: string }, locale: Locale) {
  return locale === "ar" ? item.name_ar : item.name_fr;
}

export function CartPageClient({ locale, deliveryZones }: CartPageClientProps) {
  const t = labels[locale];
  const checkout = checkoutLabels[locale];
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const selectedZone = useMemo(
    () => deliveryZones.find((zone) => String(zone.id) === selectedZoneId),
    [deliveryZones, selectedZoneId],
  );
  const deliveryFee = selectedZone ? Number(selectedZone.delivery_fee) : 0;
  const total = subtotal + deliveryFee;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (!selectedZone) {
      setStatus("error");
      setMessage(t.chooseZone);
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const order = await createCheckout({
        customer_name: String(formData.get("customer_name") ?? ""),
        phone_number: String(formData.get("phone_number") ?? ""),
        city: selectedZone.city,
        area: selectedZone.area,
        delivery_address: String(formData.get("delivery_address") ?? ""),
        building_details: String(formData.get("building_details") ?? ""),
        payment_method: String(formData.get("payment_method")) as
          | "cash_on_delivery"
          | "konnect",
        customer_note: String(formData.get("customer_note") ?? ""),
        preferred_delivery_date:
          String(formData.get("preferred_delivery_date") ?? "") || null,
        preferred_delivery_time:
          String(formData.get("preferred_delivery_time") ?? "") || null,
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
      });

      clearCart();
      setConfirmedOrder(order);
      setStatus("success");
      setMessage(`${t.success}. ${t.orderNumber}: ${order.order_number}`);

      if (order.payment?.gateway_payment_url) {
        setMessage(`${t.success}. ${checkout.konnectRedirect}`);
        window.location.href = order.payment.gateway_payment_url;
      }
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : t.error);
    }
  }

  if (items.length === 0 && status !== "success") {
    return (
      <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6">
        <p className="mb-5 text-[var(--muted)]">{t.empty}</p>
        <Link
          className="inline-flex rounded-lg bg-[var(--button)] px-5 py-3 font-bold text-white hover:bg-[var(--button-hover)]"
          href={`/${locale}/catalog`}
        >
          {t.catalog}
        </Link>
      </div>
    );
  }

  if (confirmedOrder) {
    return (
      <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-[var(--button-hover)]">
          {t.success}
        </p>
        <h1 className="mb-6 text-3xl">{confirmedOrder.order_number}</h1>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-[var(--line)] bg-[var(--cream)] p-4">
            <dt className="text-sm font-bold text-[var(--muted)]">
              {checkout.status}
            </dt>
            <dd className="mt-1 text-lg font-bold">{confirmedOrder.status}</dd>
          </div>
          <div className="rounded-md border border-[var(--line)] bg-[var(--cream)] p-4">
            <dt className="text-sm font-bold text-[var(--muted)]">
              {checkout.paymentStatus}
            </dt>
            <dd className="mt-1 text-lg font-bold">
              {confirmedOrder.payment_status}
            </dd>
          </div>
          <div className="rounded-md border border-[var(--line)] bg-[var(--cream)] p-4">
            <dt className="text-sm font-bold text-[var(--muted)]">
              {checkout.orderTotal}
            </dt>
            <dd className="mt-1 text-lg font-bold">
              {formatTnd(confirmedOrder.total)}
            </dd>
          </div>
          <div className="rounded-md border border-[var(--line)] bg-[var(--cream)] p-4">
            <dt className="text-sm font-bold text-[var(--muted)]">{t.payment}</dt>
            <dd className="mt-1 text-lg font-bold">
              {confirmedOrder.payment?.status ?? confirmedOrder.payment_method}
            </dd>
          </div>
        </dl>
        <Link
          className="mt-6 inline-flex rounded-lg bg-[var(--button)] px-5 py-3 font-bold text-white hover:bg-[var(--button-hover)]"
          href={`/${locale}/catalog`}
        >
          {t.catalog}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
      <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
        <h2 className="mb-5 text-2xl">{t.title}</h2>
        <div className="grid gap-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="grid gap-4 rounded-md border border-[var(--line)] bg-[var(--cream)] p-4 sm:grid-cols-[1fr_auto]"
            >
              <div>
                <h3 className="text-lg">{itemName(item, locale)}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {formatTnd(item.price)} x {item.quantity}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-md border border-[var(--line)]"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-bold">{item.quantity}</span>
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-md border border-[var(--line)]"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-md text-[#8a2d18]"
                  aria-label={t.remove}
                  onClick={() => removeItem(item.productId)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <form
        className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5"
        onSubmit={handleSubmit}
      >
        <h2 className="mb-5 text-2xl">{t.checkout}</h2>
        <div className="mb-5 grid gap-3 text-sm">
          <div className="flex justify-between">
            <span>{t.subtotal}</span>
            <strong>{formatTnd(subtotal)}</strong>
          </div>
          <div className="flex justify-between">
            <span>{t.delivery}</span>
            <strong>{formatTnd(deliveryFee)}</strong>
          </div>
          <div className="flex justify-between border-t border-[var(--line)] pt-3 text-base">
            <span>{t.total}</span>
            <strong>{formatTnd(total)}</strong>
          </div>
        </div>

        <div className="grid gap-3">
          <input className="cart-input" name="customer_name" placeholder={t.name} required />
          <input className="cart-input" name="phone_number" placeholder={t.phone} required />
          <select
            className="cart-input"
            required
            value={selectedZoneId}
            onChange={(event) => setSelectedZoneId(event.target.value)}
          >
            <option value="">{t.chooseZone}</option>
            {deliveryZones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.city}
                {zone.area ? ` - ${zone.area}` : ""} ({formatTnd(zone.delivery_fee)})
              </option>
            ))}
          </select>
          <textarea
            className="cart-input min-h-24"
            name="delivery_address"
            placeholder={t.address}
            required
          />
          <input className="cart-input" name="building_details" placeholder={t.building} />
          <textarea className="cart-input min-h-20" name="customer_note" placeholder={t.note} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="cart-input"
              name="preferred_delivery_date"
              type="date"
              aria-label={checkout.preferredDate}
            />
            <input
              className="cart-input"
              name="preferred_delivery_time"
              type="time"
              aria-label={checkout.preferredTime}
            />
          </div>
          <select className="cart-input" name="payment_method" defaultValue="cash_on_delivery">
            <option value="cash_on_delivery">{t.cash}</option>
            <option value="konnect">{t.konnect}</option>
          </select>
        </div>

        {message && (
          <p
            className={`mt-4 rounded-md p-3 text-sm font-bold ${
              status === "success"
                ? "bg-[#e7f4df] text-[#315c20]"
                : "bg-[#f8ded8] text-[#7b2f1d]"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting" || items.length === 0}
          className="mt-5 w-full rounded-lg bg-[var(--button)] px-5 py-3 font-bold text-white transition-colors hover:bg-[var(--button-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "..." : t.submit}
        </button>
      </form>
    </div>
  );
}
