from django.db import models
from index.models import Staff
from django.utils import timezone
import uuid

# Create your models here.

class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    

class TestCategory(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class ProductSizes(models.Model):
    class Meta:
        verbose_name_plural = 'Product Sizes'
    category=models.ForeignKey(Category,
                               null=True,
                               blank=True,
                               on_delete=models.PROTECT)
    size=models.CharField(max_length=100)
    in_use = models.BooleanField(default=True)

    def __str__(self):
        return self.size


class SubCategory(models.Model):
    name = models.CharField(max_length=100)
    default_size = models.ForeignKey(ProductSizes,
                                     null=True,
                                     blank=True,
                                     on_delete=models.PROTECT)

    def __str__(self):
        return self.name


class SubSubCategory(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Events(models.Model):
    name = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    date_from = models.DateField(null=True,
                                 blank=True)
    date_to = models.DateField(null=True,
                               blank=True)
    
    def __str__(self):
        return self.name
    

class ProductV2(models.Model):
    name = models.CharField(max_length=100)
    abbr_name = models.CharField(null=True,
                                 blank=True,
                                 max_length=100)
    category = models.ForeignKey(Category,
                                 null=False,
                                 blank=False,
                                 on_delete=models.PROTECT)
    subcategory = models.ForeignKey(SubCategory,
                                    null=False,
                                    blank=False,
                                    on_delete=models.PROTECT)
    subsubcategory = models.ForeignKey(SubSubCategory,
                                    null=True,
                                    blank=True,
                                    on_delete=models.PROTECT)
    position_index = models.IntegerField(null=True,
                                         blank=True)
    in_use = models.BooleanField(default=True)
    pfand = models.BooleanField(default=True)
    summer_product = models.BooleanField(default=True)
    winter_product = models.BooleanField(default=True)
    bar_product = models.BooleanField(default=True)
    kitchen_product = models.BooleanField(default=True)
    gift_product = models.BooleanField(default=True)
    default_size = models.ForeignKey(ProductSizes,
                                     null=True,
                                     blank=True,
                                     on_delete=models.PROTECT)
    price_no_size = models.DecimalField(null=True,
                                        blank=True,
                                        decimal_places=2,
                                        max_digits=5)
    price_single = models.DecimalField(null=True,
                                       blank=True,
                                       decimal_places=2,
                                       max_digits=5)
    price_double = models.DecimalField(null=True,
                                       blank=True,
                                       decimal_places=2,
                                       max_digits=5)
    price_dash = models.DecimalField(null=True,
                                     blank=True,
                                     decimal_places=2,
                                     max_digits=5)
    price_03 = models.DecimalField(null=True,
                                   blank=True,
                                   decimal_places=2,
                                   max_digits=5)
    price_04 = models.DecimalField(null=True,
                                   blank=True,
                                   decimal_places=2,
                                   max_digits=5)
    price_pint = models.DecimalField(null=True,
                                     blank=True,
                                     decimal_places=2,
                                     max_digits=5)
    price_bottle = models.DecimalField(null=True,
                                       blank=True,
                                       decimal_places=2,
                                       max_digits=5)
    price_small = models.DecimalField(null=True,
                                      blank=True,
                                      decimal_places=2,
                                      max_digits=5)
    price_regular = models.DecimalField(null=True,
                                        blank=True,
                                        decimal_places=2,
                                        max_digits=5)
    price_large = models.DecimalField(null=True,
                                        blank=True,
                                        decimal_places=2,
                                        max_digits=5)
    cloth_xs = models.DecimalField(null=True,
                                        blank=True,
                                        decimal_places=2,
                                        max_digits=5)
    cloth_s = models.DecimalField(null=True,
                                        blank=True,
                                        decimal_places=2,
                                        max_digits=5)
    cloth_m = models.DecimalField(null=True,
                                        blank=True,
                                        decimal_places=2,
                                        max_digits=5)
    cloth_l = models.DecimalField(null=True,
                                        blank=True,
                                        decimal_places=2,
                                        max_digits=5)
    cloth_xl = models.DecimalField(null=True,
                                        blank=True,
                                        decimal_places=2,
                                        max_digits=5)
    cloth_2xl = models.DecimalField(null=True,
                                        blank=True,
                                        decimal_places=2,
                                        max_digits=5)

    def __str__(self):
        return self.name
    # def save(self, *args, **kwargs):
    #     # 1. Perform your function (e.g., remove vowels in Python)
    #     vowels = 'aeiouAEIOU'
    #     split_name = self.name.split(" ")
    #     # print(split_name)
    #     self.abbr_name = "".join([char for char in self.name if char not in vowels])
        
    #     # 2. Call the real save() method to commit to the database
    #     super().save(*args, **kwargs)

class ComplimentaryReasons(models.Model):
    class Meta:
        verbose_name_plural = 'Complimentary Reasons'
    reason=models.CharField(max_length=100)
    in_use = models.BooleanField(default=True)

    def __str__(self):
        return self.reason
    

class WasteReasons(models.Model):
    class Meta:
        verbose_name_plural = 'Waste Reasons'
    reason=models.CharField(max_length=100)
    in_use = models.BooleanField(default=True)

    def __str__(self):
        return self.reason


class GrandTotalV2(models.Model):
    transaction_number = models.UUIDField(primary_key=False,
                                          default=uuid.uuid4,
                                          editable=False,
                                          null=False,
                                          blank=False)
    order_date = models.DateTimeField(null=True,
                                      blank=True,
                                      default=timezone.now)
    number_of_products = models.IntegerField(null=True,
                                             blank=True)
    pfand_buttons_total = models.DecimalField(null=True,
                                              blank=True,
                                              decimal_places=2,
                                              max_digits=5)
    drinks_food_total = models.DecimalField(null=True,
                                            blank=True,
                                            decimal_places=2,
                                            max_digits=5)
    pfand_total = models.DecimalField(null=True,
                                      blank=True,
                                      decimal_places=2,
                                      max_digits=5)
    total_due = models.DecimalField(null=True,
                                    blank=True,
                                    decimal_places=2,
                                    max_digits=5)
    tendered_amount = models.DecimalField(null=True,
                                          blank=True,
                                          decimal_places=2,
                                          max_digits=5)
    change_due = models.DecimalField(null=True,
                                     blank=True,
                                     decimal_places=2,
                                     max_digits=5)
    payment_method = models.CharField(null=True,
                                      blank=True,
                                      max_length=100)
    discounts = models.CharField(null=True,
                                 blank=True,
                                 max_length=100)
    payment_reason = models.CharField(null=True,
                                      blank=True,
                                      max_length=100)
    staff_member = models.ForeignKey(Staff,
                                     null=True,
                                     blank=True,
                                     on_delete=models.PROTECT)  
    event = models.ForeignKey(Events,
                              null=True,
                              blank=True,
                              on_delete=models.PROTECT)
    

    def __str__(self):
        return self.transaction_number.__str__()
    # def staff_member(self):
    #     return self.staff_member

class LineItemV2(models.Model):
    transaction = models.ForeignKey(GrandTotalV2,
                                     null=False,
                                     on_delete=models.CASCADE,
                                     related_name='lineitems')
    category = models.ForeignKey(Category,
                                 null=True,
                                 blank=True,
                                 on_delete=models.PROTECT)
    subcategory = models.ForeignKey(SubCategory,
                                    null=True,
                                    blank=True,
                                    on_delete=models.PROTECT)
    subsubcategory = models.ForeignKey(SubSubCategory,
                                    null=True,
                                    blank=True,
                                    on_delete=models.PROTECT)
    name = models.CharField(max_length=100)
    quantity = models.IntegerField(null=True,
                                   blank=True)
    size = models.CharField(null=True,
                               blank=True,
                               max_length=100)
    price_unit = models.DecimalField(null=True,
                                     blank=True,
                                     decimal_places=2,
                                     max_digits=5)
    price_line_total = models.DecimalField(null=True,
                                           blank=True,
                                           decimal_places=2,
                                           max_digits=5)
    discount = models.CharField(null=True,
                                blank=True,
                                max_length=100)
    # payment_method = models.CharField(null=True,
    #                                   blank=True,
    #                                   max_length=100)
    # payment_reason = models.CharField(null=True,
    #                                   blank=True,
    #                                   max_length=100)
    # staff_member = models.ForeignKey(Staff,
    #                                  null=True,
    #                                  blank=True,
    #                                  on_delete=models.PROTECT)


class PfandBalance(models.Model):
    last_update = models.DateTimeField(null=True,
                                      blank=True,
                                      auto_now=True)
    glasses_balance = models.IntegerField(null=True,
                                      blank=True)
    pfand_balance = models.DecimalField(null=True,
                                   blank=True,
                                   decimal_places=2,
                                   max_digits=5)

