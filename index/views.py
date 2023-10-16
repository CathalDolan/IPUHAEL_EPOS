from django.shortcuts import render, redirect
from . models import Draught, HalfAndHalf, Shandy, CanAndBottle, Spirit, SoftDrink, HotNonAlcoholic, HotAlcoholic, HotToddy, Shot, Food


def index(request):
    """ A view to return the index page """
    draughts = Draught.objects.all()
    halfandhalfs = HalfAndHalf.objects.all()
    shandys = Shandy.objects.all()
    canandbottles = CanAndBottle.objects.all()
    spirits = Spirit.objects.all()
    softdrinks = SoftDrink.objects.all()
    hotnonalcoholics = HotNonAlcoholic.objects.all()
    hotalcoholics = HotAlcoholic.objects.all()
    hottoddys = HotToddy.objects.all()
    shots = Shot.objects.all()
    foods = Food.objects.all()
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


