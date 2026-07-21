from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.contrib import messages
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
from index.models import Staff
from .models import (
    ProductV2,
    ProductSizes,
    ComplimentaryReasons,
    WasteReasons,
    GrandTotalV2,
    PfandBalance,
    LineItemV2,
    Category,
    SubCategory,
    SubSubCategory,
    Events,
    Receipts,
)

def bulk_edit_items(request):
    # 1. Dynamically get all fields except 'id' AND the excluded products
    excluded_fields = {"id", "summer_product", "winter_product"}
    all_fields = [
        f.name for f in ProductV2._meta.fields if f.name not in excluded_fields
    ]

    # Pass the dynamic list into the formset factory
    ItemFormSet = modelformset_factory(ProductV2, fields=all_fields, extra=1)

    # 2. Get the sorting parameter from the URL (default to 'name')
    order_by = request.GET.get("order_by", "name")
    # print("request!!1", request.GET.get('order_by', 'name'))
    # 3. Map URL triggers to specific related field names
    sort_mapping = {
        "name": "name",
        "-name": "-name",
        "category": "category__name",
        "-category": "-category__name",
        "subcategory": "subcategory__name",
        "-subcategory": "-subcategory__name",
        "subsubcategory": "subsubcategory__name",
        "-subsubcategory": "-subsubcategory__name",
    }
    db_order_field = sort_mapping.get(order_by, "name")
    # print("db_order_field", db_order_field)
    # 4. Fetch the optimized and sorted dataset
    queryset = (
        ProductV2.objects.all()
        .select_related("category", "subcategory", "subsubcategory")
        .order_by(db_order_field)
    )

    if request.method == "POST":
        # 2. Bind the submitted POST data to the formset
        formset = ItemFormSet(request.POST, queryset=queryset)
        if formset.is_valid():
            formset.save()  # Saves all changes to the database at once
            return redirect(
                f"{request.path}?order_by={order_by}"
            )  # Reloads the page to show updated data
        else:
            # Troubleshooting step: Print errors if the form is invalid
            print("Formset validation failed:", formset.errors)
    else:
        # 3. On a GET request, pull all records into the formset
        formset = ItemFormSet(queryset=queryset)

    return render(
        request,
        "version_2/item_bulk_edit.html",
        {"formset": formset, "current_order": order_by},
    )


