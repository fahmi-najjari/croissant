from decimal import Decimal, ROUND_HALF_UP

import requests
from django.conf import settings
from django.utils import timezone

from .models import Order, Payment


class KonnectPaymentError(Exception):
    pass


class KonnectClient:
    def __init__(self):
        self.base_url = getattr(settings, "KONNECT_BASE_URL", "").rstrip("/")
        self.api_key = getattr(settings, "KONNECT_API_KEY", "")
        self.receiver_wallet_id = getattr(settings, "KONNECT_RECEIVER_WALLET_ID", "")
        self.webhook_url = getattr(settings, "KONNECT_WEBHOOK_URL", "")

        if not all([self.base_url, self.api_key, self.receiver_wallet_id, self.webhook_url]):
            raise KonnectPaymentError("Konnect settings are not configured.")

    def initiate_payment(self, order):
        payload = {
            "receiverWalletId": self.receiver_wallet_id,
            "token": "TND",
            "amount": self._to_millimes(order.total),
            "type": "immediate",
            "description": f"Bakery order {order.order_number}",
            "acceptedPaymentMethods": ["bank_card", "e-DINAR"],
            "lifespan": 30,
            "checkoutForm": True,
            "addPaymentFeesToAmount": False,
            "firstName": self._first_name(order.customer_name),
            "lastName": self._last_name(order.customer_name),
            "phoneNumber": order.phone_number,
            "email": order.customer.email if order.customer else "",
            "orderId": order.order_number,
            "webhook": self.webhook_url,
            "theme": "light",
        }
        response = self._request("post", "/payments/init-payment", json=payload)
        return response

    def get_payment_details(self, payment_ref):
        return self._request("get", f"/payments/{payment_ref}")

    def _request(self, method, path, **kwargs):
        response = requests.request(
            method,
            f"{self.base_url}{path}",
            headers={"x-api-key": self.api_key},
            timeout=20,
            **kwargs,
        )

        try:
            data = response.json()
        except ValueError as exc:
            raise KonnectPaymentError("Konnect returned an invalid response.") from exc

        if response.status_code >= 400:
            raise KonnectPaymentError(data)

        return data

    def _to_millimes(self, amount):
        millimes = Decimal(amount) * Decimal("1000")
        return int(millimes.quantize(Decimal("1"), rounding=ROUND_HALF_UP))

    def _first_name(self, full_name):
        return full_name.strip().split(" ", 1)[0]

    def _last_name(self, full_name):
        parts = full_name.strip().split(" ", 1)
        return parts[1] if len(parts) > 1 else "-"


def create_cod_payment(order):
    return Payment.objects.create(
        order=order,
        method=Payment.Method.CASH_ON_DELIVERY,
        status=Payment.Status.PENDING,
        amount=order.total,
    )


def create_konnect_payment(order):
    client = KonnectClient()
    response = client.initiate_payment(order)

    return Payment.objects.create(
        order=order,
        method=Payment.Method.KONNECT,
        status=Payment.Status.PENDING,
        amount=order.total,
        gateway_payment_ref=response.get("paymentRef"),
        gateway_payment_url=response.get("payUrl", ""),
        gateway_response=response,
    )


def sync_konnect_payment(payment):
    if payment.method != Payment.Method.KONNECT or not payment.gateway_payment_ref:
        return payment

    client = KonnectClient()
    data = client.get_payment_details(payment.gateway_payment_ref)
    konnect_payment = data.get("payment", {})

    payment.gateway_response = data

    if konnect_payment.get("status") == "completed":
        payment.status = Payment.Status.PAID
        payment.paid_at = payment.paid_at or timezone.now()
        payment.order.payment_status = Order.PaymentStatus.PAID
    else:
        payment.status = Payment.Status.PENDING
        payment.order.payment_status = Order.PaymentStatus.UNPAID

    payment.save(update_fields=["status", "paid_at", "gateway_response", "updated_at"])
    payment.order.save(update_fields=["payment_status", "updated_at"])
    return payment
