import json
import os
from django.core.management.base import BaseCommand
from version_2.models import LineItemV2

# To run:
# 1. Login to Heroku CLI
# 2. Get the production database url, run: heroku config:get DATABASE_URL --app ipuhael-epos
# 3. Temporarily change the dev env url pointer, run: $env:DATABASE_URL="YOUR_COPIED_POSTGRES_STRING_HERE"
# 4. Trigger the file writing, run: python manage.py export_detailed_items

class Command(BaseCommand):
    help = 'Exports LineItemV2 with all ForeignKey data into a structured JSON file'

    def handle(self, *args, **options):
        queryset = LineItemV2.objects.all().select_related(
            'transaction', 
            'transaction__staff_member', 
            'transaction__event',
            'category', 
            'subcategory', 
            'subsubcategory',
            'product'
        )

        new_items = []
        for item in queryset:
            tx = item.transaction
            item_data = {
                "line_item_id": item.id,
                # 🚀 THE CRITICAL FIX: Grab the direct database integer ID from your new relationship column
                "product_id": item.product_id if item.product_id else None,
                "name": item.name,
                "quantity": item.quantity,
                "size": item.size,
                "price_unit": str(item.price_unit) if item.price_unit else None,
                "price_line_total": str(item.price_line_total) if item.price_line_total else None,
                "discount": item.discount,
                "category": item.category.name if item.category else None,
                "subcategory": item.subcategory.name if item.subcategory else None,
                "subsubcategory": item.subsubcategory.name if item.subsubcategory else None,
                "transaction_uuid": str(tx.transaction_number) if tx else None,
                "order_date": tx.order_date.isoformat() if tx and tx.order_date else None,
                "payment_method": tx.payment_method if tx else None,
                "payment_reason": tx.payment_reason if tx else None,
                "transaction_total_due": str(tx.total_due) if tx and tx.total_due else None,
                "transaction_discounts": tx.discounts if tx else None,
                "staff_member": tx.staff_member.name if tx and tx.staff_member else None,
                "event_name": tx.event.name if tx and tx.event else None,
            }
            new_items.append(item_data)

        file_path = 'version_2/static/version_2/data/historical_data.json'
        existing_data = []

        # If the file already exists, read it and extract the current array
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
                    if not isinstance(existing_data, list):
                        existing_data = [] # Reset if corrupt or not an array
            except json.JSONDecodeError:
                existing_data = []

        # Merge the new items into the existing list
        existing_data.extend(new_items)

        # Overwrite the file with the newly combined single array
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, indent=2)
            
        self.stdout.write(self.style.SUCCESS(f"Successfully exported data to {file_path}"))
