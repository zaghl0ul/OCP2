import logging
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional
import os

class Logger:
    """Centralized logging service for OpenClip Pro"""
    
    def __init__(self, name: str = "openclip", level: str = "INFO"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, level.upper()))
        
        # Prevent duplicate handlers
        if not self.logger.handlers:
            self._setup_handlers()
    
    def _setup_handlers(self):
        """Setup console and file handlers"""
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
        )
        
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        console_handler.setLevel(logging.INFO)
        
        # File handler
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        file_handler = logging.FileHandler(
            log_dir / f"openclip_{datetime.now().strftime('%Y%m%d')}.log"
        )
        file_handler.setFormatter(formatter)
        file_handler.setLevel(logging.DEBUG)
        
        self.logger.addHandler(console_handler)
        self.logger.addHandler(file_handler)
    
    def info(self, message: str, **kwargs):
        """Log info message"""
        self.logger.info(self._format_message(message, kwargs))
    
    def error(self, message: str, error: Optional[Exception] = None, **kwargs):
        """Log error message with optional exception"""
        if error:
            self.logger.error(
                f"{self._format_message(message, kwargs)} - Error: {str(error)}",
                exc_info=error
            )
        else:
            self.logger.error(self._format_message(message, kwargs))
    
    def warning(self, message: str, **kwargs):
        """Log warning message"""
        self.logger.warning(self._format_message(message, kwargs))
    
    def debug(self, message: str, **kwargs):
        """Log debug message"""
        self.logger.debug(self._format_message(message, kwargs))
    
    def _format_message(self, message: str, context: dict) -> str:
        """Format message with context"""
        if context:
            context_str = " | ".join([f"{k}: {v}" for k, v in context.items()])
            return f"{message} | {context_str}"
        return message

# Global logger instance
logger = Logger(
    name="openclip",
    level=os.getenv("LOG_LEVEL", "INFO")
) 