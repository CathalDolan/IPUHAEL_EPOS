from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib import messages
from index.models import Staff
from . models import ProductV2, ProductSizes, ComplimentaryReasons, WasteReasons, GrandTotalV2, PfandBalance, LineItemV2, Category, SubCategory, SubSubCategory, Events, Receipts
import json
from decimal import Decimal
from datetime import datetime, date, time, timedelta
from django.utils import timezone
import pandas as pd
import io
from uuid import UUID
from django.http import HttpResponse

from django.core.mail import send_mail
from django.conf import settings

from django.forms import modelformset_factory
from .forms import EndOfDayTakingsForm, ReceiptsForm

from django.core.mail import EmailMessage  # Import email engine
from django.template.loader import render_to_string  # Import template string generator

from django.db.models import F, Sum, Count, Case, When, DecimalField, ExpressionWrapper

import os

def bulk_edit_items(request):
    # Automatically get all field names except the auto-incrementing ID
    all_fields = [f.name for f in ProductV2._meta.fields if f.name != 'id']
    
    # Pass the dynamic list into the formset factory
    ItemFormSet = modelformset_factory(ProductV2, fields=all_fields, extra=1)
    
    # 2. Get the sorting parameter from the URL (default to 'name')
    order_by = request.GET.get('order_by', 'name')
    print("request!!1", request.GET.get('order_by', 'name'))
    # 3. Map URL triggers to specific related field names
    sort_mapping = {
        'name': 'name',
        '-name': '-name',
        'category': 'category__name',
        '-category': '-category__name',
        'subcategory': 'subcategory__name',
        '-subcategory': '-subcategory__name',
        'subsubcategory': 'subsubcategory__name',
        '-subsubcategory': '-subsubcategory__name',
    }
    db_order_field = sort_mapping.get(order_by, 'name')
    print("db_order_field", db_order_field)
    # 4. Fetch the optimized and sorted dataset
    queryset = ProductV2.objects.all().select_related(
        'category', 
        'subcategory', 
        'subsubcategory'
        ).order_by(db_order_field)
    
    if request.method == 'POST':
        # 2. Bind the submitted POST data to the formset
        formset = ItemFormSet(request.POST)
        if formset.is_valid():
            formset.save()  # Saves all changes to the database at once
            return redirect(f"{request.path}?order_by={order_by}")  # Reloads the page to show updated data
    else:
        # 3. On a GET request, pull all records into the formset
        formset = ItemFormSet(queryset=ProductV2.objects.all())
        
    return render(request, 'version_2/item_bulk_edit.html', {'formset': formset})


