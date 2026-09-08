from rest_framework import viewsets

from .models import DeliveryZone
from .permissions import IsAdminOrReadOnly
from .serializers import DeliveryZoneSerializer


class DeliveryZoneViewSet(viewsets.ModelViewSet):
    serializer_class = DeliveryZoneSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = DeliveryZone.objects.all()

        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)

        city = self.request.query_params.get("city")
        area = self.request.query_params.get("area")

        if city:
            queryset = queryset.filter(city__iexact=city)
        if area:
            queryset = queryset.filter(area__iexact=area)

        return queryset

