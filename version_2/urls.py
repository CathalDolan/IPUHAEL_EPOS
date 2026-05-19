from django.urls import path
from . import views
from .views import bulk_edit_items


urlpatterns = [
    path('', views.index_v2, name='index_v2'),
    path('past_orders_v2', views.past_orders_v2, name='past_orders_v2'),
    path('export_data', views.export_data, name='export_data'),
    path('items/edit-all/', views.bulk_edit_items, name='bulk_edit'),
]
