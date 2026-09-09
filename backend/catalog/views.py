from django.db.models import Q
from rest_framework import viewsets

from .models import Category, Product
from .permissions import IsAdminOrReadOnly
from .serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ProductWriteSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        queryset = Category.objects.all()

        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)

        return queryset


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        queryset = (
            Product.objects.select_related("category")
            .prefetch_related("images")
            .all()
        )

        if not self.request.user.is_staff:
            queryset = queryset.filter(is_available=True, category__is_active=True)

        category = self.request.query_params.get("category")
        featured = self.request.query_params.get("featured")
        available = self.request.query_params.get("available")
        search = self.request.query_params.get("search")

        if category:
            queryset = queryset.filter(category__slug=category)
        if featured in {"true", "1"}:
            queryset = queryset.filter(is_featured=True)
        if available in {"true", "1"}:
            queryset = queryset.filter(is_available=True)
        if search:
            queryset = queryset.filter(
                Q(name_fr__icontains=search)
                | Q(name_ar__icontains=search)
                | Q(description_fr__icontains=search)
                | Q(description_ar__icontains=search)
            )

        return queryset

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ProductWriteSerializer
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer

