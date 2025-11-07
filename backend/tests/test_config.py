"""Tests for configuration management."""
import pytest
import os
from unittest.mock import patch
from app.config import Settings


def test_model_base_url_default():
    """Test that MODEL_BASE_URL defaults to /predict endpoint when LITSERVE_SERVER_URL is set."""
    # Mock environment to ensure clean test
    with patch.dict(os.environ, {}, clear=True):
        settings = Settings(_env_file=None, LITSERVE_SERVER_URL="http://localhost:8000")
        assert settings.MODEL_BASE_URL == "http://localhost:8000/predict"


def test_model_base_url_custom():
    """Test that MODEL_BASE_URL can be set directly."""
    with patch.dict(os.environ, {}, clear=True):
        settings = Settings(_env_file=None, MODEL_BASE_URL="http://custom:9000/predict")
        assert settings.MODEL_BASE_URL == "http://custom:9000/predict"


def test_model_base_url_no_trailing_slash():
    """Test that MODEL_BASE_URL handles URLs without trailing slash."""
    with patch.dict(os.environ, {}, clear=True):
        settings = Settings(_env_file=None, LITSERVE_SERVER_URL="http://localhost:8000/")
        assert settings.MODEL_BASE_URL == "http://localhost:8000/predict"


def test_cors_origins_split():
    """Test that CORS_ORIGINS property splits string correctly."""
    with patch.dict(os.environ, {}, clear=True):
        settings = Settings(_env_file=None, CORS_ORIGINS_STR="http://localhost:3000,http://localhost:5173")
        origins = settings.CORS_ORIGINS
        assert len(origins) == 2
        assert "http://localhost:3000" in origins
        assert "http://localhost:5173" in origins