# Create your views here.
def index_v2(request):
    print("index_v2")
    user = request.user
    today = date.today()
    # tempEvent = Events.objects.get(name="Kieler Woche")
    # print("tempEvent = ", tempEvent)
    # lineItems = LineItemV2.objects.all()
    # for line_item in lineItems:
    #     # print("line_item = ", line_item.name)
    #     try:
    #         product = ProductV2.objects.get(name=line_item.name)
    #     except:
    #         # print("line_item = ", line_item.name)
    #         # subcategory = line_item.subcategory
    #         # print("subcategory = ", subcategory)
    #         # product = ProductV2.objects.get(subcategory=subcategory)
    #         # print("product = ", product)
    #         product = None

    #     line_item.productId = product
    #     line_item.save() 
    try:
        event = Events.objects.get(date_from__lte=today, date_to__gte=today)
    except Events.DoesNotExist as e:
        event = None

    is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"
    if is_ajax:
        print("is_ajax")
        try:
            event = Events.objects.get(date_from__lte=today, date_to__gte=today)
        except Exception as e:
            # Catch-all for any other unexpected system errors (e.g., database connection down)
            error_msg = f"{str(e)}"
            return JsonResponse({"error": error_msg}, status=500)

        if not user.is_authenticated:
            messages.warning(request, "Please log in. Try Again!")
            return JsonResponse({"status": "Checkout Complete"}, status=200)
        elif request.method == "POST":
            data = json.load(request)
            # print("Data 0 = ", data[0]) # NEW_BASKET
            # print("Data 1 = ", data[1]) # GRAND_TOTAL
            # print("Data 2 = ", data[2]) # DISCOUNTS

            try:
                staff_member = Staff.objects.get(id=data[1]["Grand_Total"]["staff_member"])
            except Exception as e:
            # Catch-all for any other unexpected system errors (e.g., database connection down)
                error_msg = f"{str(e)}"
                return JsonResponse({"error": error_msg}, status=500)
            
            try:
                for v in data[1].values():
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
                        event=event,
                    )
                    new_grand_total.save()
            except ObjectDoesNotExist as e:
                # Catches missing Products, Categories, or SubCategories
                error_msg = f"Database lookup failed: Grand Total Error ({str(e)})"
                return JsonResponse({"error": error_msg}, status=400)

            except ValueError as e:
                # Catches data conversion issues (e.g., int("invalid") or float("invalid"))
                error_msg = f"Invalid data Grand Total Error: {str(e)}"
                return JsonResponse({"error": error_msg}, status=400)

            except Exception as e:
                # Catch-all for any other unexpected system errors (e.g., database connection down)
                error_msg = f"An unexpected Grand Total Error: {str(e)}"
                return JsonResponse({"error": error_msg}, status=500)

            try:
                for k, v in data[0].items():
                    for x in v:
                        if x["qty"] != 0:
                            if x["subcategory"] != "open_drink":
                                product = ProductV2.objects.get(id=x["product_id"])
                                print("product 178= ", product)
                            else:
                                product = x["name"]
                            try:
                                subsubcategory = SubSubCategory.objects.get(
                                    name=x["subsubcategory"]
                                )
                            except:
                                subsubcategory = None

                            new_line_items = LineItemV2(
                                transaction=new_grand_total,
                                category=Category.objects.get(name=x["category"]),
                                subcategory=SubCategory.objects.get(name=x["subcategory"]),
                                subsubcategory=subsubcategory,
                                product_id=product,
                                name=product.name,
                                quantity=int(x["qty"]),
                                size=x["size"],
                                price_unit=float(x["price"]),
                                price_line_total=float(x["line_total"]),
                                discount=x["discount_applied"],
                                # payment_method=data[1]['Grand_Total']['Payment_Method'],
                                # payment_reason=data[1]['Grand_Total']["payment_reason"],
                                # staff_member=staff_member,
                            )
                            new_line_items.save()
                # messages.success(request, "Transaction Complete!")
                return JsonResponse({"status": "Checkout Complete"}, status=200)
            except ObjectDoesNotExist as e:
                # Catches missing Products, Categories, or SubCategories
                error_msg = f"Database lookup failed: Line Item Error ({str(e)})"
                return JsonResponse({"error": error_msg}, status=400)

            except ValueError as e:
                # Catches data conversion issues (e.g., int("invalid") or float("invalid"))
                error_msg = f"Invalid data Line Item Error: {str(e)}"
                return JsonResponse({"error": error_msg}, status=400)

            except Exception as e:
                # Catch-all for any other unexpected system errors (e.g., database connection down)
                error_msg = f"An unexpected Line Item Error: {str(e)}"
                return JsonResponse({"error": error_msg}, status=500)

    drink_sizes = (
        ProductSizes.objects.all().filter(category__name="drink").filter(in_use=True)
    )
    food_sizes = (
        ProductSizes.objects.all().filter(category__name="food").filter(in_use=True)
    )
    gift_sizes = (
        ProductSizes.objects.all().filter(category__name="gift").filter(in_use=True)
    )
    fulldraughts = (
        ProductV2.objects.all()
        .filter(subsubcategory__name="full_draught")
        .exclude(in_use=False)
        .order_by("position_index")
    )
    half_n_halfs = (
        ProductV2.objects.all()
        .filter(subsubcategory__name="half_n_half")
        .exclude(in_use=False)
        .order_by("position_index")
    )
    shandys = (
        ProductV2.objects.all()
        .filter(subsubcategory__name="shandy")
        .exclude(in_use=False)
        .order_by("position_index")
    )
    cans_and_bottles = (
        ProductV2.objects.all()
        .filter(subcategory__name="cans_and_bottles")
        .exclude(in_use=False)
        .order_by("position_index")
    )
    spirits_and_liquers = (
        ProductV2.objects.all()
        .filter(subcategory__name="spirits_and_liquers")
        .exclude(in_use=False)
        .order_by("position_index")
    )
    non_alcoholic = (
        ProductV2.objects.all()
        .filter(subcategory__name="non_alcoholic")
        .exclude(in_use=False)
        .order_by("position_index")
    )
    hot_nonalcoholics = (
        ProductV2.objects.all()
        .filter(subcategory__name="hot_nonalcoholics")
        .exclude(in_use=False)
        .order_by("position_index")
    )
    hot_alcoholics = (
        ProductV2.objects.all()
        .filter(subcategory__name="hot_alcoholics")
        .exclude(in_use=False)
        .order_by("position_index")
    )
    hot_toddy = (
        ProductV2.objects.all()
        .filter(subcategory__name="hot_toddy")
        .exclude(in_use=False)
        .order_by("position_index")
    )
    cocktails = (
        ProductV2.objects.all()
        .filter(subcategory__name="cocktails")
        .exclude(in_use=False)
        .order_by("position_index")
    )
    wines = (
        ProductV2.objects.all()
        .filter(subcategory__name="wines")
        .exclude(in_use=False)
        .order_by("position_index")
    )
    mains = (
        ProductV2.objects.all()
        .filter(subcategory__name="mains")
        .exclude(in_use=False)
        .order_by("position_index")
    )
    potatoes = (
        ProductV2.objects.all()
        .filter(subcategory__name="potatoes")
        .exclude(in_use=False)
        .order_by("position_index")
    )
    potatoes = (
        ProductV2.objects.all()
        .filter(subcategory__name="potatoes")
        .exclude(in_use=False)
        .order_by("position_index")
    )
    extra_serving = (
        ProductV2.objects.all()
        .filter(subcategory__name="extra_serving")
        .exclude(in_use=False)
        .order_by("position_index")
    )
    snack = (
        ProductV2.objects.all()
        .filter(subcategory__name="snack")
        .exclude(in_use=False)
        .order_by("position_index")
    )
    complimentary_reasons = (
        ComplimentaryReasons.objects.all().filter(in_use=True).order_by("reason")
    )
    waste_reasons = WasteReasons.objects.all().filter(in_use=True).order_by("reason")
    gifts = (
        ProductV2.objects.all()
        .filter(category__name="gift")
        .exclude(in_use=False)
        .order_by("position_index")
    )
    miscellaneous_drinks = (
        ProductV2.objects.all()
        .filter(category__name="drink")
        .filter(subcategory__name="miscellaneous")
        .exclude(name="Open Drink")
        .exclude(in_use=False)
        .order_by("position_index")
    )
    miscellaneous_food = (
        ProductV2.objects.all()
        .filter(category__name="food")
        .filter(subcategory__name="miscellaneous")
        .exclude(name="Open Food")
        .exclude(in_use=False)
        .order_by("position_index")
    )
    open_drink = (
        ProductV2.objects.all()
        .filter(subcategory__name="open_drink")
        .exclude(in_use=False)
    )
    specials = (
        ProductV2.objects.all()
        .filter(subcategory__name="special")
        .exclude(in_use=False)
    )
    staff = Staff.objects.all().filter(on_duty=True).order_by("name")

    pfand_balance = PfandBalance.objects.all().last()

    context = {
        "drink_sizes": drink_sizes,
        "food_sizes": food_sizes,
        "gift_sizes": gift_sizes,
        "fulldraughts": fulldraughts,
        "half_n_halfs": half_n_halfs,
        "shandys": shandys,
        "cans_and_bottles": cans_and_bottles,
        "spirits_and_liquers": spirits_and_liquers,
        "non_alcoholic": non_alcoholic,
        "hot_nonalcoholics": hot_nonalcoholics,
        "hot_alcoholics": hot_alcoholics,
        "hot_toddy": hot_toddy,
        "cocktails": cocktails,
        "wines": wines,
        "mains": mains,
        "potatoes": potatoes,
        "extra_serving": extra_serving,
        "snack": snack,
        "gifts": gifts,
        "complimentary_reasons": complimentary_reasons,
        "waste_reasons": waste_reasons,
        "miscellaneous_drinks": miscellaneous_drinks,
        "miscellaneous_food": miscellaneous_food,
        "open_drink": open_drink,
        "specials": specials,
        "staff": staff,
        "event": event,
        "pfand_balance": pfand_balance,
    }

    return render(request, "version_2/index_v2.html", context)


