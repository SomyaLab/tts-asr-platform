"""Tests for ASR API endpoints."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock, MagicMock
from app.main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def sample_audio_file():
    """Create sample audio file for testing."""
    return ("test.wav", b"fake_audio_data", "audio/wav")


@pytest.mark.asyncio
async def test_asr_endpoint_success(client, sample_audio_file):
    """Test successful ASR request."""
    filename, content, content_type = sample_audio_file
    
    with patch('app.api.v1.asr.asr_service.transcribe', new_callable=AsyncMock) as mock_transcribe:
        mock_transcribe.return_value = "This is a test transcription"
        
        response = client.post(
            "/api/v1/asr",
            files={"audio": (filename, content, content_type)},
            data={"language": "en"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["text"] == "This is a test transcription"
        assert data["transcript"] == "This is a test transcription"


@pytest.mark.asyncio
async def test_asr_endpoint_missing_language(client, sample_audio_file):
    """Test ASR request without language parameter."""
    filename, content, content_type = sample_audio_file
    
    response = client.post(
        "/api/v1/asr",
        files={"audio": (filename, content, content_type)}
    )
    
    assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_asr_endpoint_missing_audio(client):
    """Test ASR request without audio file."""
    response = client.post(
        "/api/v1/asr",
        data={"language": "en"}
    )
    
    assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_asr_endpoint_service_unavailable(client, sample_audio_file):
    """Test ASR request when service is unavailable."""
    filename, content, content_type = sample_audio_file
    
    with patch('app.api.v1.asr.asr_service.transcribe', new_callable=AsyncMock) as mock_transcribe:
        mock_transcribe.return_value = None
        
        response = client.post(
            "/api/v1/asr",
            files={"audio": (filename, content, content_type)},
            data={"language": "en"}
        )
        
        assert response.status_code == 503
        assert "unavailable" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_asr_endpoint_invalid_audio(client):
    """Test ASR request with invalid audio file."""
    with patch('app.api.v1.asr.audio_service.validate_and_process_audio') as mock_validate:
        mock_validate.return_value = (False, "Invalid audio format", None)
        
        response = client.post(
            "/api/v1/asr",
            files={"audio": ("test.txt", b"not audio", "text/plain")},
            data={"language": "en"}
        )
        
        assert response.status_code == 400
        assert "invalid" in response.json()["detail"].lower()

