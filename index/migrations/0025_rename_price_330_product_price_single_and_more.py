# Generated by Django 4.2.4 on 2024-03-11 19:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('index', '0024_staff'),
    ]

    operations = [
        migrations.RenameField(
            model_name='product',
            old_name='price_330',
            new_name='price_single',
        ),
        migrations.RemoveField(
            model_name='product',
            name='price_440',
        ),
    ]