def past_orders_v2(request):
    print("PAST_ORDERS!!")
    if request.GET:
        print("YES GET")
        day = int(request.GET["day"])
        month = int(request.GET["month"]) + 1
        year = int(request.GET["year"])
        day_from = timezone.make_aware(datetime(year, month, day))
        day_to = day_from + timedelta(days=1)

        orders = (
            LineItemV2.objects.filter(transaction__order_date__gte=day_from)
            .filter(transaction__order_date__lte=day_to)
            .order_by("-transaction__order_date")
            .values(
                "transaction__transaction_number",
                "transaction__order_date",
                "transaction__staff_member",
                "transaction__staff_member__name",
                "transaction__pfand_total",
                "transaction__drinks_food_total",
                "transaction__total_due",
                "transaction__tendered_amount",
                "transaction__change_due",
                "transaction__payment_method",
                "transaction__payment_reason",
                "discount",
                "transaction__number_of_products",
                "id",
                "name",
                "quantity",
                "size",
                "price_unit",
                "price_line_total",
            )
        )

        staff_list = [{"staffId": 0, "name": "All"}]
        for order in orders:
            if not any(
                item["staffId"] == order["transaction__staff_member"]
                for item in staff_list
            ):
                staff_list.append(
                    {
                        "staffId": order["transaction__staff_member"],
                        "name": order["transaction__staff_member__name"],
                    }
                )
            # Temp code to remove null values in payment_reason
            if order["transaction__payment_reason"] is None:
                order["transaction__payment_reason"] = ""
        staffId = request.GET["staffId"]
        if request.GET["staffId"] != "0":
            staffId = request.GET["staffId"]
            orders = orders.filter(transaction__staff_member=staffId)
        return JsonResponse(
            {"orders": list(orders), "staff_list": staff_list}, safe=False
        )
    else:
        today = timezone.now()
        day_from = today.strftime("%Y-%m-%d")
        day_to = today + timedelta(days=1)
        orders = LineItemV2.objects.all()
        orders = (
            LineItemV2.objects.filter(transaction__order_date__gte=day_from)
            .filter(transaction__order_date__lte=day_to)
            .order_by("-transaction__order_date")
        )
        staff_list = [{"staffId": 0, "name": "All"}]
        for order in orders:
            if not any(
                item["staffId"] == order.transaction.staff_member.id
                for item in staff_list
            ):
                staff_list.append(
                    {
                        "staffId": order.transaction.staff_member.id,
                        "name": order.transaction.staff_member,
                    }
                )

        context = {"orders": orders, "staff_list": staff_list}
        template = "version_2/past_orders_v2.html"
        return render(request, template, context)


