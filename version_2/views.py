from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib import messages
from . models import ProductV2, ProductSizes, ComplimentaryReasons, WasteReasons, GrandTotalV2, PfandBalance, LineItemV2, Category, SubCategory, SubSubCategory, Events
from index.models import Staff
import json
from decimal import Decimal
from datetime import datetime, date, timedelta
from django.utils import timezone
import pandas as pd
import io
from uuid import UUID
from django.http import HttpResponse

from django.forms import modelformset_factory


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
    print("now = ", now)
    print("today = ", today)
    try:
        event = Events.objects.get(date_from__lte=today, date_to__gte=today)
    except Events.DoesNotExist:
        event = "event: None"
    print(event)
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
    print("open_drink = ", open_drink[0].default_size)
    
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