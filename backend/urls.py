from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from django.views.decorators.csrf import csrf_exempt
from smalldata import views


router = routers.DefaultRouter()
router.register(r'utterances', views.UtteranceView, 'utterance')
router.register(r'categories', views.CategoryView, 'category')
router.register(r'training_utterances', views.TrainingUtteranceView, 'training_utterance')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/categories/<int:pk>/trigger', csrf_exempt(views.trigger_category)),
    path('api/song_state/', views.song_state),
    path("", views.index, name="index")
]
