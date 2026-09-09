from django.urls import path

from .views import (
    AdminOrderDetailView,
    AdminOrderListView,
    CheckoutView,
    KonnectWebhookView,
    MyOrderDetailView,
    MyOrderListView,
    PaymentStatusView,
)
app_name = "orders"

urlpatterns = [
    path("checkout/", CheckoutView.as_view(), name="checkout"),
    path("my-orders/", MyOrderListView.as_view(), name="my-order-list"),
    path("my-orders/<str:order_number>/", MyOrderDetailView.as_view(), name="my-order-detail"),
    path("admin/orders/", AdminOrderListView.as_view(), name="admin-order-list"),
    path("admin/orders/<str:order_number>/", AdminOrderDetailView.as_view(), name="admin-order-detail"),
    path("payments/konnect/webhook/", KonnectWebhookView.as_view(), name="konnect-webhook"),
    path("payments/konnect/<str:payment_ref>/", PaymentStatusView.as_view(), name="konnect-status"),
]
