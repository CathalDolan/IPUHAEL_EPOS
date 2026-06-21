from django.utils import timezone
import zoneinfo

class TimezoneMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1. Try to get timezone from a cookie set by JavaScript
        tzname = request.COOKIES.get('django_timezone')
        print("tzname = ", tzname)
        # 2. Fallback: Try to get it from the logged-in user profile
        
        # 3. Activate the timezone if valid
        if tzname:
            try:
                timezone.activate(zoneinfo.ZoneInfo(tzname))
            except Exception:
                timezone.deactivate()
        else:
            timezone.deactivate()
            
        return self.get_response(request)