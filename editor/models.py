from django.db import models
from django.contrib.auth.models import User

import random
import string

def generate_secret_id():
    return "".join(random.SystemRandom().choice(string.ascii_lowercase + string.digits) for _ in range(Document.MAX_SECRET_ID_LENGTH))

class Document(models.Model):
    MAX_SECRET_ID_LENGTH = 32
    MAX_TITLE_LENGTH = 32
    ip_address = models.CharField(max_length=50, blank=True)
    magnet_link = models.TextField()
    secret_id = models.CharField(max_length=MAX_SECRET_ID_LENGTH, default=generate_secret_id, db_index=True)
    title = models.CharField(max_length=MAX_TITLE_LENGTH, db_index=True, blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)

    def get_secret_id(self):
        return self.secret_id
