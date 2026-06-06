"""
Shared structured JSON logging configuration.
"""
import os
import sys
import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict

SERVICE_NAME = os.getenv("SERVICE_NAME", "unknown-service")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging."""
    
    def format(self, record: logging.LogRecord) -> str:
        log_entry: Dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "service": SERVICE_NAME,
            "logger": record.name,
            "message": record.getMessage(),
        }
        
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
            
        standard_attrs = {
            'args', 'asctime', 'created', 'exc_info', 'exc_text', 'filename',
            'funcName', 'levelname', 'levelno', 'lineno', 'module',
            'msecs', 'message', 'msg', 'name', 'pathname', 'process',
            'processName', 'relativeCreated', 'stack_info', 'thread', 'threadName'
        }
        
        for key, value in record.__dict__.items():
            if key not in standard_attrs:
                log_entry[key] = value

        return json.dumps(log_entry)

def setup_logging() -> None:
    """Initialize the structured JSON logging configuration."""
    logger = logging.getLogger()
    level = getattr(logging, LOG_LEVEL, logging.INFO)
    logger.setLevel(level)
    
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
        
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    logger.addHandler(handler)
    
    for name in ["uvicorn", "uvicorn.access", "uvicorn.error", "fastapi"]:
        uvicorn_logger = logging.getLogger(name)
        uvicorn_logger.handlers = [handler]
        uvicorn_logger.propagate = False
        uvicorn_logger.setLevel(level)
