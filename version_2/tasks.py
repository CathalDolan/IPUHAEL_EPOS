# myapp/tasks.py
from django.utils import timezone
from .models import Events, LineItemV2
import datetime
from .views import generate_epos_excel_buffer, eod_takings, daily_stock_take

from django.db.models import F, Sum, Count, Case, When, DecimalField, ExpressionWrapper
from decimal import Decimal
from django.conf import settings
import os
from django.template.loader import render_to_string
from django.core.mail import EmailMessage

def daily_3am_event_check():
    """
    Runs at 3:00 AM daily. 
    Checks if any event occurred on the previous calendar day.
    """
    print("--- 1-Minute Timer Fired: Checking for events... ---")
    today = timezone.localdate()
    yesterday = today - datetime.timedelta(days=1)
    
    # Define the start and end of yesterday (00:00:00 to 23:59:59)
    start_of_yesterday = timezone.make_aware(datetime.datetime.combine(yesterday, datetime.time.min))
    end_of_yesterday = timezone.make_aware(datetime.datetime.combine(yesterday, datetime.time.max))
    
    # Look for events that were active at any point during yesterday
    try:
        event = Events.objects.get(date_from__lte=yesterday, date_to__gte=yesterday)
    
    except:
        print("No events found for yesterday. Task skipped.")
        return

    # --- Place the function code you want to run here ---
    print("Events found for yesterday! Executing 3 AM function logic...")
    print(event)
    trading_date = yesterday
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
        .filter(product__category__name="drink")
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
        .filter(product__category__name="food")
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
        .filter(product__category__name="gift")
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

    # Get the volumes of each product
    try:
        volumes = daily_stock_take(trading_date)
    except:
        print("volumes except block = ",)
        volumes = {}
    print("volumes = ", volumes)

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
    except FileNotFoundError as e:
        print(f"email css file not found - {str(e)}")
        css_content = ""  # Fallback if file is missing during testing

    email_context = {
        "takings": "",
        "receipts": "",
        "event": event,
        "submitted_by": "Automated System Generated",
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
        "total_coins_count": "",
        "total_notes_count": "",
        "total_coins_value": "",
        "total_notes_value": "",
        "total_cash_takings": "",
        "vouchers": vouchers,
        "total_vouchers_count": "",
        "total_vouchers_recorded": total_vouchers_recorded,
        "total_vouchers_value": total_vouchers_value,
        "volumes": volumes,
        "css_styles": css_content,
    }

    # Compile header metadata fields
    t_date_str = trading_date.strftime("%d-%m-%Y")
    email_subject = f"Daily Takings Summary - {event.name if event else 'No Event'} - {t_date_str}"
    # 1 Render document layout template to string structure
    html_body_content = render_to_string(
        "version_2/reports_email.html", email_context
    )
    # 2. Initialize the email wrapper (leave body blank initially or pass HTML directly)
    email = EmailMessage(
        subject=email_subject,
        body=html_body_content,
        to=["peterwkellett@gmail.com"],
        # to=["cathal@thepopupirishpub.com"],
        # cc=["peterwkellett@gmail.com"],
    )
    
    # 3. CRITICAL: Inform email software (like Gmail) to render this as an HTML page, not plain text [1]
    email.content_subtype = "html"

    # 4 Create spreadsheet of thedays orders
    try:
        excel_buffer = generate_epos_excel_buffer(trading_date)

    except Exception as e:
        print(f"Failed to dispatch report data email: {str(e)}")

    email.attach(
        f"epos_report_{event.name}_{trading_date}.xlsx",
        excel_buffer.getvalue(),  # Extracts the inner raw binary data string
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  # Explicit Excel MIME type
    )

    # Fire data payload safely over Gmail SMTP infrastructure
    email.send(fail_silently=False)
    print("→ EMAIL DISPATCHED VIA GMAIL SUCCESSFULLY.")
    # return redirect('index_v2')

    return
    
