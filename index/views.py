from django.shortcuts import render, redirect
from . models import Product, GrandTotal, LineItem
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token, ensure_csrf_cookie
from django.http import JsonResponse
from django.contrib import messages
import json


@ensure_csrf_cookie
def index(request):
    """ A view to return the index page """
    """https://testdriven.io/blog/django-ajax-xhr/"""
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if is_ajax:
        if request.method == 'POST':
            data = json.load(request)
            print("Data", data)
            for v in data[1].values():
                new_grand_total = GrandTotal(
                    number_of_products=int(v["Total_Products_Qty"]),
                    pfand_buttons_total=float(v["Pfand_Buttons_Total"]),
                    drinks_food_total=float(v["Line_Totals_Total"]),
                    pfand_total=float(v["Pfand_Total"]),
                    total_due=float(v["Total_Due"]),
                    tendered_amount=float(v["Amount_Tendered"]),
                    change_due=float(v["Change_Due"]),
                    payment_method=v["Payment_Method"],
                    payment_reason=v["payment_reason"],
                )
                new_grand_total.save()

            for k, v in data[0].items():
                for x in v:
                    print("x = ", x)
                    product = Product.objects.get(name=x["name"])
                    new_line_items = LineItem(
                        grand_totals=new_grand_total,
                        category=x["category"],
                        name=product,
                        quantity=int(x["qty"]),
                        # size=int(x[""]), needed in phase 2
                        price_unit=float(x["price"]),
                        price_line_total=float(x["line_total"]),
                    )
                    new_line_items.save()
            messages.success(request, "Transaction Complete!")
            return JsonResponse({'status': 'Checkout Complete'}, status=200)
        messages.error(request, "Problem. Try Again!")
        return JsonResponse({'status': 'Checkout Failed'}, status=400)
    # else:
    #     return HttpResponseBadRequest('Invalid request')

    draughts = Product.objects.all().filter(category="draught")
    halfandhalfs = Product.objects.all().filter(category="halfandhalfs")
    shandys = Product.objects.all().filter(category="shandys")
    canandbottles = Product.objects.all().filter(category="cans_and_bottles")
    spirits = Product.objects.all().filter(category="spirits_and_liquers").order_by("pk")
    softdrinks = Product.objects.all().filter(category="softdrinks")
    hotnonalcoholics = Product.objects.all().filter(category="hot_nonalcoholics")
    hotalcoholics = Product.objects.all().filter(category="hot_alcoholics")
    hottoddys = Product.objects.all().filter(category="hot_toddys")
    shots = Product.objects.all().filter(category="shots")
    foods = Product.objects.all().filter(category="food")
    
    context = {
        'draughts': draughts,
        'halfandhalfs': halfandhalfs,
        'shandys': shandys,
        'canandbottles': canandbottles,
        'spirits': spirits,
        'softdrinks': softdrinks,
        'hotnonalcoholics': hotnonalcoholics,
        'hotalcoholics': hotalcoholics,
        'hottoddys': hottoddys,
        'shots': shots,
        'foods': foods,
    }
    template = 'index/index.html'
    # print("Index View print")
    return render(request, template, context)


# def add_to_basket(request, item_id):

#     quantity = int(request.POST.get('quantity'))
#     redirect_url = request.POST.get('redirect_url')
#     basket = request.session.get('basket', {})

#     if item_id in list(basket.keys()):
#         basket[item_id] += quantity
#     else:
#         basket[item_id] = quantity

#     request.session['basket'] = basket
#     print(request.session['basket'])
#     return redirect(redirect_url)


def past_orders(request):
    """ A view to return the past orders page """
    return render(request, 'index/past_orders.html')


def takings(request):
    """ A view to return the past orders page """
    return render(request, 'index/takings.html')


def reports(request):
    """ A view to return the past orders page """
    return render(request, 'index/reports.html')
