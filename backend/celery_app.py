from celery import Celery
import os

broker_url = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
result_backend = os.getenv("CELERY_RESULT_BACKEND", broker_url)

celery_app = Celery("openclip", broker=broker_url, backend=result_backend)
celery_app.conf.task_track_started = True
