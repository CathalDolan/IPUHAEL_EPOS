from django.shortcuts import render, redirect
from . models import Product, GrandTotal, LineItem


def index(request):
    """ A view to return the index page """
    draughts = Product.objects.all().filter(category="draught")
    for draught in draughts:
        print(draught)
    halfandhalfs = Product.objects.all().filter(category="halfandhalfs")
    shandys = Product.objects.all().filter(category="shandys")
    canandbottles = Product.objects.all().filter(category="cans_and_bottles")
    spirits = Product.objects.all().filter(category="spirits_and_liquers")
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


