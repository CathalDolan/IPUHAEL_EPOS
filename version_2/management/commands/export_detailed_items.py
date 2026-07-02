import json
from django.core.management.base import BaseCommand
from version_2.models import LineItemV2

class Command(BaseCommand):
    help = 'Exports LineItemV2 with all ForeignKey data into a structured JSON file'

    def handle(self, *args, **options):
        # FIXED: Changed 'transaction__staff' to 'transaction__staff_member'
        queryset = LineItemV2.objects.all().select_related(
            'transaction', 
            'transaction__staff_member', 
            'transaction__event',
            'category', 
            'subcategory', 
            'subsubcategory'
        )

        exported_list = []

        for item in queryset:
            tx = item.transaction
            
            item_data = {
                # 1. Line Item Fields
                "line_item_id": item.id,
                "name": item.name,
                "quantity": item.quantity,
                "size": item.size,
                "price_unit": str(item.price_unit) if item.price_unit else None,
                "price_line_total": str(item.price_line_total) if item.price_line_total else None,
                "discount": item.discount,
                
                # 2. Category & Hierarchical Metadata
                "category": item.category.name if item.category else None,
                "subcategory": item.subcategory.name if item.subcategory else None,
                "subsubcategory": item.subsubcategory.name if item.subsubcategory else None,
                
                # 3. Parent Transaction Data (GrandTotalV2 details)
                "transaction_uuid": str(tx.transaction_number) if tx else None,
                "order_date": tx.order_date.isoformat() if tx and tx.order_date else None,
                "payment_method": tx.payment_method if tx else None,
                "payment_reason": tx.payment_reason if tx else None,
                "transaction_total_due": str(tx.total_due) if tx and tx.total_due else None,
                "transaction_discounts": tx.discounts if tx else None,
                
                # 4. Indirect Relations (FIXED: tx.staff_member)
                "staff_member": tx.staff_member.name if tx and tx.staff_member else None,
                "event_name": tx.event.name if tx and tx.event else None,
            }
            exported_list.append(item_data)

        # Print the finished clean JSON string straight to console stdout
        self.stdout.write(json.dumps(exported_list, indent=2))
