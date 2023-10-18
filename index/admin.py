from django.contrib import admin
from .models import Draught, HalfAndHalf, Shandy, CanAndBottle, Spirit, SoftDrink, HotNonAlcoholic, HotAlcoholic, HotToddy, Shot, Food, Product, GrandTotal, LineItem


class DraughtAdmin(admin.ModelAdmin):
    list_display = (
        'category',
        'name',
        'price_default',
        'price_03',
        'price_04',
        'price_pint',
    )
    ordering = (
        'id',
    )


class HalfAndHalfAdmin(admin.ModelAdmin):
    list_display = (
        'category',
        'name',
        'price_default',
        'price_03',
        'price_04',
        'price_pint',
    )
    ordering = (
        'id',
    )


class ShandyAdmin(admin.ModelAdmin):
    list_display = (
        'category',
        'name',
        'price_default',
        'price_03',
        'price_04',
        'price_pint',
    )
    ordering = (
        'id',
    )


class CanAndBottleAdmin(admin.ModelAdmin):
    list_display = (
        'category',
        'name',
        'price_default',
        'price_330',
        'price_440',
        'price_pint',
    )
    ordering = (
        'id',
    )


class SpiritAdmin(admin.ModelAdmin):
    list_display = (
        'category',
        'name',
        'price_default',
        'price_single',
        'price_double',
        'price_bottle',
    )
    ordering = (
        'id',
    )


class SoftDrinkAdmin(admin.ModelAdmin):
    list_display = (
        'category',
        'name',
        'price_default',
        'price_dash',
        'price_03',
        'price_04',
        'price_pint',
        'price_bottle',
    )
    ordering = (
        'id',
    )


class HotNonAlcoholicAdmin(admin.ModelAdmin):
    list_display = (
        'category',
        'name',
        'price_default',
    )
    ordering = (
        'id',
    )


class HotAlcoholicAdmin(admin.ModelAdmin):
    list_display = (
        'category',
        'name',
        'price_default',
    )
    ordering = (
        'id',
    )


class HotToddyAdmin(admin.ModelAdmin):
    list_display = (
        'category',
        'name',
        'price_default',
    )
    ordering = (
        'id',
    )


class ShotAdmin(admin.ModelAdmin):
    list_display = (
        'category',
        'name',
        'price_default',
    )
    ordering = (
        'id',
    )


class FoodAdmin(admin.ModelAdmin):
    list_display = (
        'category',
        'name',
        'price_default',
        'price_small',
        'price_regular',
    )
    ordering = (
        'id',
    )


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


admin.site.register(Draught, DraughtAdmin)
admin.site.register(HalfAndHalf, HalfAndHalfAdmin)
admin.site.register(Shandy, ShandyAdmin)
admin.site.register(CanAndBottle, CanAndBottleAdmin)
admin.site.register(Spirit, SpiritAdmin)
admin.site.register(SoftDrink, SoftDrinkAdmin)
admin.site.register(HotNonAlcoholic, HotNonAlcoholicAdmin)
admin.site.register(HotAlcoholic, HotAlcoholicAdmin)
admin.site.register(HotToddy, HotToddyAdmin)
admin.site.register(Shot, ShotAdmin)
admin.site.register(Food, FoodAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(GrandTotal, GrandTotalAdmin)
admin.site.register(LineItem, LineItemAdmin)
