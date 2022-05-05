from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.conf.urls.static import static
from smalldata import views


router = routers.DefaultRouter()
router.register(r'utterances', views.UtteranceView, 'utterance')
router.register(r'categories', views.CategoryView, 'category')
router.register(r'training_utterances', views.TrainingUtteranceView, 'training_utterance')
router.register(r'topics', views.TopicView, 'topic')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/categories/<int:pk>/trigger', csrf_exempt(views.trigger_category)),
    path('api/song_state/', views.song_state),
    path("", views.render_react, name="index"),
    path("set-topic/", views.render_react, name="index"),
]+static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
