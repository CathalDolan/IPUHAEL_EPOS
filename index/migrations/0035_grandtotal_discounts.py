# Generated by Django 4.2.4 on 2024-06-18 19:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('index', '0034_product_price_jumbo'),
    ]

    operations = [
        migrations.AddField(
            model_name='grandtotal',
            name='discounts',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
