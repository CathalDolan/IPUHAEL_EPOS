from django.contrib import admin
from .models import Product, GrandTotal, LineItem


class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'category',
        'name',
        'price_default',
        'price_double',
        'price_dash',
        'price_03',
        'price_04',
        'price_pint',
        'price_bottle',
        'price_330',
        'price_440',
        'price_small',
        'price_regular',
    )
    ordering = (
        'id',
    )


class GrandTotalAdmin(admin.ModelAdmin):
    list_display = (
        'number_of_products',
        'drinks_food_total',
        'pfand_total',
        'total_due',
        'tendered_amount',
        'change_due',
        'payment_method',
    )
    ordering = (
        'id',
    )


class LineItemAdmin(admin.ModelAdmin):
    list_display = (
        'grand_totals',
        'category',
        'name',
        'quantity',
        'size',
        'price_unit',
        'price_line_total',
    )
    ordering = (
        'id',
    )


admin.site.register(Product, ProductAdmin)
admin.site.register(GrandTotal, GrandTotalAdmin)
admin.site.register(LineItem, LineItemAdmin)