# Create your views here.
def index_v2(request):
    print("index_v2")
    user = request.user
    now = datetime.now()
    today = date.today()
    # print("now = ", now)
    # print("today = ", today)
    try:
        event = Events.objects.get(date_from__lte=today, date_to__gte=today)
    except Events.DoesNotExist:
        event = "event: None"
    # print(event)
    # for item in event:
    #     print(item)
    # products = ProductV2.objects.all()
    # vowels = 'aeiouAEIOU-'
    # for product in products:
    #     # print("product = ", product.name) 
    #     # if len(product.name) > 8 and len(product.name) < 25: 
    #     #     split_name = product.name.split(" ")
    #     #     print("product = ", split_name) 
    #     #     for index, item in enumerate(split_name):
    #     #         if len(item) > 8:
    #     #             split_name[index] = "".join([char for char in item if char not in vowels])
    #     #         print("item = ", item) 
    #     #     product.abbr_name = " ".join(split_name)
    #     # else:
    #     #     print("NO", len(product.name))
    #     #     product.abbr_name = product.name
    #     product.abbr_name = product.name
    #     print("product.abbr_name = ", product.abbr_name)
        
    #     # product.save()
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    # print("is_ajax = ", is_ajax)
    if is_ajax:
        print("is_ajax")
        if not user.is_authenticated:
            # print("User not authenticated")
            messages.warning(request, "Please log in. Try Again!")
            return JsonResponse({'status': 'Checkout Complete'}, status=200)
        elif request.method == 'POST':
            data = json.load(request)
            print("Data 0 = ", data[0]) # NEW_BASKET
            print("Data 1 = ", data[1]) # GRAND_TOTAL
            print("Data 2 = ", data[2]) # DISCOUNTS
            staff_member = Staff.objects.get(
            id=data[1]['Grand_Total']["staff_member"])
            for v in data[1].values():
                print("v = ", v)
                new_grand_total = GrandTotalV2(
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
                
                pfand_balance = PfandBalance.objects.all().last()
                print("pfand_balance = ", pfand_balance)
                # if pfand_balance.last_update.date() == datetime.today().date():
                #     print("ELSE")
                #     print("pfand_balance.last_update = ", pfand_balance.last_update)
                if pfand_balance == None or pfand_balance.last_update.date() != datetime.today().date():
                    print("DoesNotExist = ")
                    pfand_balance = PfandBalance(
                        glasses_balance=int(v["glasses_balance"]),
                        pfand_balance=Decimal(v["Pfand_Total"])
                    )
                else:
                    print("ELSE")
                    print("pfand_balance.last_update = ", pfand_balance.last_update)
                    pfand_balance.glasses_balance = pfand_balance.glasses_balance + int(v["glasses_balance"])
                    pfand_balance.pfand_balance = pfand_balance.pfand_balance + Decimal(v["Pfand_Total"])
                pfand_balance.save()

            for k, v in data[0].items():
                for x in v:
                    print("x = ", x)
                    if x['qty'] != 0:
                        if x['subcategory'] != 'open_drink':
                            product = ProductV2.objects.get(name=x["name"])
                        else:
                            product = x['name']
                        print("product = ", product)
                        try:
                            subsubcategory = SubSubCategory.objects.get(name=x['subsubcategory'])
                        except:
                            subsubcategory = None
                        new_line_items = LineItemV2(
                            transaction=new_grand_total,
                            category=Category.objects.get(name=x["category"]),
                            subcategory=SubCategory.objects.get(name=x['subcategory']),
                            subsubcategory=subsubcategory,
                            name=product,
                            quantity=int(x["qty"]),
                            size=x["size"],
                            price_unit=float(x["price"]),
                            price_line_total=float(x["line_total"]),
                            discount=x['discount_applied'],
                            # payment_method=data[1]['Grand_Total']['Payment_Method'],
                            # payment_reason=data[1]['Grand_Total']["payment_reason"],
                            # staff_member=staff_member,
                        )
                        new_line_items.save()
            messages.success(request, "Transaction Complete!")
            return JsonResponse({'status': 'Checkout Complete'}, status=200)

        messages.error(request, "Problem. Try Again!")
        return JsonResponse({'status': 'Checkout Failed'}, status=400)
    
    
    drink_sizes=ProductSizes.objects.all().filter(category__name="drink").filter(in_use=True)
    food_sizes=ProductSizes.objects.all().filter(category__name="food").filter(in_use=True)
    gift_sizes=ProductSizes.objects.all().filter(category__name="gift").filter(in_use=True)
    fulldraughts = ProductV2.objects.all().filter(subsubcategory__name="full_draught").exclude(in_use=False).order_by("position_index")
    half_n_halfs = ProductV2.objects.all().filter(subsubcategory__name="half_n_half").exclude(in_use=False).order_by("position_index")
    shandys = ProductV2.objects.all().filter(subsubcategory__name="shandy").exclude(in_use=False).order_by("position_index")
    cans_and_bottles = ProductV2.objects.all().filter(subcategory__name="cans_and_bottles").exclude(in_use=False).order_by("position_index")
    spirits_and_liquers = ProductV2.objects.all().filter(subcategory__name="spirits_and_liquers").exclude(in_use=False).order_by("position_index")
    non_alcoholic = ProductV2.objects.all().filter(subcategory__name="non_alcoholic").exclude(in_use=False).order_by("position_index")
    hot_nonalcoholics = ProductV2.objects.all().filter(subcategory__name="hot_nonalcoholics").exclude(in_use=False).order_by("position_index")
    hot_alcoholics = ProductV2.objects.all().filter(subcategory__name="hot_alcoholics").exclude(in_use=False).order_by("position_index")
    hot_toddy = ProductV2.objects.all().filter(subcategory__name="hot_toddy").exclude(in_use=False).order_by("position_index")
    cocktails = ProductV2.objects.all().filter(subcategory__name="cocktails").exclude(in_use=False).order_by("position_index")
    wines = ProductV2.objects.all().filter(subcategory__name="wines").exclude(in_use=False).order_by("position_index")
    mains = ProductV2.objects.all().filter(subcategory__name="mains").exclude(in_use=False).order_by("position_index")
    potatoes = ProductV2.objects.all().filter(subcategory__name="potatoes").exclude(in_use=False).order_by("position_index")
    potatoes = ProductV2.objects.all().filter(subcategory__name="potatoes").exclude(in_use=False).order_by("position_index")
    extra_serving = ProductV2.objects.all().filter(subcategory__name="extra_serving").exclude(in_use=False).order_by("position_index")
    snack = ProductV2.objects.all().filter(subcategory__name="snack").exclude(in_use=False).order_by("position_index")
    complimentary_reasons = ComplimentaryReasons.objects.all().filter(in_use=True).order_by("reason")
    waste_reasons = WasteReasons.objects.all().filter(in_use=True).order_by("reason")
    gifts = ProductV2.objects.all().filter(category__name="gift").exclude(in_use=False).order_by("position_index")
    miscellaneous_drinks = ProductV2.objects.all().filter(category__name="drink").filter(subcategory__name="miscellaneous").exclude(name="Open Drink").exclude(in_use=False).order_by("position_index")
    miscellaneous_food = ProductV2.objects.all().filter(category__name="food").filter(subcategory__name="miscellaneous").exclude(name="Open Food").exclude(in_use=False).order_by("position_index")
    open_drink = ProductV2.objects.all().filter(subcategory__name="open_drink").exclude(in_use=False)
    specials = ProductV2.objects.all().filter(subcategory__name="special").exclude(in_use=False)
    staff = Staff.objects.all().filter(on_duty=True).order_by("name")
    
    pfand_balance = PfandBalance.objects.all().last()
    # print("open_drink = ", open_drink[0].default_size)
    
    context = {
        'drink_sizes': drink_sizes,
        'food_sizes': food_sizes,
        'gift_sizes': gift_sizes,
        'fulldraughts': fulldraughts,
        'half_n_halfs': half_n_halfs,
        'shandys': shandys,
        'cans_and_bottles': cans_and_bottles,
        'spirits_and_liquers': spirits_and_liquers,
        'non_alcoholic': non_alcoholic,
        'hot_nonalcoholics': hot_nonalcoholics,
        'hot_alcoholics': hot_alcoholics,
        'hot_toddy': hot_toddy,
        'cocktails': cocktails,
        'wines': wines,
        'mains': mains,
        'potatoes': potatoes,
        'extra_serving': extra_serving,
        'snack': snack,
        'gifts': gifts,
        'complimentary_reasons': complimentary_reasons,
        'waste_reasons': waste_reasons,
        'miscellaneous_drinks': miscellaneous_drinks,
        'miscellaneous_food': miscellaneous_food,
        'open_drink': open_drink,
        'specials': specials,
        'staff': staff,
        'event': event,
        'pfand_balance': pfand_balance,
    }
    
    return render (request, 'version_2/index_v2.html', context)


def past_orders_v2(request):
    print("PAST_ORDERS!!")
    """ A view to return the past orders page """
    if request.GET:
        print("YES GET")
        day = int(request.GET['day'])
        month = int(request.GET['month'])+1
        year = int(request.GET['year'])
        day_from = timezone.make_aware(datetime(year, month, day))
        day_to = day_from + timedelta(days=1)

        orders = LineItemV2.objects.filter(transaction__order_date__gte=day_from).filter(transaction__order_date__lte=day_to).order_by('-transaction__order_date').values(
            # 'grand_totals_id',
            'transaction__transaction_number',
            'transaction__order_date',
            'transaction__staff_member',
            'transaction__staff_member__name',
            'transaction__pfand_total',
            'transaction__drinks_food_total',
            'transaction__total_due',
            'transaction__tendered_amount',
            'transaction__change_due',
            'transaction__payment_method',
            'transaction__payment_reason',
            'discount',
            'transaction__number_of_products',
            'id',
            'name',
            'quantity',
            'size',
            'price_unit',
            'price_line_total'
        )
        
        
        staff_list = [{'staffId': 0, 'name': 'All'}]
        for order in orders:
            # print("order = ", order)
            if not any(item['staffId'] == order['transaction__staff_member'] for item in staff_list):
                staff_list.append({
                    "staffId": order['transaction__staff_member'],
                    "name": order['transaction__staff_member__name']
            })
            # Temp code to remove null values in payment_reason
            if order['transaction__payment_reason'] is None:
                order['transaction__payment_reason'] = ''
        # print("staff_list = ", staff_list)
        staffId = request.GET['staffId']
        # print("staffId = ", staffId)
        if request.GET['staffId'] != '0':
            # print("NOT ALL")
            staffId = request.GET['staffId']
            orders = orders.filter(transaction__staff_member=staffId)
        return JsonResponse({"orders": list(orders),
                             'staff_list': staff_list},
                            safe=False)
    else:
        today = timezone.now()
        day_from = today.strftime("%Y-%m-%d")
        day_to = today + timedelta(days=1)
        orders = LineItemV2.objects.all()
        # print("orders = ", orders)
        orders = LineItemV2.objects.filter(transaction__order_date__gte=day_from).filter(transaction__order_date__lte=day_to).order_by('-transaction__order_date')
        staff_list = [{'staffId': 0, 'name': 'All'}]
        for order in orders: 
            if not any(item['staffId'] == order.transaction.staff_member.id for item in staff_list):
                staff_list.append({
                    "staffId": order.transaction.staff_member.id,
                    "name": order.transaction.staff_member
                })
        
       
        context = {
            'orders': orders,
            'staff_list': staff_list
        }
        template = 'version_2/past_orders_v2.html'
        return render(request, template, context)


def eod_takings(request):
    # FIX: Initialize forms early so they always exist in memory
    takings_form = None
    receipt_formset = None

    # 1. Define the dynamic Receipts Formset framework
    # queryset=Receipts.objects.none() prevents historical uploads from loading
    ReceiptsFormSet = modelformset_factory(Receipts, form=ReceiptsForm, extra=1)


    # products = LineItemV2.objects.all()
    # for product in products:
    #     if product.discount=="":
    #         print("product.discount = ", product.discount)

    if request.method == 'POST':
        # print("POST = ", request.POST)
        takings_form = EndOfDayTakingsForm(request.POST)
        receipt_formset = ReceiptsFormSet(request.POST, request.FILES)
        trading_date = takings_form['trading_date'].value()
        print("TRADING_DATE = ", trading_date)
        # Step 1: Define the raw mathematical formula for the equivalent value
        cash_equivalent_formula = ExpressionWrapper(
            F('quantity') * F('price_unit'), 
            output_field=DecimalField(max_digits=10, decimal_places=2)
        )
        discounted_sum_formula = ExpressionWrapper(
            (F('quantity') * F('price_unit')) - F('price_line_total'), 
            output_field=DecimalField(max_digits=10, decimal_places=2)
        )

        drinks_report = LineItemV2.objects.filter(transaction__order_date__date=trading_date).filter(category__name="drink").aggregate(
            waste=Sum(
                Case(
                    When(transaction__payment_method__iexact='waste', then=cash_equivalent_formula),
                    output_field=DecimalField()
                )
            ),
            complimentary=Sum(
                Case(
                    When(transaction__payment_method__iexact='complimentary', then=cash_equivalent_formula),
                    output_field=DecimalField()
                )
            ),
            card=Sum(
                Case(
                    When(transaction__payment_method__iexact='credit card', then='price_line_total'),
                    output_field=DecimalField()
                )
            ),
            cash=Sum(
                Case(
                    When(transaction__payment_method__iexact='cash', then='price_line_total'),
                    output_field=DecimalField()
                )
            ),
            discount_value=Sum(
                Case(
                    When(discount__isnull=False, discount__gt="", then=discounted_sum_formula),
                    output_field=DecimalField()
                )
            ),
            quantity=Sum('quantity'),
        )
        
        print("drinks_report['quantity'] = ", drinks_report['quantity'])
        drinks_report['quantity'] = drinks_report['quantity'] or 0
        drinks_report['waste'] = round(drinks_report['waste'] or Decimal('0.00'), 2)
        drinks_report['complimentary'] = round(drinks_report['complimentary'] or Decimal('0.00'), 2)
        drinks_report['discount_value'] = round(drinks_report['discount_value'] or Decimal('0.00'), 2)
        drinks_report['card'] = round(drinks_report['card'] or Decimal('0.00'), 2)
        drinks_report['cash'] = round(drinks_report['cash'] or Decimal('0.00'), 2)

        food_report = LineItemV2.objects.all().filter(transaction__order_date__date=trading_date).filter(category__name="food").aggregate(
            waste=Sum(
                Case(
                    When(transaction__payment_method__iexact='waste', then=cash_equivalent_formula),
                    output_field=DecimalField()
                )
            ),
            complimentary=Sum(
                Case(
                    When(transaction__payment_method__iexact='complimentary', then=cash_equivalent_formula),
                    output_field=DecimalField()
                )
            ),
            card=Sum(
                Case(
                    When(transaction__payment_method__iexact='credit card', then='price_line_total'),
                    output_field=DecimalField()
                )
            ),
            cash=Sum(
                Case(
                    When(transaction__payment_method__iexact='cash', then='price_line_total'),
                    output_field=DecimalField()
                )
            ),
            discount_value=Sum(
                Case(
                    When(discount__isnull=False, then=discounted_sum_formula),
                    output_field=DecimalField()
                )
            ),
            quantity=Sum('quantity'),
        )
        
        food_report['quantity'] = food_report['quantity'] or 0
        food_report['waste'] = round(food_report['waste'] or Decimal('0.00'), 2)
        food_report['complimentary'] = round(food_report['complimentary'] or Decimal('0.00'), 2)
        food_report['discount_value'] = round(food_report['discount_value'] or Decimal('0.00'), 2)
        food_report['card'] = round(food_report['card'] or Decimal('0.00'), 2)
        food_report['cash'] = round(food_report['cash'] or Decimal('0.00'), 2)
        

        gifts_report = LineItemV2.objects.all().filter(transaction__order_date__date=trading_date).filter(category__name="gift").aggregate(
            waste=Sum(
                Case(
                    When(transaction__payment_method__iexact='waste', then=cash_equivalent_formula),
                    output_field=DecimalField()
                )
            ),
            complimentary=Sum(
                Case(
                    When(transaction__payment_method__iexact='complimentary', then=cash_equivalent_formula),
                    output_field=DecimalField()
                )
            ),
            card=Sum(
                Case(
                    When(transaction__payment_method__iexact='credit card', then='price_line_total'),
                    output_field=DecimalField()
                )
            ),
            cash=Sum(
                Case(
                    When(transaction__payment_method__iexact='cash', then='price_line_total'),
                    output_field=DecimalField()
                )
            ),
            discount_value=Sum(
                Case(
                    When(discount__isnull=False, then=discounted_sum_formula),
                    output_field=DecimalField()
                )
            ),
            quantity=Sum('quantity'),
        )
        gifts_report['quantity'] = gifts_report['quantity'] or 0
        gifts_report['waste'] = round(gifts_report['waste'] or Decimal('0.00'), 2)
        gifts_report['complimentary'] = round(gifts_report['complimentary'] or Decimal('0.00'), 2)
        gifts_report['discount_value'] = round(gifts_report['discount_value'] or Decimal('0.00'), 2)
        gifts_report['card'] = round(gifts_report['card'] or Decimal('0.00'), 2)
        gifts_report['cash'] = round(gifts_report['cash'] or Decimal('0.00'), 2)
        

        total_waste = drinks_report['waste'] + food_report['waste'] + gifts_report['waste']
        total_complimentary = drinks_report['complimentary'] + food_report['complimentary'] + gifts_report['complimentary']
        total_card = drinks_report['card'] + food_report['card'] + gifts_report['card']
        total_cash = drinks_report['cash'] + food_report['cash'] + gifts_report['cash']
        total_discount_value = drinks_report['discount_value'] + food_report['discount_value'] + gifts_report['discount_value']
        total_quantity = drinks_report['quantity'] + food_report['quantity'] + gifts_report['quantity']
        #######################################################################################################################
        # Step 2: Run a single conditional aggregation query
        report = LineItemV2.objects.filter(
            transaction__order_date__date=trading_date
        ).aggregate(
            # --- CASH ---
            total_cash_sales=Sum(
                Case(
                    When(transaction__payment_method__iexact='cash', then='price_line_total'),
                    output_field=DecimalField()
                )
            ),
            cash_transaction_count=Count(
                Case(
                    When(transaction__payment_method__iexact='cash', then='transaction_id')
                ),
                distinct=True
            ),

            # --- CREDIT CARD ONLY ---
            total_card_sales=Sum(
                Case(
                    When(transaction__payment_method__iexact='credit card', then='price_line_total'),
                    output_field=DecimalField()
                )
            ),
            card_transaction_count=Count(
                Case(
                    When(transaction__payment_method__iexact='credit card', then='transaction_id')
                ),
                distinct=True
            ),

            # --- COMPLIMENTARY  ---
            total_complimentary_value=Sum(
                Case(
                    When(transaction__payment_method__iexact='complimentary', then=cash_equivalent_formula),
                    output_field=DecimalField()
                )
            ),
            complimentary_transaction_count=Count(
                Case(
                    When(transaction__payment_method__iexact='complimentary', then='transaction_id')
                ),
                distinct=True
            ),
            
            # --- WASTE ---
            total_waste_value=Sum(
                Case(
                    When(transaction__payment_method__iexact='waste', then=cash_equivalent_formula),
                    output_field=DecimalField()
                )
            ),
            waste_transaction_count=Count(
                Case(
                    When(transaction__payment_method__iexact='waste', then='transaction_id')
                ),
                distinct=True
            ),
            two_for_one_vouchers_value=Sum(
                Case(
                    When(discount__iexact='2 for 1', then=discounted_sum_formula),
                    output_field=DecimalField()
                )
            ),
            two_for_one_vouchers_count=Count(
                Case(
                    When(discount__iexact='2 for 1', then='transaction_id')
                ),
                distinct=True
            ),
            ten_for_eleven_vouchers_value=Sum(
                Case(
                    When(discount__iexact='10 for 11', then=discounted_sum_formula),
                    output_field=DecimalField()
                )
            ),
            ten_for_eleven_vouchers_count=Count(
                Case(
                    When(discount__iexact='10 for 11', then='transaction_id')
                ),
                distinct=True
            ),
            twenty_pc_off_customer_vouchers_value=Sum(
                Case(
                    When(discount__iexact='20% Off - Customer', then=discounted_sum_formula),
                    output_field=DecimalField()
                )
            ),
            twenty_pc_off_customer_vouchers_count=Count(
                Case(
                    When(discount__iexact='20% Off - Customer', then='transaction_id')
                ),
                distinct=True
            ),
            twenty_pc_off_austeller_vouchers_value=Sum(
                Case(
                    When(discount__iexact='20% Off - Austeller', then=discounted_sum_formula),
                    output_field=DecimalField()
                )
            ),
            twenty_pc_off_austeller_vouchers_count=Count(
                Case(
                    When(discount__iexact='20% Off - Austeller', then='transaction_id')
                ),
                distinct=True
            ),
            student_discount_vouchers_value=Sum(
                Case(
                    When(discount__iexact='Student Discount', then=discounted_sum_formula),
                    output_field=DecimalField()
                )
            ),
            student_discount_vouchers_count=Count(
                Case(
                    When(discount__iexact='Student Discount', then='transaction_id')
                ),
                distinct=True
            ),
            oap_discount_vouchers_value=Sum(
                Case(
                    When(discount__iexact='OAP Discount', then=discounted_sum_formula),
                    output_field=DecimalField()
                )
            ),
            oap_discount_vouchers_count=Count(
                Case(
                    When(discount__iexact='OAP Discount', then='transaction_id')
                ),
                distinct=True
            ),
            five_euro_off_vouchers_value=Sum(
                Case(
                    When(discount__iexact='city voucher', then=discounted_sum_formula),
                    output_field=DecimalField()
                )
            ),
            five_euro_off_vouchers_count=Count(
                Case(
                    When(discount__iexact='city voucher', then='transaction_id')
                ),
                distinct=True
            ),

        )

        

        two_for_one_vouchers_value = round(report['two_for_one_vouchers_value'] or Decimal('0.00'), 2)
        two_for_one_vouchers_count = report['two_for_one_vouchers_count'] or 0
        # print("two_for_one_vouchers_value = ", two_for_one_vouchers_value)

        ten_for_eleven_vouchers_value = round(report['ten_for_eleven_vouchers_value'] or Decimal('0.00'), 2)
        ten_for_eleven_vouchers_count = report['ten_for_eleven_vouchers_count'] or 0
        # print("ten_for_eleven_vouchers_value = ", ten_for_eleven_vouchers_value)

        twenty_pc_off_customer_vouchers_value = round(report['twenty_pc_off_customer_vouchers_value'] or Decimal('0.00'), 2)
        twenty_pc_off_customer_vouchers_count = report['twenty_pc_off_customer_vouchers_count'] or 0
        # print("twenty_pc_off_customer_vouchers_value = ", twenty_pc_off_customer_vouchers_value)

        twenty_pc_off_austeller_vouchers_value = round(report['twenty_pc_off_austeller_vouchers_value'] or Decimal('0.00'), 2)
        twenty_pc_off_austeller_vouchers_count = report['twenty_pc_off_austeller_vouchers_count'] or 0
        # print("twenty_pc_off_austeller_vouchers_value = ", twenty_pc_off_austeller_vouchers_value)

        student_discount_vouchers_value = round(report['student_discount_vouchers_value'] or Decimal('0.00'), 2)
        student_discount_vouchers_count = report['student_discount_vouchers_count'] or 0
        # print("student_discount_vouchers_value = ", student_discount_vouchers_value)

        oap_discount_vouchers_value = round(report['oap_discount_vouchers_value'] or Decimal('0.00'), 2)
        oap_discount_vouchers_count = report['oap_discount_vouchers_count'] or 0
        # print("oap_discount_vouchers_value = ", oap_discount_vouchers_value)
        
        five_euro_off_vouchers_value = round(report['oap_discount_vouchers_value'] or Decimal('0.00'), 2)
        five_euro_off_vouchers_count = report['oap_discount_vouchers_count'] or 0
        # print("five_euro_off_vouchers_value = ", five_euro_off_vouchers_value)
        # total_discount_value = round(two_for_one_vouchers_value + ten_for_eleven_vouchers_value + twenty_pc_off_customer_vouchers_value + twenty_pc_off_austeller_vouchers_value + student_discount_vouchers_value + oap_discount_vouchers_value + five_euro_off_vouchers_value, 2)

        # print("total_discount_value = ", total_discount_value)

        # Pack values into the single structured clean tracking dictionary framework
        cleaned_report = {
            
            # 'total_complimentary_waste_value': round(complimentary_value + waste_value + total_discount_value, 2),
            'two_for_one_vouchers_value': two_for_one_vouchers_value,
            'two_for_one_vouchers_count': two_for_one_vouchers_count,
            'ten_for_eleven_vouchers_value': ten_for_eleven_vouchers_value,
            'ten_for_eleven_vouchers_count': ten_for_eleven_vouchers_count,
            'twenty_pc_off_customer_vouchers_value': twenty_pc_off_customer_vouchers_value,
            'twenty_pc_off_customer_vouchers_count': twenty_pc_off_customer_vouchers_count,
            'twenty_pc_off_austeller_vouchers_value': twenty_pc_off_austeller_vouchers_value,
            'twenty_pc_off_austeller_vouchers_count': twenty_pc_off_austeller_vouchers_count,
            'student_discount_vouchers_value': student_discount_vouchers_value,
            'student_discount_vouchers_count': student_discount_vouchers_count,
            'oap_discount_vouchers_value': oap_discount_vouchers_value,
            'oap_discount_vouchers_count': oap_discount_vouchers_count,
            'five_euro_off_vouchers_value': five_euro_off_vouchers_value,
            'five_euro_off_vouchers_count': five_euro_off_vouchers_count,
            'total_discount_value': total_discount_value,
            'total_discount_count': two_for_one_vouchers_count + ten_for_eleven_vouchers_count + twenty_pc_off_customer_vouchers_count + twenty_pc_off_austeller_vouchers_count + student_discount_vouchers_count + oap_discount_vouchers_count + five_euro_off_vouchers_count
        }

       



        # 1. Inspect form blocks to bypass strict constraints on completely blank panels
        for form in receipt_formset.forms:
            has_name = bool(form.data.get(f"{form.prefix}-name"))
            has_val = form.data.get(f"{form.prefix}-value") not in [None, '', '0.00', '0'] 
            # FIXED: Read file data directly from request.FILES using the explicit form prefix naming structure
            has_file = bool(request.FILES.get(f"{form.prefix}-image"))
            
            # If the user hasn't typed anything into this row, permit empty submissions
            if (has_name and has_val or has_file):
                form.empty_permitted = False

        # 2. Execute validation tracking checks
        if takings_form.is_valid() and receipt_formset.is_valid():
            event = Events.objects.get(pk=takings_form['event'].value())
            submitted_by = Staff.objects.get(pk=takings_form['submitted_by'].value())
            # Save your cash total matrix record directly to the database
            # Save core takings object metrics directly to database logs
            takings_instance = takings_form.save()
            print("takings_instance = ", takings_instance)
            messages.success(request, "Daily takings saved")

            # 3. Save each valid filled-out receipt dynamically as standalone logs
            receipts_saved_count = 0
            saved_receipt_instances = []
            for receipt_form in receipt_formset.forms:
                if not receipt_form.empty_permitted:
                    # Saves the row as an independent row record inside the Receipts table
                    receipt_instance = receipt_form.save(commit=False)
                    receipt_instance.event = event
                    receipt_instance.submitted_by = submitted_by
                    receipt_instance.save()
                    saved_receipt_instances.append(receipt_instance)
                    receipts_saved_count += 1
            if receipts_saved_count > 0:
                messages.success(request, f"{receipts_saved_count} Receipts submitted successfully!") 

            print("saved_receipt_instances = ", saved_receipt_instances)
            # BULLETPROOF BASIC EMAIL TEST (NO ATTACHMENTS)
            # -----------------------------------------------------------------
            try:
                # Compile a snapshot data dictionary matching the active entries
                # 1. Dynamically calculate the precise sum of all coin values
                total_coins_count = (
                    (takings_instance.one_cent or 0) +
                    (takings_instance.two_cent or 0) +
                    (takings_instance.five_cent or 0) +
                    (takings_instance.ten_cent or 0) +
                    (takings_instance.twenty_cent or 0) +
                    (takings_instance.fifty_cent or 0) +
                    (takings_instance.one_euro or 0) +
                    (takings_instance.two_euro or 0)
                )
                total_coins_value = (
                    (takings_instance.one_cent_value or 0.00) +
                    (takings_instance.two_cent_value or 0.00) +
                    (takings_instance.five_cent_value or 0.00) +
                    (takings_instance.ten_cent_value or 0.00) +
                    (takings_instance.twenty_cent_value or 0.00) +
                    (takings_instance.fifty_cent_value or 0.00) +
                    (takings_instance.one_euro_value or 0.00) +
                    (takings_instance.two_euro_value or 0.00)
                )
                
                # 2. Dynamically calculate the precise sum of all note values
                total_notes_count = (
                    (takings_instance.five_euro or 0) +
                    (takings_instance.ten_euro or 0) +
                    (takings_instance.twenty_euro or 0) +
                    (takings_instance.fifty_euro or 0) +
                    (takings_instance.one_hundred_euro or 0) +
                    (takings_instance.two_hundred_euro or 0)
                )
                total_notes_value = (
                    (takings_instance.five_euro_value or 0.00) +
                    (takings_instance.ten_euro_value or 0.00) +
                    (takings_instance.twenty_euro_value or 0.00) +
                    (takings_instance.fifty_euro_value or 0.00) +
                    (takings_instance.one_hundred_euro_value or 0.00) +
                    (takings_instance.two_hundred_euro_value or 0.00)
                )
                total_cash_takings = total_coins_value + total_notes_value

                # 1. Locate your CSS file path dynamically
                css_path = os.path.join(settings.BASE_DIR, 'version_2', 'static', 'version_2', 'css', 'reports_email.css')

                # 2. Read the raw text inside the CSS file safely
                try:
                    with open(css_path, 'r', encoding='utf-8') as f:
                        css_content = f.read()
                except FileNotFoundError:
                    css_content = "" # Fallback if file is missing during testing

                email_context = {
                    'takings': takings_instance,
                    'receipts': saved_receipt_instances,
                    'event': event,
                    'submitted_by': submitted_by,
                    'timestamp': timezone.localtime(timezone.now()).strftime('%d/%m/%Y %H:%M:%S'),
                    'drinks_report': drinks_report,
                    'food_report': food_report,
                    'gifts_report': gifts_report,
                    'total_waste':total_waste,
                    'total_complimentary': total_complimentary,
                    'total_discount_value': total_discount_value,
                    'total_card': total_card,
                    'total_cash': total_cash,
                    'total_quantity': total_quantity,
                    'total_coins_count': total_coins_count,
                    'total_notes_count': total_notes_count,
                    'total_coins_value': total_coins_value,
                    'total_notes_value': total_notes_value,
                    'total_cash_takings': round(total_cash_takings, 2),
                    'css_styles': css_content,
                }

                # Compile header metadata fields
                t_date_str = takings_instance.trading_date.strftime('%d-%m-%Y') if takings_instance.trading_date else 'No Date'
                email_subject = f"Daily Takings Summary - {event.name if event else 'No Event'} - {t_date_str}"
                # 1 Render document layout template to string structure
                html_body_content = render_to_string('version_2/reports_email.html', email_context)
                # 2. Initialize the email wrapper (leave body blank initially or pass HTML directly)
                email = EmailMessage(
                    subject=email_subject,
                    body=html_body_content,
                    to=['peterwkellett@gmail.com']
                )

                # 3. CRITICAL: Inform email software (like Gmail) to render this as an HTML page, not plain text [1]
                email.content_subtype = "html" 


                # Fire data payload safely over Gmail SMTP infrastructure
                email.send(fail_silently=False)
                print("→ EMAIL DISPATCHED VIA GMAIL SUCCESSFULLY.")
                messages.success(request, "Email sent")
                # return redirect('index_v2')
            except Exception as e:
                print("→ EMAIL ENGINE ERROR BLOCK: ", str(e))
                messages.error(request, f"EMAIL ENGINE ERROR BLOCK: {str(e)}") 
            # -----------------------------------------------------------------
 
            return redirect('index_v2')
        else:
            # Outputs debug markers clearly to terminal logs if it hits validation bumps
            print("→ VALIDATION BUMP DETECTED!")
            print("Takings Core Errors: ", takings_form.errors)
            print("Formset Group Errors: ", receipt_formset.errors)
            messages.error(request, f"Takings Form Errors - {takings_form.errors}") 
            messages.error(request, f"Receipts Form Errors - {receipt_formset.errors}") 
    else:
        # Prepopulate trading date automatically using our morning 8 AM cutoff logic
        now = timezone.localtime(timezone.now())
        if now.time() < time(8, 0):
            default_date = (now - timezone.timedelta(days=1)).date()
        else:
            default_date = now.date()
        try:
            event = Events.objects.get(date_from__lte=date.today(), date_to__gte=date.today())
        except Events.DoesNotExist:
            event = None
        takings_form = EndOfDayTakingsForm(initial={'trading_date': default_date, 'event': event})
        receipt_formset = ReceiptsFormSet(queryset=Receipts.objects.none())
        
    # FIX: Building the context dictionary explicitly right before rendering 
    # ensures it always has valid form data, even if validation fails.
    context = {
        'takings_form': takings_form,
        'receipt_formset': receipt_formset
    }
        
    return render(request, 'version_2/eod_takings.html', context)

def export_data(request):
    orders = LineItemV2.objects.all()

    data = {
        'line_ID': [],
        'trans_ID': [],
        'order_date': [],
        'order_time': [],
        'qty_of_products': [],
        'products_total': [],
        'pfand_total': [],
        'total_due': [],
        'tendered_amount': [],
        'change_due': [],
        'payment_method': [],
        'payment_reason': [],
        'staff_member': [],
        'product_name': [],
        'product_size': [],
        'price_unit': [],
        'quantity': [],
        'line_total': [],
        'discount': [],
        'discount_type': [],
        'parent_cat': [],
        'sub_cat_1': [],
        'sub_cat_2': [],
    }
    for order in orders:
        print("order = ", order.subsubcategory)
        data['line_ID'].append(order.id)
        data['trans_ID'].append(order.transaction.transaction_number)
        data['order_date'].append(order.transaction.order_date.strftime("%d/%m/%Y"))
        data['order_time'].append(order.transaction.order_date.strftime("%H:%M:%S"))
        data['qty_of_products'].append(order.transaction.number_of_products)
        data['products_total'].append(order.transaction.drinks_food_total)
        data['pfand_total'].append(order.transaction.pfand_total)
        data['total_due'].append(order.transaction.total_due)
        data['tendered_amount'].append(order.transaction.tendered_amount)
        data['change_due'].append(order.transaction.change_due)
        data['payment_method'].append(order.transaction.payment_method)
        data['payment_reason'].append(order.transaction.payment_reason)
        data['staff_member'].append(order.transaction.staff_member)
        data['product_name'].append(order.name)
        data['product_size'].append(order.size)
        data['price_unit'].append(order.price_unit)
        data['quantity'].append(order.quantity)
        data['line_total'].append(order.price_line_total)
        data['discount'].append(order.price_unit * order.quantity - order.price_line_total)
        data['discount_type'].append(order.discount)
        data['parent_cat'].append(order.category.name)
        data['sub_cat_1'].append(order.subcategory.name)
        if order.subsubcategory == None:
            data['sub_cat_2'].append('')
        else:
            data['sub_cat_2'].append(order.subsubcategory.name)

    print("data = ", data)

    df = pd.DataFrame(data)

    # 2. CLEANING: Convert non-Excel types to strings
    # This handles UUIDs, Decimals, and Django Staff objects
    for col in df.columns:
        df[col] = df[col].apply(lambda x: str(x) if isinstance(x, (UUID, Decimal)) or hasattr(x, '_meta') else x)

    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Transactions')
        
        workbook = writer.book
        worksheet = writer.sheets['Transactions']
        
        # Formats
        header_fmt = workbook.add_format({'bold': True, 'bg_color': '#D7E4BC', 'align': 'center'})
        merge_fmt = workbook.add_format({'valign': 'vcenter', 'align': 'left'})

        # Style Headers
        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_fmt)

        # 3. MERGING LOGIC
        # We merge based on 'trans_ID' (which is now a string)
        for trans_id in df['trans_ID'].unique():
            indices = df.index[df['trans_ID'] == trans_id].tolist()
            
            if len(indices) > 1:
                first = indices[0] + 1
                last = indices[-1] + 1
                
                # Columns to merge: line_ID thru staff_member (Indices 0 to 12)
                # We do NOT merge product_name (13), product_size (14), etc.
                columns_to_group = list(range(0, 13)) 
                
                for col in columns_to_group:
                    val = df.iloc[indices[0], col]
                    worksheet.merge_range(first, col, last, col, val, merge_fmt)

        # Set Column Widths
        # worksheet.set_column('B:B', 40) # wide trans_ID
        # worksheet.set_column('M:M', 20) # staff_member
        # worksheet.set_column('N:N', 25) # product_name

    buffer.seek(0)
    response = HttpResponse(buffer.getvalue(), content_type='application/vnd.ms-excel')
    response['Content-Disposition'] = 'attachment; filename="epos_report.xlsx"'
    return response
    # #######################    