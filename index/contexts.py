

def basket_contents(request):

    basket_items = []
    drinks_total = 0
    pfand_total = 0
    total_due = 0
    amount_tendered = 0
    change_due = 0

    context = {
        'basket_items': basket_items,
        'drinks_total': drinks_total,
        'pfand_total': pfand_total,
        'total_due': total_due,
        'amount_tendered': amount_tendered,
        'change_due': change_due,
    }

    return context
