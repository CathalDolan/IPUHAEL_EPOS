from django.shortcuts import render, redirect, reverse
from django.contrib.auth.decorators import login_required
from . models import Product, GrandTotal, LineItem, Staff
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token, ensure_csrf_cookie
from django.http import JsonResponse
from django.contrib import messages
import json
from datetime import datetime, timedelta
import copy

# @ensure_csrf_cookie
# @login_required
def index(request):
    """ A view to return the index page """
    """https://testdriven.io/blog/django-ajax-xhr/"""
    user = request.user
    # print("user = ", user)
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    # print("is_ajax = ", is_ajax)
    if is_ajax:
        if not user.is_authenticated:
            # print("User not authenticated")
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

    draughts = Product.objects.all().filter(category="draught").exclude(in_use=False).exclude(summer_product=False)
    half_n_halfs = Product.objects.all().filter(category="half_n_half").exclude(in_use=False).exclude(summer_product=False)
    shandys = Product.objects.all().filter(category="shandy").exclude(in_use=False).exclude(summer_product=False)
    canandbottles = Product.objects.all().filter(category="cans_and_bottles").exclude(in_use=False).exclude(summer_product=False)
    spirits = Product.objects.all().filter(category="spirits_and_liquers").exclude(in_use=False).exclude(summer_product=False).order_by("pk")
    softdrinks = Product.objects.all().filter(category="softdrinks").exclude(in_use=False).exclude(summer_product=False)
    hotnonalcoholics = Product.objects.all().filter(category="hot_nonalcoholics").exclude(in_use=False).exclude(summer_product=False)
    hotalcoholics = Product.objects.all().filter(category="hot_alcoholics").exclude(in_use=False).exclude(summer_product=False)
    hottoddys = Product.objects.all().filter(category="hot_toddys").exclude(in_use=False).exclude(summer_product=False)
    shots = Product.objects.all().filter(category="shots").exclude(in_use=False).exclude(summer_product=False)
    cocktails = Product.objects.all().filter(category="cocktails").exclude(in_use=False).exclude(summer_product=False)
    foods = Product.objects.all().filter(category="food").exclude(in_use=False).exclude(summer_product=False)
    food_extra_cheese = Product.objects.all().filter(category="food_extra_cheese").exclude(in_use=False).exclude(summer_product=False)
    food_extra_meat = Product.objects.all().filter(category="food_extra_meat").exclude(in_use=False).exclude(summer_product=False)
    food_extra_sauce = Product.objects.all().filter(category="food_extra_sauce").exclude(in_use=False).exclude(summer_product=False)
    food_extra_veg = Product.objects.all().filter(category="food_extra_veg").exclude(in_use=False).exclude(summer_product=False)
    gifts = Product.objects.all().filter(category="gifts").exclude(in_use=False).exclude(summer_product=False).order_by('name')
    gifts_caps = Product.objects.all().filter(category="gifts_caps").exclude(in_use=False).exclude(summer_product=False).order_by('name')
    gifts_decoration = Product.objects.all().filter(category="gifts_decoration").exclude(in_use=False).exclude(summer_product=False).order_by('name')
    gifts_food = Product.objects.all().filter(category="gifts_food").exclude(in_use=False).exclude(summer_product=False).order_by('name')
    gifts_glasses = Product.objects.all().filter(category="gifts_glasses").exclude(in_use=False).exclude(summer_product=False).order_by('name')
    gifts_magnets = Product.objects.all().filter(category="gifts_magnets").exclude(in_use=False).exclude(summer_product=False).order_by('name')
    gifts_small = Product.objects.all().filter(category="gifts_small").exclude(in_use=False).exclude(summer_product=False).order_by('name')
    gifts_medium = Product.objects.all().filter(category="gifts_medium").exclude(in_use=False).exclude(summer_product=False).order_by('name')
    gifts_sweats = Product.objects.all().filter(category="gifts_sweats").exclude(in_use=False).exclude(summer_product=False).order_by('name')
    gifts_tshirts = Product.objects.all().filter(category="gifts_tshirts").exclude(in_use=False).exclude(summer_product=False).order_by('name')
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
        'food_extra_cheese': food_extra_cheese,
        'food_extra_sauce': food_extra_sauce,
        'food_extra_meat': food_extra_meat,
        'food_extra_veg': food_extra_veg,
        'gifts': gifts,
        'gifts_caps': gifts_caps,
        'gifts_decoration': gifts_decoration,
        'gifts_food': gifts_food,
        'gifts_glasses': gifts_glasses,
        'gifts_magnets': gifts_magnets,
        'gifts_small': gifts_small,
        'gifts_medium': gifts_medium,
        'gifts_sweats': gifts_sweats,
        'gifts_tshirts': gifts_tshirts,
        'staff': staff,
    }
    template = 'index/index.html'
    # print("Index View print")
    return render(request, template, context)


