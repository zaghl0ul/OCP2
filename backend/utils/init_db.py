import logging
import os
from utils.db_manager import init_db, get_db_session
from models.repositories import SettingsRepository

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def initialize_database():
    """Initialize the database and load default settings"""
    try:
        # Create database tables
        init_db()
        logger.info("Database initialized successfully")
        
        # Load default settings
        with get_db_session() as db:
            # Default model settings
            SettingsRepository.create_or_update_setting(db, "model_settings", "default_provider", "openai")
            SettingsRepository.create_or_update_setting(db, "model_settings", "temperature", 0.7)
            SettingsRepository.create_or_update_setting(db, "model_settings", "max_tokens", 2000)
            
            # Default app settings
            SettingsRepository.create_or_update_setting(db, "app_settings", "theme", "dark")
            SettingsRepository.create_or_update_setting(db, "app_settings", "language", "en")
            SettingsRepository.create_or_update_setting(db, "app_settings", "auto_save", True)
            
            logger.info("Default settings initialized")
            
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

if __name__ == "__main__":
    initialize_database()
    logger.info("Database initialization complete!") 