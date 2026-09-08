from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id",
            "order",
            "method",
            "status",
            "amount",
            "gateway_payment_ref",
            "gateway_payment_url",
            "paid_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

