# Generated by Django 4.2.4 on 2023-10-19 13:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('index', '0016_grandtotal_order_date'),
    ]

    operations = [
        migrations.DeleteModel(
            name='CanAndBottle',
        ),
        migrations.DeleteModel(
            name='Draught',
        ),
        migrations.DeleteModel(
            name='Food',
        ),
        migrations.DeleteModel(
            name='HalfAndHalf',
        ),
        migrations.DeleteModel(
            name='HotAlcoholic',
        ),
        migrations.DeleteModel(
            name='HotNonAlcoholic',
        ),
        migrations.DeleteModel(
            name='HotToddy',
        ),
        migrations.DeleteModel(
            name='Shandy',
        ),
        migrations.DeleteModel(
            name='Shot',
        ),
        migrations.DeleteModel(
            name='SoftDrink',
        ),
        migrations.DeleteModel(
            name='Spirit',
        ),
        migrations.AddField(
            model_name='grandtotal',
            name='payment_category',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='grandtotal',
            name='payment_method',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
