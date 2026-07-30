from django.core.management.base import BaseCommand
from django.db import transaction
from version_2.models import LineItemV2, GrandTotalV2

class Command(BaseCommand):
    help = 'Gathering Grand Totals to delete.'

    def handle(self, *args, **options):
        all_grand_totals = GrandTotalV2.objects.all()
        print("all_grand_totals = ", all_grand_totals)
        all_grand_totals.delete()