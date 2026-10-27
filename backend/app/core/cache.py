import time
import json
from typing import Any, Optional
import redis
from app.core.config import settings

class MemoryCache:
    """Thread-safe, lightweight in-memory cache with expiration support."""
    def __init__(self):
        self._store: dict[str, tuple[Any, Optional[float]]] = {}

    def get(self, key: str) -> Optional[str]:
        if key in self._store:
            value, expires_at = self._store[key]
            if expires_at is None or expires_at > time.time():
                return value
            del self._store[key]
        return None

    def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        expires_at = time.time() + ex if ex else None
        self._store[key] = (value, expires_at)
        return True

    def delete(self, key: str) -> bool:
        if key in self._store:
            del self._store[key]
            return True
        return False

    def incr(self, key: str) -> int:
        val = self.get(key)
        new_val = int(val) + 1 if val is not None else 1
        self._store[key] = (str(new_val), None)
        return new_val


class CacheService:
    def __init__(self):
        self.redis_client = None
        self.memory_cache = MemoryCache()
        self._init_redis()

    def _init_redis(self):
        try:
            r = redis.from_url(settings.REDIS_URL, socket_timeout=1.0)
            r.ping()
            self.redis_client = r
        except Exception:
            self.redis_client = None

    def get(self, key: str) -> Optional[str]:
        if self.redis_client:
            try:
                val = self.redis_client.get(key)
                return val.decode("utf-8") if isinstance(val, bytes) else val
            except Exception:
                pass
        return self.memory_cache.get(key)

    def set(self, key: str, value: Any, ex: int = 3600) -> bool:
        if isinstance(value, (dict, list)):
            value = json.dumps(value)
        elif not isinstance(value, str):
            value = str(value)

        if self.redis_client:
            try:
                return bool(self.redis_client.set(key, value, ex=ex))
            except Exception:
                pass
        return self.memory_cache.set(key, value, ex=ex)

    def delete(self, key: str) -> bool:
        if self.redis_client:
            try:
                self.redis_client.delete(key)
            except Exception:
                pass
        return self.memory_cache.delete(key)

    def incr(self, key: str, ex: Optional[int] = None) -> int:
        if self.redis_client:
            try:
                val = self.redis_client.incr(key)
                if ex:
                    self.redis_client.expire(key, ex)
                return val
            except Exception:
                pass
        val = self.memory_cache.incr(key)
        return val


cache = CacheService()
