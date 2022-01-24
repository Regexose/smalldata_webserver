from django.contrib import admin
from .models import Utterance, TrainingUtterance
from import_export import resources
from import_export.admin import ImportExportModelAdmin


class TrainingUtteranceResource(resources.ModelResource):

    class Meta:
        model = TrainingUtterance
        fields = ('id', 'text', 'category')

    def get_instance(self, instance_loader, row):
        """
        copied from https://github.com/django-import-export/django-import-export/issues/92#issuecomment-357919677
        to ignore field 'id' during import
        :param instance_loader:
        :param row:
        :return:
        """
        try:
            params = {}
            for key in instance_loader.resource.get_import_id_fields():
                field = instance_loader.resource.fields[key]
                params[field.attribute] = field.clean(row)
            return self.get_queryset().get(**params)
        except Exception:
            return None


class UtteranceAdmin(admin.ModelAdmin):
    list_display = ('text', )


class TrainingUtteranceAdmin(ImportExportModelAdmin):
    resource_class = TrainingUtteranceResource


# Register your models here.
admin.site.register(Utterance, UtteranceAdmin)
admin.site.register(TrainingUtterance, TrainingUtteranceAdmin)
