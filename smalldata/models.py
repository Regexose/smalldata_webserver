from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=25, unique=True)
    description = models.CharField(max_length=250, blank=True, null=True)
    german_name = models.CharField(max_length=25, unique=True)

    def _str_(self):
        return self.name


class Utterance(models.Model):
    category = models.ForeignKey('Category', on_delete=models.CASCADE, null=True)
    text = models.CharField(max_length=500)
    created = models.DateTimeField(auto_now_add=True)
    topic = models.ForeignKey('Topic', null=True, on_delete=models.CASCADE)
    show = models.ForeignKey('Show', null=True, on_delete=models.CASCADE)

    def _str_(self):
        return self.text


class TrainingUtterance(models.Model):
    category = models.CharField(max_length=500)
    text = models.CharField(max_length=500)
    created = models.DateTimeField(auto_now_add=True)

    def _str_(self):
        return self.text


class Topic(models.Model):
    title = models.CharField(max_length=100)
    text = models.TextField()
    is_current = models.BooleanField(default=False)
    show = models.ForeignKey('Show', null=True, on_delete=models.CASCADE)


class Show(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=250, blank=True, null=True)
    date = models.DateTimeField(blank=True)
    is_current = models.BooleanField(default=False)

    class Meta:
        ordering = ('title',)


class SongState(models.Model):
    state = models.JSONField()

    def _str_(self):
        return self.state
