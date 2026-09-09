from rest_framework import permissions, status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order, Payment
from .serializers import (
    AdminOrderUpdateSerializer,
    CheckoutSerializer,
    OrderSerializer,
    PaymentSerializer,
)
from .services import KonnectPaymentError, sync_konnect_payment, update_order_status


class CheckoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CheckoutSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        try:
            order = serializer.save()
        except KonnectPaymentError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class KonnectWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request):
        payment_ref = request.query_params.get("payment_ref")
        if not payment_ref:
            return Response(
                {"detail": "Missing payment_ref."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payment = Payment.objects.select_related("order").get(
                gateway_payment_ref=payment_ref,
                method=Payment.Method.KONNECT,
            )
            sync_konnect_payment(payment)
        except Payment.DoesNotExist:
            return Response(
                {"detail": "Payment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except KonnectPaymentError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({"detail": "Payment synced."})


class MyOrderListView(ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects.filter(customer=self.request.user)
            .select_related("delivery_zone")
            .prefetch_related("items", "payment")
        )


class MyOrderDetailView(RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "order_number"

    def get_queryset(self):
        return (
            Order.objects.filter(customer=self.request.user)
            .select_related("delivery_zone")
            .prefetch_related("items", "payment")
        )


class AdminOrderListView(ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = (
            Order.objects.select_related("customer", "delivery_zone")
            .prefetch_related("items", "payment")
            .all()
        )

        status_filter = self.request.query_params.get("status")
        payment_status = self.request.query_params.get("payment_status")
        phone_number = self.request.query_params.get("phone_number")

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        if phone_number:
            queryset = queryset.filter(phone_number__icontains=phone_number)

        return queryset


class AdminOrderDetailView(RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = "order_number"
    queryset = (
        Order.objects.select_related("customer", "delivery_zone")
        .prefetch_related("items", "payment")
        .all()
    )

    def patch(self, request, *args, **kwargs):
        order = self.get_object()
        serializer = AdminOrderUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = update_order_status(
            order,
            serializer.validated_data.get("status", order.status),
            serializer.validated_data.get("admin_note", ""),
        )
        return Response(OrderSerializer(order).data)


class PaymentStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, payment_ref):
        try:
            payment = Payment.objects.select_related("order").get(
                gateway_payment_ref=payment_ref,
                method=Payment.Method.KONNECT,
            )
        except Payment.DoesNotExist:
            return Response(
                {"detail": "Payment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if payment.order.customer_id != request.user.id and not request.user.is_staff:
            return Response(status=status.HTTP_403_FORBIDDEN)

        try:
            payment = sync_konnect_payment(payment)
        except KonnectPaymentError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(PaymentSerializer(payment).data)
