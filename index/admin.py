from django.contrib import admin
from .models import Product, GrandTotal, LineItem
from import_export.admin import ExportActionMixin


class ProductAdmin(ExportActionMixin, admin.ModelAdmin):
    list_display = (
        'pk',
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
        'pfand',
    )
    ordering = (
        'id',
    )


class GrandTotalAdmin(ExportActionMixin, admin.ModelAdmin):
    list_display = (
        'pk',
        'order_date',
        'number_of_products',
        'pfand_buttons_total',
        'drinks_food_total',
        'pfand_total',
        'total_due',
        'tendered_amount',
        'change_due',
        'payment_method',
        'payment_reason',
    )
    ordering = (
        '-id',
    )


class LineItemAdmin(ExportActionMixin, admin.ModelAdmin):
    list_display = (
        'pk',
        'order_date_li',
        'grand_totals',
        'category',
        'name',
        'quantity',
        'size',
        'price_unit',
        'price_line_total',
        'discount',
    )
    ordering = (
        '-id',
    )


admin.site.register(Product, ProductAdmin)
admin.site.register(GrandTotal, GrandTotalAdmin)
admin.site.register(LineItem, LineItemAdmin)
