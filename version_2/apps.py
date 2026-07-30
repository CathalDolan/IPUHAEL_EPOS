from django.apps import AppConfig
import sys

class Version2Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'version_2'

    def ready(self):
        # Only register schedules if running the actual server, worker, or web dyno
        if any(cmd in sys.argv for cmd in ['runserver', 'qcluster', 'web']):
            try:
                from django_q.models import Schedule
                from django_q.tasks import schedule
                from django.utils import timezone
                import datetime

                task_name = 'version_2.tasks.daily_3am_event_check'
                
                # Check if the schedule already exists to avoid duplication
                if not Schedule.objects.filter(func=task_name).exists():
                    now = timezone.localtime()
                    target_time = datetime.time(3, 0, 0)
                    next_run_date = now.date()

                    # If it is already past 3 AM today, target tomorrow at 3 AM
                    if now.time() >= target_time:
                        next_run_date += datetime.timedelta(days=1)

                    next_run_dt = timezone.make_aware(datetime.datetime.combine(next_run_date, target_time))

                    # Register the daily task into the database
                    schedule(
                        task_name,
                        schedule_type=Schedule.DAILY,
                        next_run=next_run_dt
                    )
                    print(f"Task successfully scheduled. First run: {next_run_dt}")
            except Exception:
                # Safe fallback if database tables are not migrated yet
                pass


