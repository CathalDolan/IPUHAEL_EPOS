from django.contrib import admin
from .models import Category, SubCategory
from import_export.admin import ExportActionMixin


class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        'pk',
        'name',
    )
    ordering = (
        'id',
    )


class SubCategoryAdmin(admin.ModelAdmin):
    list_display = (
        'pk',
        'name',
    )
    ordering = (
        'id',
    )
# Register your models here.
admin.site.register(Category, CategoryAdmin)
admin.site.register(SubCategory, SubCategoryAdmin)
