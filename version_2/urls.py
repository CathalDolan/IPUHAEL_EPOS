from django.urls import path
from . import views


urlpatterns = [
    path('', views.index_v2, name='index_v2'),
]
