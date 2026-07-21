from django.core.management.base import BaseCommand
from django.db import transaction
from version_2.models import LineItemV2, ProductV2

class Command(BaseCommand):
    help = 'Mass updates LineItemV2 product field with a name-equal-to-subcategory fallback rule'

    def handle(self, *args, **options):
        self.stdout.write("Fetching records from database...")
        
        # 1. Main Lookup Map: Maps lowercase product names to their objects
        # e.g., {"draught": <ProductV2: Draught>, "guinness": <ProductV2: Guinness>}
        product_map = {p.name.strip().lower(): p for p in ProductV2.objects.all()}
        # print("product_map = ", product_map)
        
        line_items = LineItemV2.objects.all()
        updated_items = []

        self.stdout.write(f"Processing {line_items.count()} line items...")

        with transaction.atomic():
            for line_item in line_items:
                # Standardize strings to lowercase to ensure spelling/casing matches perfectly
                item_name = line_item.name.strip().lower() if line_item.name else ""
                
                # Rule 1: Find product with a name equal to the line_item name
                product_object = product_map.get(item_name, None)
                
                # Rule 2 (🚀 FALLBACK): Find product with a name equal to the line_item subcategory
                if not product_object and line_item.subcategory:
                    sub_field = line_item.subcategory
                    # Extract the string name text from the ForeignKey subcategory model
                    sub_name = sub_field.name.strip().lower().replace('_', ' ') if hasattr(sub_field, 'name') else str(sub_field).strip().lower()
                    print("sub_name = ", sub_name)
                    # 🚀 Look up the product using the subcategory string name text as the key!
                    product_object = product_map.get(sub_name, None)
                    print("product_object = ", product_object)

                # Assign the matched product object (or None if both routes fail)
                line_item.product = product_object
                updated_items.append(line_item)

            # 3. Mass update all rows at once in chunks
            if updated_items:
                self.stdout.write("Saving changes to database in batches...")
                LineItemV2.objects.bulk_update(updated_items, ['product'], batch_size=1000)

        self.stdout.write(self.style.SUCCESS("Successfully linked all product IDs via subcategory-to-name fallback routing!"))