def past_orders(request):
    print("PAST_ORDERS!!")
    """ A view to return the past orders page """
    if request.GET:
        print("YES GET")
        day = int(request.GET['day'])
        month = int(request.GET['month'])+1
        year = int(request.GET['year'])
        day_from = datetime(year, month, day)
        day_to = day_from + timedelta(days=1)

        orders = LineItem.objects.filter(order_date_li__gte=day_from).filter(order_date_li__lte=day_to).order_by('-order_date_li').values(
            'grand_totals_id',
            'order_date_li',
            'staff_member_id',
            'staff_member_id__name',
            'grand_totals_id__pfand_total',
            'grand_totals_id__drinks_food_total',
            'grand_totals_id__total_due',
            'grand_totals_id__tendered_amount',
            'grand_totals_id__change_due',
            'grand_totals_id__payment_method',
            'grand_totals_id__payment_reason',
            'discount',
            'grand_totals_id__number_of_products',
            'name',
            'quantity',
            'size',
            'price_unit',
            'price_line_total'
        )
        
        
        staff_list = [{'staffId': 0, 'name': 'All'}]
        for order in orders:
            # print("order = ", order['grand_totals_id__payment_reason'])
            if not any(item['staffId'] == order['staff_member_id'] for item in staff_list):
                staff_list.append({
                    "staffId": order['staff_member_id'],
                    "name": order['staff_member_id__name']
            })
            # Temp code to remove null values in payment_reason
            if order['grand_totals_id__payment_reason'] is None:
                order['grand_totals_id__payment_reason'] = ''
        # print("staff_list = ", staff_list)
        staffId = request.GET['staffId']
        # print("staffId = ", staffId)
        if request.GET['staffId'] != '0':
            # print("NOT ALL")
            staffId = request.GET['staffId']
            orders = orders.filter(staff_member=staffId)
        return JsonResponse({"orders": list(orders),
                             'staff_list': staff_list},
                            safe=False)
    else:
        today = datetime.now()
        day_from = today.strftime("%Y-%m-%d")
        day_to = today + timedelta(days=1)
        orders = LineItem.objects.filter(order_date_li__gte=day_from).filter(order_date_li__lte=day_to).order_by('-order_date_li')
        staff_list = [{'staffId': 0, 'name': 'All'}]
        for order in orders: 
            # print("order = ", order.payment_reason)
            if not any(item['staffId'] == order.staff_member_id for item in staff_list):
                staff_list.append({
                    "staffId": order.staff_member_id,
                    "name": order.staff_member
                })
            
        print("staff_list = ", staff_list)
        context = {
            'orders': orders,
            'staff_list': staff_list
        }
        template = 'index/past_orders.html'
        return render(request, template, context)


def test_page(request):
    """ A view to return the past orders page """
    print("test_page")
    date_from = datetime(2025, 6, 22)
    date_to = date_from + timedelta(days=1)
    orders = LineItem.objects.all().values(
            'grand_totals_id',
            'order_date_li',
            'staff_member_id',
            'staff_member_id__name',
            'grand_totals_id__pfand_total',
            'grand_totals_id__drinks_food_total',
            'grand_totals_id__total_due',
            'grand_totals_id__tendered_amount',
            'grand_totals_id__change_due',
            'grand_totals_id__payment_method',
            'grand_totals_id__payment_reason',
            'discount',
            'grand_totals_id__number_of_products',
            'name',
            'quantity',
            'size',
            'price_unit',
            'price_line_total'
        )
    # item = makeOrderDict('order', 'id')
    # print("item = ", item)
    grandTotals = GrandTotal.objects.all()
    prev_date = ''
    previous_order = ''
    current_items = []
    prev_items = []
    duplicate_orders = []
    for i, order in enumerate(grandTotals):
        lineItems = LineItem.objects.filter(grand_totals_id=order.id).values(
            'name',
            'quantity',
            'size',
            'price_unit',
            'price_line_total')

        # print("lineItems = ", lineItems)
        for item in lineItems:
            print("item = ", item)
            current_items.append(
                {'name': item["name"],
                'quantity': item['quantity'],
                'size': item['size'],
                'price_unit': item['price_unit'],
                'price_line_total': item['price_line_total']})
        if i > 0:
            if order.order_date.strftime("%y-%m-%d %H:%M:%S") == prev_date and prev_items == current_items and order.staff_member == previous_order.staff_member and order.number_of_products == previous_order.number_of_products and order.pfand_buttons_total == previous_order.pfand_buttons_total and order.drinks_food_total == previous_order.drinks_food_total and order.pfand_total == previous_order.pfand_total and order.total_due == previous_order.total_due and order.tendered_amount == previous_order.tendered_amount and order.payment_method == previous_order.payment_method:
                # print("YES SAME DATETIME")
                duplicate_first_order = makeOrderDict(order, current_items)
                duplicate_orders.append(duplicate_first_order)
                duplicate_second_order = makeOrderDict(previous_order, prev_items)
                duplicate_orders.append(duplicate_second_order)
        prev_items = current_items
        previous_order = order
        current_items = []
        prev_date = (order.order_date).strftime("%y-%m-%d %H:%M:%S")
    
    duplicate_orders = sorted(duplicate_orders, key=lambda d: d['id'], reverse=True)
    # for order in duplicate_orders:
    #     print("duplicate_orders = ", order)
    context = {
        "orders": duplicate_orders
    }
      
    return render(request, 'index/test_page.html', context)


