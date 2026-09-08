from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Payment
from .serializers import PaymentSerializer
from .services import KonnectPaymentError, sync_konnect_payment


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
