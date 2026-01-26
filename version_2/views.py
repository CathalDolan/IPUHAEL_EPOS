from django.shortcuts import render

# Create your views here.
def index_v2(request):
    print("index_v2")
    return render (request, 'version_2/index_v2.html')