from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('past_orders', views.past_orders, name='past_orders'),
    path('takings', views.takings, name='takings'),
    path('reports', views.reports, name='reports'),
]