def makeOrderDict(order, items):
    order = {
        'id': order.id,
        'date': order.order_date,
        'staff_member': order.staff_member,
        'pfand_total': order.pfand_total,
        'drinks_food_total': order.drinks_food_total,
        'total_due': order.total_due,
        'tendered_amount': order.tendered_amount,
        'change_due': order.change_due,
        'payment_method': order.payment_method,
        'payment_reason': order.payment_reason,
        'discounts': order.discounts,
        'number_of_products': order.number_of_products,
        'items': items
    }
    return order
    

@login_required
def reports(request):
    """ A view to return the past orders page """ 
    print("NOW = ", datetime.now())
    entries = LineItem.objects.all().values(
        'grand_totals_id',
        'order_date_li',
        'grand_totals',
        'category',
        'name',
        'quantity',
        'size',
        'price_unit',
        'price_line_total',
        'discount',
        'grand_totals_id__payment_method',
        'payment_reason',
        'staff_member__name'
    )
    staff = []
    categories = []
    drinks = []
    food = []
    gifts = []
    sizes = []
    payment = []
    for entry in entries:
        if not entry["staff_member__name"] in staff:
            staff.append(entry["staff_member__name"])
        if not entry["category"] in categories:
            categories.append(entry["category"])
        if not entry["name"] in drinks and not entry["category"] == "food" and not entry["category"] == "gifts":
            drinks.append(entry["name"])
        if entry["category"] == "food" and not entry["name"] in food:
            food.append(entry["name"])
        if entry["category"] == "gifts" and not entry["name"] in gifts:
            gifts.append(entry["name"])
        if not entry["size"] in sizes:
            sizes.append(entry["size"])
        if not entry["grand_totals_id__payment_method"] in payment:
            payment.append(entry["grand_totals_id__payment_method"])
    staff.sort()
    categories.sort()
    drinks.sort()
    food.sort()
    gifts.sort()
    sizes.sort()
    payment.sort()
    # earliest_date = entries.earliest('order_date_li')
    # latest_date = entries.latest('order_date_li')
    date_now = datetime.now()
    date_yesterday = datetime.now() + timedelta(days=-1)

    if request.GET:
        print("YES GET")
        from_date = datetime.strptime(request.GET['from_date'], "%a, %d %b %Y %H:%M:%S %Z")
        to_date = datetime.strptime(request.GET['to_date'], "%a, %d %b %Y %H:%M:%S %Z")
        print("from_date = ", from_date) 
        print("to_date = ", to_date) 
        entries = entries.filter(order_date_li__range=(from_date, to_date))
        print("entries = ", entries.count())
        return JsonResponse({"orders": list(entries)},
                            safe=False)
        
    else:
        latest_entry = LineItem.objects.latest('order_date_li')
        latest_date = latest_entry.order_date_li
        # print("latest_date = ", latest_date)
        if latest_date.hour < 10:
            from_date = latest_date.replace(hour=10, minute=00, second=00) + timedelta(-1)
            to_date = latest_date.replace(hour=2, minute=00, second=00)
            # print("from_date = ", from_date)
            # print("to_date = ", to_date) 
        else:
            from_date = latest_date.replace(hour=10, minute=00, second=00)  
            to_date = latest_date.replace(hour=2, minute=00, second=00) + timedelta(1)
            # print("from_date = ", from_date)
            # print("to_date = ", to_date)
        entries = entries.filter(order_date_li__range=(from_date, to_date))
        
        context = {
            "data": list(entries),
            "staff": staff,
            "categories": categories,
            "drinks": drinks,
            "food": food,
            "gifts": gifts,
            "sizes": sizes,
            "payment": payment,
            "earliest_date": from_date,
            "latest_date": to_date,
            "date_now": date_now,
            "date_yesterday": date_yesterday
        }
        return render(request, 'index/reports.html', context)

def generate_report(request):
    print("generate_report")
    entries = LineItem.objects.all().values(
        'order_date_li',
        'grand_totals',
        'category',
        'name',
        'quantity',
        'size',
        'price_unit',
        'price_line_total',
        'discount',
        'payment_method',
        'payment_reason',
        'staff_member__name'
    )
    # print("entries = ", entries)
    return JsonResponse(list(entries),
                        safe=False)
