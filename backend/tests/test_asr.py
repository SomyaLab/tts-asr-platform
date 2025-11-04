"""Tests for ASR endpoints."""
import pytest
from fastapi.testclient import TestClient
from app.main import app
import io

client = TestClient(app)


def test_asr_endpoint_missing_file():
    """Test ASR endpoint with missing file."""
    response = client.post("/asr")
    assert response.status_code == 422


def test_asr_endpoint_invalid_file():
    """Test ASR endpoint with invalid file type."""
    # Create a fake text file
    fake_file = ("fake.txt", io.BytesIO(b"This is not an audio file"), "text/plain")
    response = client.post(
        "/asr",
        files={"audio": fake_file}
    )
    # Should fail validation
    assert response.status_code in [400, 422]


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "asr_model_available" in data

