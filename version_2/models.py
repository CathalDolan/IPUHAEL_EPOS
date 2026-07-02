from django.db import models
from index.models import Staff
from django.utils import timezone
import uuid
from decimal import Decimal
from django.utils import timezone
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
    cloth_3xl = models.DecimalField(null=True,
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


class Receipts(models.Model):
    submission_date = models.DateTimeField(default=timezone.now)
    event = models.ForeignKey(Events,
                              null=True, 
                              blank=True, 
                              on_delete=models.SET_NULL)
    submitted_by = models.ForeignKey('index.Staff', 
                                      null=True, 
                                      blank=True, 
                                      on_delete=models.SET_NULL)
    name = models.CharField(max_length=100,
                            null=True,
                            blank=True)
    description = models.TextField(null=True,
                                   blank=True)
    value = models.DecimalField(null=True,
                                blank=True,
                                default=0,
                                decimal_places=2,
                                max_digits=9)
    image = models.ImageField(null=True,
                              blank=True)
    image_url = models.URLField(max_length=1024,
                                null=True,
                                blank=True)



class EndOfDayTakings(models.Model):
    submission_date = models.DateTimeField(default=timezone.now)
    event = models.ForeignKey(Events,
                              null=True, 
                              blank=True, 
                              on_delete=models.SET_NULL)
    trading_date = models.DateField(null=False, 
                                    blank=False, )
    submitted_by = models.ForeignKey('index.Staff', 
                                     null=False, 
                                     blank=False, 
                                     on_delete=models.PROTECT)

    # Coincounts (Integers only)
    one_cent = models.IntegerField(default=0)
    two_cent = models.IntegerField(default=0)
    five_cent = models.IntegerField(default=0)
    ten_cent = models.IntegerField(default=0)
    twenty_cent = models.IntegerField(default=0)
    fifty_cent = models.IntegerField(default=0)
    one_euro = models.IntegerField(default=0)
    two_euro = models.IntegerField(default=0)
    
    # Note counts (Integers only)
    five_euro = models.IntegerField(default=0)
    ten_euro = models.IntegerField(default=0)
    twenty_euro = models.IntegerField(default=0)
    fifty_euro = models.IntegerField(default=0)
    one_hundred_euro = models.IntegerField(default=0)
    two_hundred_euro = models.IntegerField(default=0)

    # Unified Decimal fields with safe digit ceilings (9,999,999.99)
    one_cent_value = models.DecimalField(default=0, decimal_places=2, max_digits=9)
    two_cent_value = models.DecimalField(default=0, decimal_places=2, max_digits=9)
    five_cent_value = models.DecimalField(default=0, decimal_places=2, max_digits=9)
    ten_cent_value = models.DecimalField(default=0, decimal_places=2, max_digits=9)
    twenty_cent_value = models.DecimalField(default=0, decimal_places=2, max_digits=9)
    fifty_cent_value = models.DecimalField(default=0, decimal_places=2, max_digits=9)
    one_euro_value = models.DecimalField(default=0, decimal_places=2, max_digits=9)
    two_euro_value = models.DecimalField(default=0, decimal_places=2, max_digits=9)
    five_euro_value = models.DecimalField(default=0, decimal_places=2, max_digits=9)
    ten_euro_value = models.DecimalField(default=0, decimal_places=2, max_digits=9)
    twenty_euro_value = models.DecimalField(default=0, decimal_places=2, max_digits=9)
    fifty_euro_value = models.DecimalField(default=0, decimal_places=2, max_digits=9)
    one_hundred_euro_value = models.DecimalField(default=0, decimal_places=2, max_digits=9)
    two_hundred_euro_value = models.DecimalField(default=0, decimal_places=2, max_digits=9)
    
    total_value = models.DecimalField(default=0, decimal_places=2, max_digits=9)

    # Vouchers
    two_for_one_vouchers = models.IntegerField(default=0)
    ten_for_eleven_vouchers = models.IntegerField(default=0)
    customer_20_off_vouchers = models.IntegerField(default=0)
    austeller_20_off_vouchers = models.IntegerField(default=0)
    student_discount_vouchers = models.IntegerField(default=0)
    oap_discount_vouchers = models.IntegerField(default=0)
    five_euro_off_vouchers = models.IntegerField(default=0)
    
    # receipts = models.ForeignKey('Receipts', null=True, blank=True, on_delete=models.SET_NULL)

    def save(self, *args, **kwargs):
        # Calculate sub-values dynamically
        self.one_cent_value = Decimal(self.one_cent) * Decimal('0.01')
        self.two_cent_value = Decimal(self.two_cent) * Decimal('0.02')
        self.five_cent_value = Decimal(self.five_cent) * Decimal('0.05')
        self.ten_cent_value = Decimal(self.ten_cent) * Decimal('0.10')
        self.twenty_cent_value = Decimal(self.twenty_cent) * Decimal('0.20')
        self.fifty_cent_value = Decimal(self.fifty_cent) * Decimal('0.50')
        self.one_euro_value = Decimal(self.one_euro) * Decimal('1.00')
        self.two_euro_value = Decimal(self.two_euro) * Decimal('2.00')
        self.five_euro_value = Decimal(self.five_euro) * Decimal('5.00')
        self.ten_euro_value = Decimal(self.ten_euro) * Decimal('10.00')
        self.twenty_euro_value = Decimal(self.twenty_euro) * Decimal('20.00')
        self.fifty_euro_value = Decimal(self.fifty_euro) * Decimal('50.00')
        self.one_hundred_euro_value = Decimal(self.one_hundred_euro) * Decimal('100.00')
        self.two_hundred_euro_value = Decimal(self.two_hundred_euro) * Decimal('200.00')

        # Calculate Grand Total
        self.total_value = (
            self.one_cent_value + self.two_cent_value + self.five_cent_value +
            self.ten_cent_value + self.twenty_cent_value + self.fifty_cent_value +
            self.one_euro_value + self.two_euro_value + self.five_euro_value +
            self.ten_euro_value + self.twenty_euro_value + self.fifty_euro_value +
            self.one_hundred_euro_value + self.two_hundred_euro_value
        )
        super().save(*args, **kwargs)



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

