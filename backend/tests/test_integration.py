"""Integration tests for full request/response flow."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from app.main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.mark.asyncio
async def test_health_check_endpoint(client):
    """Test health check endpoint."""
    with patch('app.services.tts_service.tts_service.is_available', new_callable=AsyncMock) as mock_tts_avail:
        with patch('app.services.asr_service.asr_service.is_available', new_callable=AsyncMock) as mock_asr_avail:
            mock_tts_avail.return_value = True
            mock_asr_avail.return_value = True
            
            response = client.get("/health")
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
            assert data["asr_model_available"] is True
            assert data["tts_model_available"] is True


@pytest.mark.asyncio
async def test_root_endpoint(client):
    """Test root endpoint."""
    response = client.get("/")
    
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data


@pytest.mark.asyncio
async def test_full_tts_flow(client):
    """Test complete TTS flow from request to response."""
    audio_bytes = b"fake_audio_data"
    
    with patch('app.api.v1.tts.tts_service.synthesize', new_callable=AsyncMock) as mock_synthesize:
        mock_synthesize.return_value = audio_bytes
        
        # Make TTS request
        response = client.post(
            "/api/v1/tts",
            json={
                "text": "Hello, this is a test.",
                "voice": "diana"
            }
        )
        
        # Verify response
        assert response.status_code == 200
        assert response.headers["content-type"] == "audio/wav"
        assert response.content == audio_bytes
        
        # Verify service was called correctly
        mock_synthesize.assert_called_once_with(
            text="Hello, this is a test.",
            voice="diana",
            cloneing=False,
            ref_speker_base64=None,
            ref_speker_name=None
        )


@pytest.mark.asyncio
async def test_full_asr_flow(client):
    """Test complete ASR flow from request to response."""
    with patch('app.api.v1.asr.asr_service.transcribe', new_callable=AsyncMock) as mock_transcribe:
        with patch('app.api.v1.asr.audio_service.validate_and_process_audio') as mock_validate:
            mock_validate.return_value = (True, None, b"processed_audio")
            mock_transcribe.return_value = "Transcribed text"
            
            # Make ASR request
            response = client.post(
                "/api/v1/asr",
                files={"audio": ("test.wav", b"audio_data", "audio/wav")},
                data={"language": "en"}
            )
            
            # Verify response
            assert response.status_code == 200
            data = response.json()
            assert data["text"] == "Transcribed text"
            
            # Verify service was called
            mock_transcribe.assert_called_once()

