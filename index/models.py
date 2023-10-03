from django.db import models


class Draught(models.Model):
    category = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
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


class HalfAndHalf(models.Model):
    category = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
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


class Shandy(models.Model):
    category = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
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


class CanAndBottle(models.Model):
    category = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    price_330 = models.DecimalField(null=True,
                                    blank=True,
                                    decimal_places=2,
                                    max_digits=5)
    price_440 = models.DecimalField(null=True,
                                    blank=True,
                                    decimal_places=2,
                                    max_digits=5)
    price_pint = models.DecimalField(null=True,
                                     blank=True,
                                     decimal_places=2,
                                     max_digits=5)


class Spirit(models.Model):
    category = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    price_single = models.DecimalField(null=True,
                                       blank=True,
                                       decimal_places=2,
                                       max_digits=5)
    price_double = models.DecimalField(null=True,
                                       blank=True,
                                       decimal_places=2,
                                       max_digits=5)
    price_bottle = models.DecimalField(null=True,
                                       blank=True,
                                       decimal_places=2,
                                       max_digits=5)


class SoftDrink(models.Model):
    category = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
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


class HotNonAlcoholic(models.Model):
    category = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    price_regular = models.DecimalField(null=True,
                                        blank=True,
                                        decimal_places=2,
                                        max_digits=5)


class HotAlcoholic(models.Model):
    """ Covers coffees and hot chocolates """
    category = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    price_regular = models.DecimalField(null=True,
                                        blank=True,
                                        decimal_places=2,
                                        max_digits=5)


class HotToddy(models.Model):
    category = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    price_regular = models.DecimalField(null=True,
                                        blank=True,
                                        decimal_places=2,
                                        max_digits=5)


class Shot(models.Model):
    category = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    price_regular = models.DecimalField(null=True,
                                        blank=True,
                                        decimal_places=2,
                                        max_digits=5)


class Food(models.Model):
    category = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    price_small = models.DecimalField(null=True,
                                      blank=True,
                                      decimal_places=2,
                                      max_digits=5)
    price_regular = models.DecimalField(null=True,
                                        blank=True,
                                        decimal_places=2,
                                        max_digits=5)