def eod_takings(request):
    # FIX: Initialize forms early so they always exist in memory
    takings_form = None
    receipt_formset = None
    staff_id = request.GET.get("staff")
    print("staff_id = ", staff_id)
    # 1. Define the dynamic Receipts Formset framework
    # queryset=Receipts.objects.none() prevents historical uploads from loading
    ReceiptsFormSet = modelformset_factory(Receipts, form=ReceiptsForm, extra=1)

    if request.method == "POST":
        # print("POST = ", request.POST)
        takings_form = EndOfDayTakingsForm(request.POST)
        receipt_formset = ReceiptsFormSet(request.POST, request.FILES)
        trading_date = takings_form["trading_date"].value()
        # Step 1: Define the raw mathematical formula for the equivalent value
        cash_equivalent_formula = ExpressionWrapper(
            F("quantity") * F("price_unit"),
            output_field=DecimalField(max_digits=10, decimal_places=2),
        )
        discounted_sum_formula = ExpressionWrapper(
            (F("quantity") * F("price_unit")) - F("price_line_total"),
            output_field=DecimalField(max_digits=10, decimal_places=2),
        )

        drinks_report = (
            LineItemV2.objects.filter(transaction__order_date__date=trading_date)
            .filter(category__name="drink")
            .aggregate(
                waste=Sum(
                    Case(
                        When(
                            transaction__payment_method__iexact="waste",
                            then=cash_equivalent_formula,
                        ),
                        output_field=DecimalField(),
                    )
                ),
                complimentary=Sum(
                    Case(
                        When(
                            transaction__payment_method__iexact="complimentary",
                            then=cash_equivalent_formula,
                        ),
                        output_field=DecimalField(),
                    )
                ),
                card=Sum(
                    Case(
                        When(
                            transaction__payment_method__iexact="credit card",
                            then="price_line_total",
                        ),
                        output_field=DecimalField(),
                    )
                ),
                cash=Sum(
                    Case(
                        When(
                            transaction__payment_method__iexact="cash",
                            then="price_line_total",
                        ),
                        output_field=DecimalField(),
                    )
                ),
                discount_value=Sum(
                    Case(
                        When(
                            discount__isnull=False,
                            discount__gt="",
                            then=discounted_sum_formula,
                        ),
                        output_field=DecimalField(),
                    )
                ),
                quantity=Sum("quantity"),
            )
        )

        drinks_report["quantity"] = drinks_report["quantity"] or 0
        drinks_report["waste"] = round(drinks_report["waste"] or Decimal("0.00"), 2)
        drinks_report["complimentary"] = round(
            drinks_report["complimentary"] or Decimal("0.00"), 2
        )
        drinks_report["discount_value"] = round(
            drinks_report["discount_value"] or Decimal("0.00"), 2
        )
        drinks_report["card"] = round(drinks_report["card"] or Decimal("0.00"), 2)
        drinks_report["cash"] = round(drinks_report["cash"] or Decimal("0.00"), 2)

        food_report = (
            LineItemV2.objects.all()
            .filter(transaction__order_date__date=trading_date)
            .filter(category__name="food")
            .aggregate(
                waste=Sum(
                    Case(
                        When(
                            transaction__payment_method__iexact="waste",
                            then=cash_equivalent_formula,
                        ),
                        output_field=DecimalField(),
                    )
                ),
                complimentary=Sum(
                    Case(
                        When(
                            transaction__payment_method__iexact="complimentary",
                            then=cash_equivalent_formula,
                        ),
                        output_field=DecimalField(),
                    )
                ),
                card=Sum(
                    Case(
                        When(
                            transaction__payment_method__iexact="credit card",
                            then="price_line_total",
                        ),
                        output_field=DecimalField(),
                    )
                ),
                cash=Sum(
                    Case(
                        When(
                            transaction__payment_method__iexact="cash",
                            then="price_line_total",
                        ),
                        output_field=DecimalField(),
                    )
                ),
                discount_value=Sum(
                    Case(
                        When(discount__isnull=False, then=discounted_sum_formula),
                        output_field=DecimalField(),
                    )
                ),
                quantity=Sum("quantity"),
            )
        )

        food_report["quantity"] = food_report["quantity"] or 0
        food_report["waste"] = round(food_report["waste"] or Decimal("0.00"), 2)
        food_report["complimentary"] = round(
            food_report["complimentary"] or Decimal("0.00"), 2
        )
        food_report["discount_value"] = round(
            food_report["discount_value"] or Decimal("0.00"), 2
        )
        food_report["card"] = round(food_report["card"] or Decimal("0.00"), 2)
        food_report["cash"] = round(food_report["cash"] or Decimal("0.00"), 2)

        gifts_report = (
            LineItemV2.objects.all()
            .filter(transaction__order_date__date=trading_date)
            .filter(category__name="gift")
            .aggregate(
                waste=Sum(
                    Case(
                        When(
                            transaction__payment_method__iexact="waste",
                            then=cash_equivalent_formula,
                        ),
                        output_field=DecimalField(),
                    )
                ),
                complimentary=Sum(
                    Case(
                        When(
                            transaction__payment_method__iexact="complimentary",
                            then=cash_equivalent_formula,
                        ),
                        output_field=DecimalField(),
                    )
                ),
                card=Sum(
                    Case(
                        When(
                            transaction__payment_method__iexact="credit card",
                            then="price_line_total",
                        ),
                        output_field=DecimalField(),
                    )
                ),
                cash=Sum(
                    Case(
                        When(
                            transaction__payment_method__iexact="cash",
                            then="price_line_total",
                        ),
                        output_field=DecimalField(),
                    )
                ),
                discount_value=Sum(
                    Case(
                        When(discount__isnull=False, then=discounted_sum_formula),
                        output_field=DecimalField(),
                    )
                ),
                quantity=Sum("quantity"),
            )
        )

        gifts_report["quantity"] = gifts_report["quantity"] or 0
        gifts_report["waste"] = round(gifts_report["waste"] or Decimal("0.00"), 2)
        gifts_report["complimentary"] = round(
            gifts_report["complimentary"] or Decimal("0.00"), 2
        )
        gifts_report["discount_value"] = round(
            gifts_report["discount_value"] or Decimal("0.00"), 2
        )
        gifts_report["card"] = round(gifts_report["card"] or Decimal("0.00"), 2)
        gifts_report["cash"] = round(gifts_report["cash"] or Decimal("0.00"), 2)

        total_waste = (
            drinks_report["waste"] + food_report["waste"] + gifts_report["waste"]
        )
        total_complimentary = (
            drinks_report["complimentary"]
            + food_report["complimentary"]
            + gifts_report["complimentary"]
        )
        total_card = drinks_report["card"] + food_report["card"] + gifts_report["card"]
        total_cash = drinks_report["cash"] + food_report["cash"] + gifts_report["cash"]
        total_discount_value = (
            drinks_report["discount_value"]
            + food_report["discount_value"]
            + gifts_report["discount_value"]
        )
        total_quantity = (
            drinks_report["quantity"]
            + food_report["quantity"]
            + gifts_report["quantity"]
        )
        #######################################################################################################################
        # Step 2: Run a single conditional aggregation query
        vouchers = LineItemV2.objects.filter(
            transaction__order_date__date=trading_date
        ).aggregate(
            two_for_one_vouchers_value=Sum(
                Case(
                    When(discount__iexact="2 for 1", then=discounted_sum_formula),
                    output_field=DecimalField(),
                )
            ),
            two_for_one_vouchers_count=Count(
                Case(When(discount__iexact="2 for 1", then="transaction_id")),
                distinct=True,
            ),
            ten_for_eleven_vouchers_value=Sum(
                Case(
                    When(discount__iexact="10 for 11", then=discounted_sum_formula),
                    output_field=DecimalField(),
                )
            ),
            ten_for_eleven_vouchers_count=Count(
                Case(When(discount__iexact="10 for 11", then="transaction_id")),
                distinct=True,
            ),
            twenty_pc_off_customer_vouchers_value=Sum(
                Case(
                    When(
                        discount__iexact="20% Off - Customer",
                        then=discounted_sum_formula,
                    ),
                    output_field=DecimalField(),
                )
            ),
            twenty_pc_off_customer_vouchers_count=Count(
                Case(
                    When(discount__iexact="20% Off - Customer", then="transaction_id")
                ),
                distinct=True,
            ),
            twenty_pc_off_austeller_vouchers_value=Sum(
                Case(
                    When(
                        discount__iexact="20% Off - Austeller",
                        then=discounted_sum_formula,
                    ),
                    output_field=DecimalField(),
                )
            ),
            twenty_pc_off_austeller_vouchers_count=Count(
                Case(
                    When(discount__iexact="20% Off - Austeller", then="transaction_id")
                ),
                distinct=True,
            ),
            student_discount_vouchers_value=Sum(
                Case(
                    When(
                        discount__iexact="Student Discount", then=discounted_sum_formula
                    ),
                    output_field=DecimalField(),
                )
            ),
            student_discount_vouchers_count=Count(
                Case(When(discount__iexact="Student Discount", then="transaction_id")),
                distinct=True,
            ),
            oap_discount_vouchers_value=Sum(
                Case(
                    When(discount__iexact="OAP Discount", then=discounted_sum_formula),
                    output_field=DecimalField(),
                )
            ),
            oap_discount_vouchers_count=Count(
                Case(When(discount__iexact="OAP Discount", then="transaction_id")),
                distinct=True,
            ),
            five_euro_off_vouchers_value=Sum(
                Case(
                    When(discount__iexact="city voucher", then=discounted_sum_formula),
                    output_field=DecimalField(),
                )
            ),
            five_euro_off_vouchers_count=Count(
                Case(When(discount__iexact="city voucher", then="transaction_id")),
                distinct=True,
            ),
        )

        vouchers["two_for_one_vouchers_value"] = round(
            vouchers["two_for_one_vouchers_value"] or Decimal("0.00"), 2
        )
        vouchers["two_for_one_vouchers_count"] = (
            vouchers["two_for_one_vouchers_count"] or 0
        )

        vouchers["ten_for_eleven_vouchers_value"] = round(
            vouchers["ten_for_eleven_vouchers_value"] or Decimal("0.00"), 2
        )
        vouchers["ten_for_eleven_vouchers_count"] = (
            vouchers["ten_for_eleven_vouchers_count"] or 0
        )

        vouchers["twenty_pc_off_customer_vouchers_value"] = round(
            vouchers["twenty_pc_off_customer_vouchers_value"] or Decimal("0.00"), 2
        )
        vouchers["twenty_pc_off_customer_vouchers_count"] = (
            vouchers["twenty_pc_off_customer_vouchers_count"] or 0
        )

        vouchers["twenty_pc_off_austeller_vouchers_value"] = round(
            vouchers["twenty_pc_off_austeller_vouchers_value"] or Decimal("0.00"), 2
        )
        vouchers["twenty_pc_off_austeller_vouchers_count"] = (
            vouchers["twenty_pc_off_austeller_vouchers_count"] or 0
        )

        vouchers["student_discount_vouchers_value"] = round(
            vouchers["student_discount_vouchers_value"] or Decimal("0.00"), 2
        )
        vouchers["student_discount_vouchers_count"] = (
            vouchers["student_discount_vouchers_count"] or 0
        )

        vouchers["oap_discount_vouchers_value"] = round(
            vouchers["oap_discount_vouchers_value"] or Decimal("0.00"), 2
        )
        vouchers["oap_discount_vouchers_count"] = (
            vouchers["oap_discount_vouchers_count"] or 0
        )

        vouchers["five_euro_off_vouchers_value"] = round(
            vouchers["five_euro_off_vouchers_value"] or Decimal("0.00"), 2
        )
        vouchers["five_euro_off_vouchers_count"] = (
            vouchers["five_euro_off_vouchers_count"] or 0
        )

        total_vouchers_recorded = (
            vouchers["two_for_one_vouchers_count"]
            + vouchers["ten_for_eleven_vouchers_count"]
            + vouchers["twenty_pc_off_customer_vouchers_count"]
            + vouchers["twenty_pc_off_austeller_vouchers_count"]
            + vouchers["student_discount_vouchers_count"]
            + vouchers["oap_discount_vouchers_count"]
            + vouchers["five_euro_off_vouchers_count"]
        )

        total_vouchers_value = (
            vouchers["two_for_one_vouchers_value"]
            + vouchers["ten_for_eleven_vouchers_value"]
            + vouchers["twenty_pc_off_customer_vouchers_value"]
            + vouchers["twenty_pc_off_austeller_vouchers_value"]
            + vouchers["student_discount_vouchers_value"]
            + vouchers["oap_discount_vouchers_value"]
            + vouchers["five_euro_off_vouchers_value"]
        )

        # 1. Inspect form blocks to bypass strict constraints on completely blank panels
        for form in receipt_formset.forms:
            has_name = bool(form.data.get(f"{form.prefix}-name"))
            has_val = form.data.get(f"{form.prefix}-value") not in [
                None,
                "",
                "0.00",
                "0",
            ]
            # FIXED: Read file data directly from request.FILES using the explicit form prefix naming structure
            has_file = bool(request.FILES.get(f"{form.prefix}-image"))

            # If the user hasn't typed anything into this row, permit empty submissions
            if has_name and has_val or has_file:
                form.empty_permitted = False

        # 2. Execute validation tracking checks
        if takings_form.is_valid() and receipt_formset.is_valid():
            event = Events.objects.get(pk=takings_form["event"].value())
            submitted_by = Staff.objects.get(pk=takings_form["submitted_by"].value())
            # Save your cash total matrix record directly to the database
            # Save core takings object metrics directly to database logs
            takings_instance = takings_form.save()
            messages.success(request, "Daily takings saved")

            # 3. Save each valid filled-out receipt dynamically as standalone logs
            receipts_saved_count = 0
            saved_receipt_instances = []
            receipt_image_files = []
            for receipt_form in receipt_formset.forms:
                if not receipt_form.empty_permitted:
                    if receipt_form.cleaned_data and not receipt_form.cleaned_data.get(
                        "DELETE", False
                    ):
                        # Extract the raw file object directly from the form's cleaned data
                        receipt_image_file = receipt_form.cleaned_data.get("image")
                        receipt_image_files.append(receipt_image_file)
                        receipt_file_name = receipt_image_file.name
                        print("receipt_file_name = ", receipt_file_name)
                        # Saves the row as an independent row record inside the Receipts table
                        receipt_instance = receipt_form.save(commit=False)
                        receipt_instance.event = event
                        receipt_instance.submitted_by = submitted_by
                        receipt_instance.name = receipt_file_name
                        receipt_instance.save()
                        saved_receipt_instances.append(receipt_instance)
                        receipts_saved_count += 1
            if receipts_saved_count > 0:
                messages.success(
                    request, f"{receipts_saved_count} Receipts submitted successfully!"
                )

            print("saved_receipt_instances = ", saved_receipt_instances)
            # BULLETPROOF BASIC EMAIL TEST (NO ATTACHMENTS)
            # -----------------------------------------------------------------
            try:
                # Compile a snapshot data dictionary matching the active entries
                # 1. Dynamically calculate the precise sum of all coin values
                total_coins_count = (
                    (takings_instance.one_cent or 0)
                    + (takings_instance.two_cent or 0)
                    + (takings_instance.five_cent or 0)
                    + (takings_instance.ten_cent or 0)
                    + (takings_instance.twenty_cent or 0)
                    + (takings_instance.fifty_cent or 0)
                    + (takings_instance.one_euro or 0)
                    + (takings_instance.two_euro or 0)
                )
                total_coins_value = (
                    (takings_instance.one_cent_value or 0.00)
                    + (takings_instance.two_cent_value or 0.00)
                    + (takings_instance.five_cent_value or 0.00)
                    + (takings_instance.ten_cent_value or 0.00)
                    + (takings_instance.twenty_cent_value or 0.00)
                    + (takings_instance.fifty_cent_value or 0.00)
                    + (takings_instance.one_euro_value or 0.00)
                    + (takings_instance.two_euro_value or 0.00)
                )

                # 2. Dynamically calculate the precise sum of all note values
                total_notes_count = (
                    (takings_instance.five_euro or 0)
                    + (takings_instance.ten_euro or 0)
                    + (takings_instance.twenty_euro or 0)
                    + (takings_instance.fifty_euro or 0)
                    + (takings_instance.one_hundred_euro or 0)
                    + (takings_instance.two_hundred_euro or 0)
                )
                total_notes_value = (
                    (takings_instance.five_euro_value or 0.00)
                    + (takings_instance.ten_euro_value or 0.00)
                    + (takings_instance.twenty_euro_value or 0.00)
                    + (takings_instance.fifty_euro_value or 0.00)
                    + (takings_instance.one_hundred_euro_value or 0.00)
                    + (takings_instance.two_hundred_euro_value or 0.00)
                )
                total_cash_takings = total_coins_value + total_notes_value

                total_vouchers_count = (
                    (takings_instance.two_for_one_vouchers or 0)
                    + (takings_instance.ten_for_eleven_vouchers or 0)
                    + (takings_instance.customer_20_off_vouchers or 0)
                    + (takings_instance.austeller_20_off_vouchers or 0)
                    + (takings_instance.student_discount_vouchers or 0)
                    + (takings_instance.oap_discount_vouchers or 0)
                    + (takings_instance.five_euro_off_vouchers or 0)
                )

                # 1. Locate your CSS file path dynamically
                css_path = os.path.join(
                    settings.BASE_DIR,
                    "version_2",
                    "static",
                    "version_2",
                    "css",
                    "reports_email.css",
                )

                # 2. Read the raw text inside the CSS file safely
                try:
                    with open(css_path, "r", encoding="utf-8") as f:
                        css_content = f.read()
                except FileNotFoundError:
                    css_content = ""  # Fallback if file is missing during testing

                email_context = {
                    "takings": takings_instance,
                    "receipts": saved_receipt_instances,
                    "event": event,
                    "submitted_by": submitted_by,
                    "timestamp": timezone.localtime(timezone.now()).strftime(
                        "%d/%m/%Y %H:%M:%S"
                    ),
                    "drinks_report": drinks_report,
                    "food_report": food_report,
                    "gifts_report": gifts_report,
                    "total_waste": total_waste,
                    "total_complimentary": total_complimentary,
                    "total_discount_value": total_discount_value,
                    "total_card": total_card,
                    "total_cash": total_cash,
                    "total_quantity": total_quantity,
                    "total_coins_count": total_coins_count,
                    "total_notes_count": total_notes_count,
                    "total_coins_value": total_coins_value,
                    "total_notes_value": total_notes_value,
                    "total_cash_takings": round(total_cash_takings, 2),
                    "vouchers": vouchers,
                    "total_vouchers_count": total_vouchers_count,
                    "total_vouchers_recorded": total_vouchers_recorded,
                    "total_vouchers_value": total_vouchers_value,
                    "css_styles": css_content,
                }

                # Compile header metadata fields
                t_date_str = (
                    takings_instance.trading_date.strftime("%d-%m-%Y")
                    if takings_instance.trading_date
                    else "No Date"
                )
                email_subject = f"Daily Takings Summary - {event.name if event else 'No Event'} - {t_date_str}"
                # 1 Render document layout template to string structure
                html_body_content = render_to_string(
                    "version_2/reports_email.html", email_context
                )
                # 2. Initialize the email wrapper (leave body blank initially or pass HTML directly)
                email = EmailMessage(
                    subject=email_subject,
                    body=html_body_content,
                    to=["cathal@thepopupirishpub.com"],
                    cc=["peterwkellett@gmail.com"],
                )

                for image in receipt_image_files:
                    image.seek(0)
                    email.attach(image.name, image.read(), image.content_type)
                # 3. CRITICAL: Inform email software (like Gmail) to render this as an HTML page, not plain text [1]
                email.content_subtype = "html"

                # 4 Create spreadsheet of thedays orders
                try:
                    excel_buffer = generate_epos_excel_buffer(trading_date)

                except Exception as e:
                    messages.error(
                        request, f"Failed to dispatch report data email: {str(e)}"
                    )

                email.attach(
                    f"epos_report_{event.name}_{trading_date}.xlsx",
                    excel_buffer.getvalue(),  # Extracts the inner raw binary data string
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  # Explicit Excel MIME type
                )

                # Fire data payload safely over Gmail SMTP infrastructure
                email.send(fail_silently=False)
                print("→ EMAIL DISPATCHED VIA GMAIL SUCCESSFULLY.")
                messages.success(request, "Email sent")
                # return redirect('index_v2')
            except Exception as e:
                print("→ EMAIL ENGINE ERROR BLOCK: ", str(e))
                messages.error(request, f"EMAIL ENGINE ERROR BLOCK: {str(e)}")
            # -----------------------------------------------------------------

            return redirect("index_v2")
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
            event = Events.objects.get(
                date_from__lte=date.today(), date_to__gte=date.today()
            )
        except Events.DoesNotExist:
            event = None
        takings_form = EndOfDayTakingsForm(
            initial={
                "trading_date": default_date,
                "event": event,
                "submitted_by": staff_id,
            }
        )
        receipt_formset = ReceiptsFormSet(queryset=Receipts.objects.none())

    # FIX: Building the context dictionary explicitly right before rendering
    # ensures it always has valid form data, even if validation fails.
    context = {"takings_form": takings_form, "receipt_formset": receipt_formset}

    return render(request, "version_2/eod_takings.html", context)



