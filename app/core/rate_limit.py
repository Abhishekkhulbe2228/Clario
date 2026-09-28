from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
from threading import Lock

from fastapi import HTTPException, Request, status


class InMemoryRateLimiter:
    def __init__(self) -> None:
        self._events: dict[str, deque[datetime]] = defaultdict(deque)
        self._lock = Lock()

    def limit(self, bucket: str, maximum: int, window_seconds: int):
        def dependency(request: Request) -> None:
            client = request.client.host if request.client else "unknown"
            key = f"{bucket}:{client}"
            now = datetime.now(timezone.utc)
            threshold = now - timedelta(seconds=window_seconds)
            with self._lock:
                events = self._events[key]
                while events and events[0] <= threshold:
                    events.popleft()
                if len(events) >= maximum:
                    raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Rate limit exceeded. Please try again shortly.")
                events.append(now)
        return dependency


rate_limiter = InMemoryRateLimiter()
