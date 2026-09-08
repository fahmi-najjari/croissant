from rest_framework import serializers

from .models import DeliveryZone


class DeliveryZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryZone
        fields = [
            "id",
            "city",
            "area",
            "delivery_fee",
            "minimum_order_amount",
            "estimated_delivery_minutes",
            "is_active",
            "sort_order",
        ]

