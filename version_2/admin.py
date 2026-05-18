from django.contrib import admin
from .models import Category, SubCategory, SubSubCategory, Events, ProductV2, ComplimentaryReasons, WasteReasons, GrandTotalV2, LineItemV2, PfandBalance, ProductSizes
from import_export.admin import ExportActionMixin
from import_export.admin import ImportExportModelAdmin
from import_export import resources
from import_export.fields import Field


class CategoryAdmin(ExportActionMixin, admin.ModelAdmin):
    list_display = (
        'pk',
        'name',
    )
    ordering = (
        'id',
    )


class SubCategoryAdmin(ExportActionMixin, admin.ModelAdmin):
    list_display = (
        'pk',
        'name',
        'default_size',
    )
    ordering = (
        'id',
    )


class SubSubCategoryAdmin(ExportActionMixin, admin.ModelAdmin):
    list_display = (
        'pk',
        'name',
    )
    ordering = (
        'id',
    )

class EventsAdmin(admin.ModelAdmin):
    list_display = (
        'pk',
        'name',
        'city',
        'date_from',
        'date_to',
    )
    ordering = (
        'date_from',
    )


class ProductSizesAdmin(admin.ModelAdmin):
    list_display = (
        'pk',
        'size',
        'category',
        'in_use',
    )
    ordering = (
        'id',
    )


class ComplimentaryReasonsAdmin(admin.ModelAdmin):
    list_display = (
        'pk',
        'reason',
        'in_use',
    )
    ordering = (
        'id',
    )

class WasteReasonsAdmin(admin.ModelAdmin):
    list_display = (
        'pk',
        'reason',
        'in_use',
    )
    ordering = (
        'id',
    )

class ProductV2Admin(ExportActionMixin, admin.ModelAdmin):
    list_display = (
        'pk',
        'name',
        'abbr_name',
        'category',
        'subcategory',
        'subsubcategory',
        'position_index',
        'in_use',
        'pfand',
        'default_size',
        'price_no_size',
        'price_single',
        'price_double',
        'price_dash',
        'price_03',
        'price_04',
        'price_pint',
        'price_bottle',
        'price_small',
        'price_regular',
        'price_large',
        'cloth_xs',
        'cloth_s',
        'cloth_m',
        'cloth_l',
        'cloth_xl',
        'cloth_2xl',
        'summer_product',
        'winter_product',
        'bar_product',
        'kitchen_product',
        'gift_product',
        
    )
    ordering = (
        'id',
    )


class GrandTotalV2Admin(ExportActionMixin, admin.ModelAdmin):
    list_display = (
        'transaction_number',
        'order_date',
        'number_of_products',
        'pfand_buttons_total',
        'drinks_food_total',
        'pfand_total',
        'total_due',
        'tendered_amount',
        'change_due',
        'payment_method',
        'discounts',
        'payment_reason',
        'staff_member',
        'event',
    )
   

class LineItemV2Resource(resources.ModelResource):
    transaction_number = Field(attribute="transaction__transaction_number", column_name="TRANSACTION NUMBER")
    order_date = Field(attribute="transaction__order_date", column_name="ORDER DATE")
    staff_member = Field(attribute="transaction__staff_member__name", column_name="STAFF MEMBER")
    category = Field(attribute="category__name", column_name="CATEGORY")
    subcategory = Field(attribute="subcategory__name", column_name="SUBCATEGORY")
    name = Field(attribute="name", column_name="NAME")
    quantity = Field(attribute="quantity", column_name="QUANTITY")
    size = Field(attribute="size", column_name="SIZE")
    price_unit = Field(attribute="price_unit", column_name="PRICE PER UNIT")
    price_line_total = Field(attribute="price_line_total", column_name="LINE TOTAL")
    payment_method = Field(attribute="transaction__payment_method", column_name="PAYMENT METHOD")
    payment_reason = Field(attribute="transaction__payment_reason", column_name="PAYMENT REASON")
    discount = Field(attribute="discount", column_name="DISCOUNT")
    class Meta:
        model = LineItemV2
        fields = (
            'transaction_number',
            'order_date',
            'staff_member',
            'category',
            'subcategory',
            'subsubcategory',
            'name',
            'quantity',
            'size',
            'price_unit',
            'price_line_total',
            'discount',
            'payment_method',
            'payment_reason',
            )
    

class LineItemV2Admin(ExportActionMixin, admin.ModelAdmin):
    resource_class = LineItemV2Resource
    # readonly_fields = ('display_uuid',)
    list_display = (
        # 'display_uuid',
        'transaction',
        'order_date',
        'staff_member',
        'category',
        'subcategory',
        'subsubcategory',
        'name',
        'quantity',
        'size',
        'price_unit',
        'price_line_total',
        'discount',
        'payment_method',
        'payment_reason',
    )
    def order_date(self, obj):
        return obj.transaction.order_date
    
    def staff_member(self, obj):
        return obj.transaction.staff_member
    
    def payment_method(self, obj):
        return obj.transaction.payment_method
    
    def payment_reason(self, obj):
        return obj.transaction.payment_reason

class PfandBalanceAdmin(admin.ModelAdmin):
    list_display = (
        'pk',
        'last_update',
        'glasses_balance',
        'pfand_balance',
    )


# Register your models here.
admin.site.register(Category, CategoryAdmin)
admin.site.register(SubCategory, SubCategoryAdmin)
admin.site.register(SubSubCategory, SubSubCategoryAdmin)
admin.site.register(Events, EventsAdmin)
admin.site.register(ProductSizes, ProductSizesAdmin)
admin.site.register(ComplimentaryReasons, ComplimentaryReasonsAdmin)
admin.site.register(WasteReasons, WasteReasonsAdmin)
admin.site.register(ProductV2, ProductV2Admin)
admin.site.register(GrandTotalV2, GrandTotalV2Admin)
admin.site.register(LineItemV2, LineItemV2Admin)
admin.site.register(PfandBalance, PfandBalanceAdmin)
