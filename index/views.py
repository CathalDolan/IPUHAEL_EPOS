from django.shortcuts import render, redirect
from . models import Product, GrandTotal, LineItem, Staff
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token, ensure_csrf_cookie
from django.http import JsonResponse
from django.contrib import messages
import json


# @ensure_csrf_cookie
def index(request):
    """ A view to return the index page """
    """https://testdriven.io/blog/django-ajax-xhr/"""
    user = request.user
    # print("user = ", user)
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    # print("is_ajax = ", is_ajax)
    if is_ajax:
        if not user.is_authenticated:
            print("User not authenticated")
            messages.warning(request, "Please log in. Try Again!")
            return JsonResponse({'status': 'Checkout Complete'}, status=200)
        elif request.method == 'POST':
            data = json.load(request)
            print("Data 0", data[0])
            print("Data 1 = ", data[1])
            print("Data 2", data[2])
            staff_member = Staff.objects.get(id=data[1]['Grand_Total']["staff_member"])
            for v in data[1].values():
                # print("v = ", v)
                new_grand_total = GrandTotal(
                    number_of_products=int(v["Total_Products_Qty"]),
                    staff_member=staff_member,
                    pfand_buttons_total=float(v["Pfand_Buttons_Total"]),
                    drinks_food_total=float(v["Line_Totals_Total"]),
                    pfand_total=float(v["Pfand_Total"]),
                    total_due=float(v["Total_Due"]),
                    tendered_amount=float(v["Amount_Tendered"]),
                    change_due=float(v["Change_Due"]),
                    discounts=v["Discounts"],
                    payment_method=v["Payment_Method"],
                    payment_reason=v["payment_reason"],
                )
                new_grand_total.save()
            discount = data[2]
            # print("discount = ", discount)
            # print("discount_type = ", discount[0])
            for k, v in data[0].items():
                for x in v:
                    # print("x = ", x)
                    if x['qty'] != 0:
                        # product = Product.objects.get(name=x["name"])
                        new_line_items = LineItem(
                            grand_totals=new_grand_total,
                            category=x["category"],
                            name=x["name"],
                            quantity=int(x["qty"]),
                            size=x["size"],
                            price_unit=float(x["price"]),
                            price_line_total=float(x["line_total"]),
                            discount=x['discount_applied'],
                            payment_method=data[1]['Grand_Total']['Payment_Method'],
                            payment_reason=data[1]['Grand_Total']["payment_reason"],
                            staff_member=staff_member,
                        )
                        new_line_items.save()
            for k, v in data[2].items():
                print("discount product = ", v)
                for x in v:
                    # print("x['name'] = ", x['name'])
                    if x['name'] != 'Applied' and x['name'] != 'Invalid':
                        # product = Product.objects.get(name=x['name'])
                        new_line_items = LineItem(
                            grand_totals=new_grand_total,
                            category=x["category"],
                            name=x["name"],
                            quantity=int(x["qty"]),
                            size=x["size"],
                            price_unit=0,
                            price_line_total=0,
                            discount=x['discount_applied'],
                            payment_method=data[1]['Grand_Total']['Payment_Method'],
                            payment_reason=data[1]['Grand_Total']["payment_reason"],
                            staff_member=staff_member,
                        )
                        new_line_items.save()
        
            messages.success(request, "Transaction Complete!")
            return JsonResponse({'status': 'Checkout Complete'}, status=200)

        messages.error(request, "Problem. Try Again!")
        return JsonResponse({'status': 'Checkout Failed'}, status=400)
    # else:
    #     return HttpResponseBadRequest('Invalid request')

    draughts = Product.objects.all().filter(category="draught").exclude(summer_product=False)
    half_n_halfs = Product.objects.all().filter(category="half_n_half").exclude(summer_product=False)
    shandys = Product.objects.all().filter(category="shandy").exclude(summer_product=False)
    canandbottles = Product.objects.all().filter(category="cans_and_bottles").exclude(summer_product=False)
    spirits = Product.objects.all().filter(category="spirits_and_liquers").order_by("pk").exclude(summer_product=False)
    softdrinks = Product.objects.all().filter(category="softdrinks").exclude(summer_product=False)
    hotnonalcoholics = Product.objects.all().filter(category="hot_nonalcoholics").exclude(summer_product=False)
    hotalcoholics = Product.objects.all().filter(category="hot_alcoholics").exclude(summer_product=False)
    hottoddys = Product.objects.all().filter(category="hot_toddys").exclude(summer_product=False)
    shots = Product.objects.all().filter(category="shots").exclude(summer_product=False)
    cocktails = Product.objects.all().filter(category="cocktails").exclude(summer_product=False)
    foods = Product.objects.all().filter(category="food").exclude(summer_product=False)
    gifts = Product.objects.all().filter(category="gift").exclude(summer_product=False)
    staff = Staff.objects.all().filter(on_duty=True).order_by("name")
    
    context = {
        'draughts': draughts,
        'half_n_halfs': half_n_halfs,
        'shandys': shandys,
        'canandbottles': canandbottles,
        'spirits': spirits,
        'softdrinks': softdrinks,
        'hotnonalcoholics': hotnonalcoholics,
        'hotalcoholics': hotalcoholics,
        'hottoddys': hottoddys,
        'shots': shots,
        'cocktails': cocktails,
        'foods': foods,
        'gifts': gifts,
        'staff': staff,
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
