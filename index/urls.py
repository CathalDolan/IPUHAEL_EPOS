from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    # path('add/<item_id>/', views.add_to_basket, name='add_to_basket'),
    path('past_orders', views.past_orders, name='past_orders'),
    path('takings', views.takings, name='takings'),
    path('reports', views.reports, name='reports'),
    path('generate_report', views.generate_report, name='generate_report'),
]
