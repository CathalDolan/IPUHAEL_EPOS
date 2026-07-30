release: python manage.py migrate
web: gunicorn ipuhael_epos.wsgi
worker: python manage.py qcluster