# Generated by Django 4.2.4 on 2024-03-11 14:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('index', '0023_product_pfand'),
    ]

    operations = [
        migrations.CreateModel(
            name='Staff',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('on_duty', models.BooleanField(default=True)),
            ],
        ),
    ]
