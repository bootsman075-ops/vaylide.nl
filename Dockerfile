# Vaylia als container. Bouwen: docker build -t vaylia .
# Starten: zie README.md (omgevingsvariabelen via --env-file, gegevens op een volume).
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    VIERLIEF_DATA_DIR=/data \
    VIERLIEF_UPLOAD_DIR=/data/uploads

WORKDIR /app
COPY requirements.txt .
RUN python -m pip install -r requirements.txt

COPY . .
# Statische bestanden met versiekenmerk; tijdens het bouwen is nog geen echte sleutel nodig.
RUN DJANGO_DEBUG=false VIERLIEF_ALLOW_DEV_SECRET=true VIERLIEF_DATA_DIR=/tmp/build-data \
    python manage.py collectstatic --noinput \
    && rm -rf /tmp/build-data

RUN useradd --create-home --uid 10001 vierlief \
    && mkdir -p /data/uploads && chown -R vierlief:vierlief /data
USER vierlief
VOLUME ["/data"]
EXPOSE 8000

# Webproces. De worker draait als tweede container met:
#   python manage.py process_jobs --loop
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn config.wsgi --bind 0.0.0.0:8000 --workers ${WEB_CONCURRENCY:-3} --timeout 60 --access-logfile -"]
