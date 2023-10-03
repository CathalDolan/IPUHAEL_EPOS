from django.shortcuts import render
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
    template = 'home/index.html'
    return render(request, template, context)


def past_orders(request):
    """ A view to return the past orders page """
    return render(request, 'home/past_orders.html')


def takings(request):
    """ A view to return the past orders page """
    return render(request, 'home/takings.html')


def reports(request):
    """ A view to return the past orders page """
    return render(request, 'home/reports.html')


