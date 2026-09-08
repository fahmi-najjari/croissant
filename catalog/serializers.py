from rest_framework import serializers

from .models import Category, Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = [
            "id",
            "image",
            "alt_text_fr",
            "alt_text_ar",
            "is_primary",
            "sort_order",
        ]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "name_fr",
            "name_ar",
            "slug",
            "description_fr",
            "description_ar",
            "image",
            "is_active",
            "sort_order",
        ]
        read_only_fields = ["slug"]


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    current_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=3,
        read_only=True,
    )
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "category",
            "name_fr",
            "name_ar",
            "slug",
            "price",
            "discount_price",
            "current_price",
            "is_available",
            "is_featured",
            "in_stock",
            "primary_image",
        ]

    def get_primary_image(self, obj):
        images = list(obj.images.all())
        image = next((item for item in images if item.is_primary), None)
        image = image or (images[0] if images else None)
        if not image:
            return None
        return ProductImageSerializer(image, context=self.context).data


class ProductDetailSerializer(ProductListSerializer):
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + [
            "description_fr",
            "description_ar",
            "sku",
            "preparation_time_minutes",
            "track_stock",
            "stock_quantity",
            "sort_order",
            "images",
            "created_at",
            "updated_at",
        ]


class ProductWriteSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, required=False)

    class Meta:
        model = Product
        fields = [
            "id",
            "category",
            "name_fr",
            "name_ar",
            "slug",
            "description_fr",
            "description_ar",
            "price",
            "discount_price",
            "sku",
            "is_available",
            "is_featured",
            "preparation_time_minutes",
            "track_stock",
            "stock_quantity",
            "sort_order",
            "images",
        ]
        read_only_fields = ["slug"]

    def validate(self, attrs):
        price = attrs.get("price", getattr(self.instance, "price", None))
        discount_price = attrs.get(
            "discount_price",
            getattr(self.instance, "discount_price", None),
        )

        if discount_price is not None and price is not None and discount_price > price:
            raise serializers.ValidationError(
                {"discount_price": "Discount price cannot be higher than price."}
            )

        return attrs

    def create(self, validated_data):
        images_data = validated_data.pop("images", [])
        product = Product.objects.create(**validated_data)
        self._save_images(product, images_data)
        return product

    def update(self, instance, validated_data):
        images_data = validated_data.pop("images", None)

        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()

        if images_data is not None:
            instance.images.all().delete()
            self._save_images(instance, images_data)

        return instance

    def _save_images(self, product, images_data):
        for image_data in images_data:
            ProductImage.objects.create(product=product, **image_data)