# Triggered when Eod_takings is triggered. It generates the excel spreadsheet.
def generate_epos_excel_buffer(trading_date):
    """
    Generates the optimized transactions spreadsheet without cell merging.
    Returns: BytesIO object containing the raw spreadsheet binary data.
    """
    orders = LineItemV2.objects.filter(
        transaction__order_date__date=trading_date
    ).select_related("transaction", "category", "subcategory", "subsubcategory")

    data = {
        "line_ID": [],
        "trans_ID": [],
        "order_date": [],
        "order_time": [],
        # 'qty_of_products': [],
        # 'products_total': [],
        "pfand_total": [],
        "total_due": [],
        "tendered_amount": [],
        "change_due": [],
        "payment_method": [],
        "payment_reason": [],
        "staff_member": [],
        "product_name": [],
        "product_size": [],
        "price_unit": [],
        "quantity": [],
        "line_total": [],
        "discount": [],
        "discount_type": [],
        "category": [],
        "subcategory": [],
        "subsubcategory": [],
    }

    for order in orders:
        tx = order.transaction
        data["line_ID"].append(order.id)
        data["trans_ID"].append(tx.transaction_number if tx else "")
        data["order_date"].append(tx.order_date.strftime("%d/%m/%Y") if tx else "")
        data["order_time"].append(tx.order_date.strftime("%H:%M:%S") if tx else "")
        # data['qty_of_products'].append(tx.number_of_products if tx else 0)
        # data['products_total'].append(tx.drinks_food_total if tx else 0)
        data["pfand_total"].append(tx.pfand_total if tx else 0)
        data["total_due"].append(tx.total_due if tx else 0)
        data["tendered_amount"].append(tx.tendered_amount if tx else 0)
        data["change_due"].append(tx.change_due if tx else 0)
        data["payment_method"].append(tx.payment_method if tx else "")
        data["payment_reason"].append(tx.payment_reason if tx else "")
        data["staff_member"].append(tx.staff_member if tx else "")

        data["product_name"].append(order.name)
        data["product_size"].append(order.size)
        data["price_unit"].append(order.price_unit)
        data["quantity"].append(order.quantity)
        data["line_total"].append(order.price_line_total)
        data["discount"].append(
            (order.price_unit * order.quantity) - order.price_line_total
        )
        data["discount_type"].append(order.discount)

        data["category"].append(order.category.name if order.category else "")
        data["subcategory"].append(order.subcategory.name if order.subcategory else "")
        data["subsubcategory"].append(
            order.subsubcategory.name if order.subsubcategory else ""
        )

    df = pd.DataFrame(data)

    for col in df.columns:
        df[col] = df[col].apply(
            lambda x: (
                str(x) if isinstance(x, (UUID, Decimal)) or hasattr(x, "_meta") else x
            )
        )

    buffer = io.BytesIO()

    with pd.ExcelWriter(buffer, engine="xlsxwriter") as writer:
        df.to_excel(writer, index=False, sheet_name="Transactions")
        workbook = writer.book
        worksheet = writer.sheets["Transactions"]

        header_fmt = workbook.add_format(
            {"bold": True, "bg_color": "#D7E4BC", "align": "center", "border": 1}
        )
        cell_fmt = workbook.add_format(
            {"valign": "vcenter", "align": "left", "border": 1}
        )

        # Format header row
        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_fmt)

        # Apply cell borders and alignment across all rows and columns without merging
        for row_idx in range(len(df)):
            # Excel rows start at 1 because index 0 is the header
            excel_row = row_idx + 1
            for col_idx in range(len(df.columns)):
                val = df.iloc[row_idx, col_idx]
                worksheet.write(excel_row, col_idx, val, cell_fmt)

        # Autofit column widths
        for i, col in enumerate(df.columns):
            max_len = max(df[col].astype(str).map(len).max(), len(col)) + 3
            worksheet.set_column(i, i, min(max_len, 50))

    buffer.seek(0)
    return buffer

