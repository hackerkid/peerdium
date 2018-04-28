from django.shortcuts import render
from django.http import JsonResponse

from editor.models import Document

def home(request):
    return render(request, "editor.html")

def publish(request):
    if request.method == "POST":
        magnet_link = request.POST.get("magnet_link", "")
        (obj, created) = Document.objects.get_or_create(magnet_link=magnet_link)
        return JsonResponse({"secret_id": obj.secret_id})

def retrieve(request, secret_id):
    return render(request, "editor.html")
