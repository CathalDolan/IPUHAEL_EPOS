from django.contrib import admin
from .models import Product, GrandTotal, LineItem, Staff
from import_export.admin import ExportActionMixin


class ProductAdmin(ExportActionMixin, admin.ModelAdmin):
    list_display = (
        'pk',
        'category',
        'name',
        'price_default',
        'price_sgle',
        'price_dble',
        'price_dash',
        'price_03',
        'price_04',
        'price_pint',
        'price_btle',
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
        'staff_member',
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


class StaffAdmin(admin.ModelAdmin):
    list_display = (
        'pk',
        'name',
        'on_duty',
    )
    ordering = (
        'id',
    )

admin.site.register(Product, ProductAdmin)
admin.site.register(GrandTotal, GrandTotalAdmin)
admin.site.register(LineItem, LineItemAdmin)
admin.site.register(Staff, StaffAdmin)
