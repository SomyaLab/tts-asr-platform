"""Configuration management for the application."""
import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "TTS-ASR Platform"
    VERSION: str = "1.0.0"
    
    # LitServe Server Configuration
    LITSERVE_SERVER_URL: str = "http://localhost:8000"
    
    # Model Base URL (points to LitServe /predict endpoint)
    MODEL_BASE_URL: str = ""
    
    # Audio Processing Configuration
    MAX_AUDIO_SIZE_MB: int = 50
    MAX_AUDIO_DURATION_SEC: int = 300
    NOISE_SUPPRESSION_ENABLED: bool = True
    
    # CORS Configuration (comma-separated string, will be split)
    CORS_ORIGINS_STR: str = "http://localhost:5173,http://localhost:3000,http://localhost:8000"
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8082
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Supported Languages
    SUPPORTED_LANGUAGES: List[str] = ["en", "hi", "kn", "te", "ma", "sa"]
    SUPPORTED_GENDERS: List[str] = ["male", "female"]
    
    # Email Configuration
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""
    SMTP_USE_TLS: bool = True
    CONTACT_EMAIL_RECIPIENT: str = "rajath@somya.ai"
    CONTACT_EMAIL_SUBJECT: str = "New Contact Form Submission - Somya Labs"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # Set MODEL_BASE_URL to LitServe /predict endpoint if not explicitly set
        if not self.MODEL_BASE_URL:
            self.MODEL_BASE_URL = f"{self.LITSERVE_SERVER_URL.rstrip('/')}/predict"
    
    @property
    def CORS_ORIGINS(self) -> List[str]:
        """Split CORS origins string into list."""
        return [origin.strip() for origin in self.CORS_ORIGINS_STR.split(",") if origin.strip()]


settings = Settings()

