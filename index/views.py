from django.shortcuts import render
from . models import Draught, HalfAndHalf, Shandy, CanAndBottle, Spirit, SoftDrink


def index(request):
    """ A view to return the index page """
    draughts = Draught.objects.all()
    halfandhalfs = HalfAndHalf.objects.all()
    shandys = Shandy.objects.all()
    canandbottles = CanAndBottle.objects.all()
    spirits = Spirit.objects.all()
    softdrinks = SoftDrink.objects.all()
    context = {
        'draughts': draughts,
        'halfandhalfs': halfandhalfs,
        'shandys': shandys,
        'canandbottles': canandbottles,
        'spirits': spirits,
        'softdrinks': softdrinks,
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
