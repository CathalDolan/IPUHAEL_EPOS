from django.db import models


class Product(models.Model):
    category = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    price_default = models.DecimalField(null=True,
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
    price_330 = models.DecimalField(null=True,
                                    blank=True,
                                    decimal_places=2,
                                    max_digits=5)
    price_440 = models.DecimalField(null=True,
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
    def __str__(self):
        return self.name


class GrandTotal(models.Model):
    order_date = models.DateTimeField(null=True,
                                      blank=True,
                                      auto_now_add=True)
    number_of_products = models.IntegerField(null=True,
                                             blank=True)
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
    payment_reason = models.CharField(null=True,
                                      blank=True,
                                      max_length=100)


class LineItem(models.Model):
    order_date = models.DateTimeField(null=True,
                                      blank=True,
                                      auto_now_add=True)
    grand_totals = models.ForeignKey(GrandTotal,
                                     null=False,
                                     on_delete=models.CASCADE)
    category = models.CharField(max_length=100)
    name = models.ForeignKey(Product,
                             null=False,
                             on_delete=models.PROTECT)
    quantity = models.IntegerField(null=True,
                                   blank=True)
    size = models.DecimalField(null=True,
                               blank=True,
                               decimal_places=0,
                               max_digits=5)
    price_unit = models.DecimalField(null=True,
                                     blank=True,
                                     decimal_places=2,
                                     max_digits=5)
    price_line_total = models.DecimalField(null=True,
                                           blank=True,
                                           decimal_places=2,
                                           max_digits=5)

