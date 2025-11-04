"""Shared dependencies for the application."""
from app.config import settings


def get_settings():
    """Get application settings."""
    return settings

