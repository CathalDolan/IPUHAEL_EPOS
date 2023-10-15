# Generated by Django 4.2.4 on 2023-10-03 01:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('index', '0007_softdrink'),
    ]

    operations = [
        migrations.CreateModel(
            name='HotNonAlcoholic',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(max_length=100)),
                ('name', models.CharField(max_length=100)),
                ('price_regular', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
            ],
        ),
    ]