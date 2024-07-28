from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse
from simulator.modules import codehandling

def index(request):
    context = {'code': codehandling.parse_lines()}
    return render(request, "home.html", context=context)