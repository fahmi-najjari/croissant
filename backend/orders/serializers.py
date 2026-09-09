from rest_framework import serializers

from catalog.models import Product
from delivery.models import DeliveryZone
from django.db import transaction

from .models import Order, OrderItem, Payment
from .services import create_cod_payment, create_konnect_payment


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


class CheckoutItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class CheckoutSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=150)
    phone_number = serializers.CharField(max_length=20)
    city = serializers.CharField(max_length=100)
    area = serializers.CharField(max_length=100, required=False, allow_blank=True)
    delivery_address = serializers.CharField()
    building_details = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
    )
    payment_method = serializers.ChoiceField(
        choices=Order.PaymentMethod.choices,
        default=Order.PaymentMethod.CASH_ON_DELIVERY,
    )
    customer_note = serializers.CharField(required=False, allow_blank=True)
    preferred_delivery_date = serializers.DateField(required=False, allow_null=True)
    preferred_delivery_time = serializers.TimeField(required=False, allow_null=True)
    items = CheckoutItemSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must contain at least one item.")
        return value

    def validate(self, attrs):
        area = attrs.get("area", "")
        delivery_zone = DeliveryZone.objects.filter(
            city__iexact=attrs["city"],
            area__iexact=area,
            is_active=True,
        ).first()

        if not delivery_zone:
            raise serializers.ValidationError(
                {"delivery": "Delivery is not available for this city and area."}
            )

        product_ids = [item["product_id"] for item in attrs["items"]]
        products = Product.objects.filter(
            id__in=product_ids,
            is_available=True,
            category__is_active=True,
        )
        products_by_id = {product.id: product for product in products}

        missing_ids = sorted(set(product_ids) - set(products_by_id))
        if missing_ids:
            raise serializers.ValidationError(
                {"items": f"Some products are unavailable: {missing_ids}"}
            )

        subtotal = 0
        checked_items = []

        for item in attrs["items"]:
            product = products_by_id[item["product_id"]]
            quantity = item["quantity"]

            if product.track_stock and quantity > product.stock_quantity:
                raise serializers.ValidationError(
                    {"items": f"Not enough stock for {product.name_fr}."}
                )

            unit_price = product.current_price
            total_price = unit_price * quantity
            subtotal += total_price
            checked_items.append(
                {
                    "product": product,
                    "quantity": quantity,
                    "unit_price": unit_price,
                    "total_price": total_price,
                }
            )

        if subtotal < delivery_zone.minimum_order_amount:
            raise serializers.ValidationError(
                {
                    "minimum_order_amount": (
                        "Minimum order amount for this delivery zone is "
                        f"{delivery_zone.minimum_order_amount} TND."
                    )
                }
            )

        attrs["delivery_zone"] = delivery_zone
        attrs["checked_items"] = checked_items
        attrs["subtotal"] = subtotal
        attrs["delivery_fee"] = delivery_zone.delivery_fee
        attrs["total"] = subtotal + delivery_zone.delivery_fee
        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            checked_items = validated_data.pop("checked_items")
            validated_data.pop("items")
            customer = self.context["request"].user

            if not customer.is_authenticated:
                customer = None

            payment_method = validated_data["payment_method"]
            order = Order.objects.create(
                customer=customer,
                delivery_zone=validated_data["delivery_zone"],
                status=Order.Status.PENDING,
                payment_status=Order.PaymentStatus.UNPAID,
                payment_method=payment_method,
                customer_name=validated_data["customer_name"],
                phone_number=validated_data["phone_number"],
                city=validated_data["city"],
                area=validated_data.get("area", ""),
                delivery_address=validated_data["delivery_address"],
                building_details=validated_data.get("building_details", ""),
                subtotal=validated_data["subtotal"],
                delivery_fee=validated_data["delivery_fee"],
                total=validated_data["total"],
                customer_note=validated_data.get("customer_note", ""),
                preferred_delivery_date=validated_data.get("preferred_delivery_date"),
                preferred_delivery_time=validated_data.get("preferred_delivery_time"),
            )

            for item in checked_items:
                OrderItem.objects.create(
                    order=order,
                    product=item["product"],
                    product_name_fr=item["product"].name_fr,
                    product_name_ar=item["product"].name_ar,
                    unit_price=item["unit_price"],
                    quantity=item["quantity"],
                    total_price=item["total_price"],
                )

            if payment_method == Order.PaymentMethod.KONNECT:
                payment = create_konnect_payment(order)
            else:
                payment = create_cod_payment(order)

            order.payment = payment
            return order


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name_fr",
            "product_name_ar",
            "unit_price",
            "quantity",
            "total_price",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    payment = PaymentSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "payment_method",
            "payment_status",
            "customer_name",
            "phone_number",
            "city",
            "area",
            "delivery_address",
            "building_details",
            "subtotal",
            "delivery_fee",
            "discount_total",
            "total",
            "customer_note",
            "preferred_delivery_date",
            "preferred_delivery_time",
            "items",
            "payment",
            "created_at",
        ]
        read_only_fields = fields


class AdminOrderUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.Status.choices, required=False)
    admin_note = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("Provide status or admin_note.")
        return attrs
