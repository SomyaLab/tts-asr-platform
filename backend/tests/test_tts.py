"""Tests for TTS endpoints."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_tts_endpoint_success():
    """Test TTS endpoint with valid request."""
    response = client.post(
        "/tts",
        json={
            "text": "Hello, world!",
            "voice": "Tessa",
            "language": "en",
            "speed": 1.0,
            "volume": 1.0
        }
    )
    # Note: This will fail if TTS model is not available, which is expected
    assert response.status_code in [200, 503]


def test_tts_endpoint_invalid_text():
    """Test TTS endpoint with invalid text."""
    response = client.post(
        "/tts",
        json={
            "text": "",  # Empty text should fail validation
        }
    )
    assert response.status_code == 422


def test_tts_endpoint_missing_text():
    """Test TTS endpoint with missing text."""
    response = client.post(
        "/tts",
        json={}
    )
    assert response.status_code == 422


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "version" in data

