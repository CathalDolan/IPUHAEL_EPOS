from django.contrib import admin
from .models import Draught, HalfAndHalf, Shandy, CanAndBottle, Spirit, SoftDrink


class DraughtAdmin(admin.ModelAdmin):
    list_display = (
        'category',
        'name',
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
        'price_dash',
        'price_03',
        'price_04',
        'price_pint',
        'price_bottle',
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
