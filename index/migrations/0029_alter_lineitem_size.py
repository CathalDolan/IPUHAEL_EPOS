# Generated by Django 4.2.4 on 2024-06-09 21:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('index', '0028_lineitem_payment_method_lineitem_payment_reason_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lineitem',
            name='size',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
