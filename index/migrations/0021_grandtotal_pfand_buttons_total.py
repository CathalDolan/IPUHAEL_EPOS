# Generated by Django 4.2.4 on 2023-11-16 15:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('index', '0020_rename_order_date_lineitem_order_date_li'),
    ]

    operations = [
        migrations.AddField(
            model_name='grandtotal',
            name='pfand_buttons_total',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True),
        ),
    ]