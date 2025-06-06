from django.db import models


class Staff(models.Model):
    name = models.CharField(max_length=100)
    on_duty = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    abbr_name = models.CharField(null=True,
                                 blank=True,
                                 max_length=100)
    in_use = models.BooleanField(default=True)
    pfand = models.BooleanField(default=True)
    summer_product = models.BooleanField(default=True)
    winter_product = models.BooleanField(default=True)
    bar_product = models.BooleanField(default=True)
    kitchen_product = models.BooleanField(default=True)
    price_default = models.DecimalField(null=True,
                                        blank=True,
                                        decimal_places=2,
                                        max_digits=5)
    price_sgle = models.DecimalField(null=True,
                                       blank=True,
                                       decimal_places=2,
                                       max_digits=5)
    price_dble = models.DecimalField(null=True,
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
    price_btle = models.DecimalField(null=True,
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
    price_jumbo = models.DecimalField(null=True,
                                        blank=True,
                                        decimal_places=2,
                                        max_digits=5)

    def __str__(self):
        return self.name


class GrandTotal(models.Model):
    order_date = models.DateTimeField(null=True,
                                      blank=True,
                                      auto_now_add=True)
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


class LineItem(models.Model):
    order_date_li = models.DateTimeField(null=True,
                                      blank=True,
                                      auto_now_add=True)
    grand_totals = models.ForeignKey(GrandTotal,
                                     null=False,
                                     on_delete=models.CASCADE)
    category = models.CharField(max_length=100)
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
    payment_method = models.CharField(null=True,
                                      blank=True,
                                      max_length=100)
    payment_reason = models.CharField(null=True,
                                      blank=True,
                                      max_length=100)
    staff_member = models.ForeignKey(Staff,
                                     null=True,
                                     blank=True,
                                     on_delete=models.PROTECT)
