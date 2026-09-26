release: python manage.py migrate --noinput
web: gunicorn config.wsgi --bind 0.0.0.0:${PORT:-8000} --workers ${WEB_CONCURRENCY:-3} --timeout 60 --access-logfile -
worker: python manage.py process_jobs --loop --interval 20