# Used to extract the lineItems manually and save as download to the device.
def export_data(request):
    # 1. OPTIMIZATION: One single SQL query using select_related to kill the N+1 problem
    orders = LineItemV2.objects.all().select_related(
        "transaction", "category", "subcategory", "subsubcategory"
    )

    data = {
        "line_ID": [],
        "trans_ID": [],
        "order_date": [],
        "order_time": [],
        "qty_of_products": [],
        "products_total": [],
        "pfand_total": [],
        "total_due": [],
        "tendered_amount": [],
        "change_due": [],
        "payment_method": [],
        "payment_reason": [],
        "staff_member": [],
        "product_name": [],
        "product_size": [],
        "price_unit": [],
        "quantity": [],
        "line_total": [],
        "discount": [],
        "discount_type": [],
        "parent_cat": [],
        "sub_cat_1": [],
        "sub_cat_2": [],
    }

    for order in orders:
        tx = order.transaction  # Local caching variable for micro-optimization

        data["line_ID"].append(order.id)
        data["trans_ID"].append(tx.transaction_number if tx else "")
        data["order_date"].append(tx.order_date.strftime("%d/%m/%Y") if tx else "")
        data["order_time"].append(tx.order_date.strftime("%H:%M:%S") if tx else "")
        data["qty_of_products"].append(tx.number_of_products if tx else 0)
        data["products_total"].append(tx.drinks_food_total if tx else 0)
        data["pfand_total"].append(tx.pfand_total if tx else 0)
        data["total_due"].append(tx.total_due if tx else 0)
        data["tendered_amount"].append(tx.tendered_amount if tx else 0)
        data["change_due"].append(tx.change_due if tx else 0)
        data["payment_method"].append(tx.payment_method if tx else "")
        data["payment_reason"].append(tx.payment_reason if tx else "")
        data["staff_member"].append(tx.staff_member if tx else "")

        data["product_name"].append(order.name)
        data["product_size"].append(order.size)
        data["price_unit"].append(order.price_unit)
        data["quantity"].append(order.quantity)
        data["line_total"].append(order.price_line_total)
        data["discount"].append(
            (order.price_unit * order.quantity) - order.price_line_total
        )
        data["discount_type"].append(order.discount)

        data["parent_cat"].append(order.category.name if order.category else "")
        data["sub_cat_1"].append(order.subcategory.name if order.subcategory else "")
        data["sub_cat_2"].append(
            order.subsubcategory.name if order.subsubcategory else ""
        )

    df = pd.DataFrame(data)

    # 2. CLEANING: Safe type conversions
    for col in df.columns:
        df[col] = df[col].apply(
            lambda x: (
                str(x) if isinstance(x, (UUID, Decimal)) or hasattr(x, "_meta") else x
            )
        )

    buffer = io.BytesIO()

    # 3. SECURE EXCEL LAYOUT ENGINE LINK
    with pd.ExcelWriter(buffer, engine="xlsxwriter") as writer:
        df.to_excel(writer, index=False, sheet_name="Transactions")

        workbook = writer.book
        worksheet = writer.sheets["Transactions"]

        # Styles
        header_fmt = workbook.add_format(
            {"bold": True, "bg_color": "#D7E4BC", "align": "center", "border": 1}
        )
        merge_fmt = workbook.add_format(
            {"valign": "vcenter", "align": "left", "border": 1}
        )

        # Rewrite Header formatting explicitly
        for col_num, value in enumerate(df.columns.values):
            worksheet.write(0, col_num, value, header_fmt)

        # 4. SAFE TRANSACTION CELL MERGING WORKFLOW
        for trans_id in df["trans_ID"].unique():
            indices = df.index[df["trans_ID"] == trans_id].tolist()

            if len(indices) > 1:
                # Add 1 because Excel row index 0 is occupied by headers
                first_row = indices[0] + 1
                last_row = indices[-1] + 1

                # Transaction metadata block columns (Indices 0 to 12)
                columns_to_group = list(range(0, 13))

                for col in columns_to_group:
                    val = df.iloc[indices[0], col]

                    # CRITICAL FIX: Clear the data inside the cell ranges *before* invoking merge_range
                    # This prevents XlsxWriter from throwing data-corruption collisions
                    for r in range(first_row + 1, last_row + 1):
                        worksheet.write_blank(r, col, None)

                    worksheet.merge_range(first_row, col, last_row, col, val, merge_fmt)
            else:
                # Format single standalone rows with the standard non-merged grid boundaries
                row_idx = indices[0] + 1
                for col in range(0, 13):
                    val = df.iloc[indices[0], col]
                    worksheet.write(row_idx, col, val, merge_fmt)

        # 5. DYNAMIC COLUMN AUTO-FIT SIZER
        for i, col in enumerate(df.columns):
            # Evaluate maximum string length within this column context to prevent text clipping
            max_len = max(df[col].astype(str).map(len).max(), len(col)) + 3
            worksheet.set_column(
                i, i, min(max_len, 50)
            )  # Cap extreme lengths at 50 chars

    buffer.seek(0)
    response = HttpResponse(
        buffer.getvalue(),
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    response["Content-Disposition"] = 'attachment; filename="epos_report.xlsx"'
    return response


# #######################
def reports_v2(request):
    """A view to return the past orders page"""
    print("NOW = ", datetime.now())
    entries = LineItemV2.objects.all().values(
        "transaction__transaction_number",
        "transaction__order_date",
        # 'grand_totals',
        "category__name",
        "subcategory__name",
        "subsubcategory__name",
        "name",
        "quantity",
        "size",
        "price_unit",
        "price_line_total",
        "discount",
        "transaction__payment_method",
        "transaction__payment_reason",
        "transaction__staff_member",
    )
    staff = []
    categories = []
    drinks = []
    food = []
    gifts = []
    sizes = []
    payment = []
    # for entry in entries:
        # print("entry = ", entry)
        # if entry['category__name'] == 'food' and entry['discount'] != '':
        #     print("entry = ", entry)
    #     if not entry["transaction__staff_member"] in staff:
    #         staff.append(entry["transaction__staff_member"])
    #     if not entry["category__name"] in categories:
    #         categories.append(entry["category__name"])
    #     if not entry["name"] in drinks and not "food" in entry["category"].lower() and not "gifts" in entry["category"].lower():
    #         drinks.append(entry["name"])
    #     if "food" in entry["category"].lower() and not entry["name"] in food:
    #         food.append(entry["name"])
    #     if "gifts" in entry["category"].lower() and not entry["name"] in gifts:
    #         gifts.append(entry["name"])
    #     if not entry["size"] in sizes:
    #         sizes.append(entry["size"])
    #     if not entry["grand_totals_id__payment_method"] in payment:
    #         payment.append(entry["grand_totals_id__payment_method"])
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
        from_date = datetime.strptime(
            request.GET["from_date"], "%a, %d %b %Y %H:%M:%S %Z"
        )
        to_date = datetime.strptime(request.GET["to_date"], "%a, %d %b %Y %H:%M:%S %Z")
        print("from_date = ", from_date)
        print("to_date = ", to_date)
        entries = entries.filter(order_date_li__range=(from_date, to_date))
        print("entries = ", entries.count())
        return JsonResponse({"orders": list(entries)}, safe=False)

    else:
        # latest_entry = LineItemV2.objects.latest('transaction__order_date')
        # latest_date = latest_entry.transaction__order_date
        # print("latest_date = ", latest_date)
        # if latest_date.hour < 10:
        #     from_date = latest_date.replace(hour=10, minute=00, second=00) + timedelta(-1)
        #     to_date = latest_date.replace(hour=2, minute=00, second=00)
        #     # print("from_date = ", from_date)
        #     # print("to_date = ", to_date)
        # else:
        #     from_date = latest_date.replace(hour=10, minute=00, second=00)
        #     to_date = latest_date.replace(hour=2, minute=00, second=00) + timedelta(1)
        #     # print("from_date = ", from_date)
        #     # print("to_date = ", to_date)
        # entries = entries.filter(order_date_li__range=(from_date, to_date))

        context = {
            "data": list(entries),
            "staff": staff,
            "categories": categories,
            "drinks": drinks,
            "food": food,
            "gifts": gifts,
            "sizes": sizes,
            "payment": payment,
            # "earliest_date": from_date,
            # "latest_date": to_date,
            "date_now": date_now,
            "date_yesterday": date_yesterday,
        }
        return render(request, "version_2/reports_v2.html", context)