from django.urls import path

from .views import KonnectWebhookView, PaymentStatusView


app_name = "orders"

urlpatterns = [
    path("payments/konnect/webhook/", KonnectWebhookView.as_view(), name="konnect-webhook"),
    path("payments/konnect/<str:payment_ref>/", PaymentStatusView.as_view(), name="konnect-status"),
]
