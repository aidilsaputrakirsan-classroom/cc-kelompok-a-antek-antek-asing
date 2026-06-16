"""
In-Memory Metrics Collector with Alerting Logic.
"""
import time
import threading
import logging
from typing import Dict, List, Any, Tuple

logger = logging.getLogger(__name__)

class MetricsCollector:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(MetricsCollector, cls).__new__(cls)
                cls._instance._init_metrics()
            return cls._instance

    def _init_metrics(self) -> None:
        self.start_time: float = time.time()
        self.request_count: int = 0
        self.error_count: int = 0
        self.latencies: List[float] = []
        self.endpoint_stats: Dict[str, Dict[str, int]] = {}
        # Stores tuples of (timestamp, is_error) for the 60s sliding window
        self.recent_requests: List[Tuple[float, bool]] = []

    def record_request(self, path: str, method: str, status_code: int, duration_ms: float) -> None:
        with self._lock:
            self.request_count += 1
            # Only count server-side (5xx) failures as "errors" for health metrics.
            # 4xx (wrong password, validation, not-found, etc.) are expected client
            # traffic, not system failures, so they shouldn't show up as errors on
            # the System Status page.
            is_error = status_code >= 500
            if is_error:
                self.error_count += 1

            self.latencies.append(duration_ms)
            if len(self.latencies) > 1000:
                self.latencies = self.latencies[-1000:]

            endpoint_key = f"{method} {path}"
            if endpoint_key not in self.endpoint_stats:
                self.endpoint_stats[endpoint_key] = {"count": 0, "errors": 0}
            
            self.endpoint_stats[endpoint_key]["count"] += 1
            if is_error:
                self.endpoint_stats[endpoint_key]["errors"] += 1

            now = time.time()
            self.recent_requests.append((now, is_error))
            
            # Remove requests older than 60 seconds
            cutoff = now - 60.0
            while self.recent_requests and self.recent_requests[0][0] < cutoff:
                self.recent_requests.pop(0)

            # LEAD BACKEND ALERTING LOGIC
            total_recent = len(self.recent_requests)
            if total_recent > 10:
                recent_errors = sum(1 for req in self.recent_requests if req[1])
                error_rate = recent_errors / total_recent
                
                if error_rate > 0.10: # > 10%
                    logger.critical(
                        "High Error Rate Detected",
                        extra={
                            "alert": True,
                            "current_error_rate": round(error_rate * 100, 2),
                            "total_requests_last_minute": total_recent,
                            "errors_last_minute": recent_errors
                        }
                    )

    def get_metrics(self) -> Dict[str, Any]:
        with self._lock:
            sorted_latencies = sorted(self.latencies) if self.latencies else [0]
            n = len(sorted_latencies)
            avg = sum(sorted_latencies) / n if n > 0 else 0
            p50 = sorted_latencies[int(n * 0.5)] if n > 0 else 0
            p95 = sorted_latencies[int(n * 0.95)] if n > 0 else 0
            p99 = sorted_latencies[int(n * 0.99)] if n > 0 else 0
            error_rate_percent = (
                round((self.error_count / self.request_count) * 100, 2)
                if self.request_count > 0
                else 0
            )

            return {
                "request_count": self.request_count,
                "error_count": self.error_count,
                "error_rate_percent": error_rate_percent,
                "uptime_seconds": round(time.time() - self.start_time, 2),
                "latencies_ms": {
                    "avg": round(avg, 2),
                    "p50": round(p50, 2),
                    "p95": round(p95, 2),
                    "p99": round(p99, 2),
                    "samples": n,
                },
                "endpoint_stats": self.endpoint_stats
            }

metrics = MetricsCollector()
