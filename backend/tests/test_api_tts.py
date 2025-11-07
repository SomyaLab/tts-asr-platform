"""Tests for TTS API endpoints."""
import pytest
import base64
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from app.main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def mock_tts_success():
    """Mock successful TTS synthesis."""
    audio_bytes = b"fake_audio_data"
    return audio_bytes


@pytest.mark.asyncio
async def test_tts_endpoint_success(client, mock_tts_success):
    """Test successful TTS request."""
    with patch('app.api.v1.tts.tts_service.synthesize', new_callable=AsyncMock) as mock_synthesize:
        mock_synthesize.return_value = mock_tts_success
        
        response = client.post(
            "/api/v1/tts",
            json={
                "text": "Hello, world!",
                "voice": "patrick"
            }
        )
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "audio/wav"
        assert len(response.content) > 0


@pytest.mark.asyncio
async def test_tts_endpoint_with_cloning(client, mock_tts_success, sample_audio_base64):
    """Test TTS request with voice cloning."""
    with patch('app.api.v1.tts.tts_service.synthesize', new_callable=AsyncMock) as mock_synthesize:
        mock_synthesize.return_value = mock_tts_success
        
        response = client.post(
            "/api/v1/tts",
            json={
                "text": "Hello, world!",
                "voice": "patrick",
                "cloneing": True,
                "ref_speker_base64": sample_audio_base64,
                "ref_speker_name": "cloned_voice"
            }
        )
        
        assert response.status_code == 200
        # Verify cloning parameters were passed
        mock_synthesize.assert_called_once()
        call_kwargs = mock_synthesize.call_args[1]
        assert call_kwargs['cloneing'] is True
        assert call_kwargs['ref_speker_base64'] == sample_audio_base64


def test_tts_endpoint_missing_voice(client):
    """Test TTS request without voice parameter."""
    response = client.post(
        "/api/v1/tts",
        json={
            "text": "Hello, world!"
        }
    )
    
    assert response.status_code == 422  # Validation error


def test_tts_endpoint_missing_text(client):
    """Test TTS request without text parameter."""
    response = client.post(
        "/api/v1/tts",
        json={
            "voice": "patrick"
        }
    )
    
    assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_tts_endpoint_service_unavailable(client):
    """Test TTS request when service is unavailable."""
    with patch('app.api.v1.tts.tts_service.synthesize', new_callable=AsyncMock) as mock_synthesize:
        mock_synthesize.return_value = None
        
        response = client.post(
            "/api/v1/tts",
            json={
                "text": "Hello, world!",
                "voice": "patrick"
            }
        )
        
        assert response.status_code == 503
        assert "unavailable" in response.json()["detail"].lower()

