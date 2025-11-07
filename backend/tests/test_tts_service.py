"""Tests for TTS service."""
import pytest
import base64
from unittest.mock import AsyncMock, patch
from httpx import Response
from app.services.tts_service import TTSService


@pytest.mark.asyncio
async def test_synthesize_success(mock_model_server_response_tts_success):
    """Test successful TTS synthesis."""
    service = TTSService()
    
    # Mock the HTTP client
    mock_response = Response(
        200,
        json=mock_model_server_response_tts_success,
        headers={"Content-Type": "application/json"}
    )
    
    with patch.object(service, '_get_client', return_value=AsyncMock()) as mock_get_client:
        mock_client = AsyncMock()
        mock_client.post = AsyncMock(return_value=mock_response)
        mock_get_client.return_value = mock_client
        
        result = await service.synthesize(
            text="Hello, world!",
            voice="patrick"
        )
        
        assert result is not None
        assert isinstance(result, bytes)
        assert len(result) > 0


@pytest.mark.asyncio
async def test_synthesize_with_cloning(mock_model_server_response_tts_success, sample_audio_base64):
    """Test TTS synthesis with voice cloning."""
    service = TTSService()
    
    mock_response = Response(
        200,
        json=mock_model_server_response_tts_success,
        headers={"Content-Type": "application/json"}
    )
    
    with patch.object(service, '_get_client', return_value=AsyncMock()) as mock_get_client:
        mock_client = AsyncMock()
        mock_client.post = AsyncMock(return_value=mock_response)
        mock_get_client.return_value = mock_client
        
        result = await service.synthesize(
            text="Hello, world!",
            voice="patrick",
            cloneing=True,
            ref_speker_base64=sample_audio_base64,
            ref_speker_name="cloned_voice"
        )
        
        assert result is not None
        # Verify cloning parameters were sent
        call_args = mock_client.post.call_args
        payload = call_args[1]['json']
        assert payload['cloneing'] is True
        assert payload['ref_speker_base64'] == sample_audio_base64
        assert payload['ref_speker_name'] == "cloned_voice"


@pytest.mark.asyncio
async def test_synthesize_error_response(mock_model_server_response_tts_error):
    """Test TTS synthesis with error response."""
    service = TTSService()
    
    mock_response = Response(
        200,
        json=mock_model_server_response_tts_error,
        headers={"Content-Type": "application/json"}
    )
    
    with patch.object(service, '_get_client', return_value=AsyncMock()) as mock_get_client:
        mock_client = AsyncMock()
        mock_client.post = AsyncMock(return_value=mock_response)
        mock_get_client.return_value = mock_client
        
        result = await service.synthesize(
            text="Hello, world!",
            voice="patrick"
        )
        
        assert result is None


@pytest.mark.asyncio
async def test_synthesize_http_error():
    """Test TTS synthesis with HTTP error."""
    service = TTSService()
    
    mock_response = Response(
        500,
        text="Internal Server Error",
        headers={"Content-Type": "text/plain"}
    )
    
    with patch.object(service, '_get_client', return_value=AsyncMock()) as mock_get_client:
        mock_client = AsyncMock()
        mock_client.post = AsyncMock(return_value=mock_response)
        mock_get_client.return_value = mock_client
        
        result = await service.synthesize(
            text="Hello, world!",
            voice="patrick"
        )
        
        assert result is None


@pytest.mark.asyncio
async def test_is_available_success(mock_model_server_response_health):
    """Test TTS service availability check."""
    service = TTSService()
    
    mock_response = Response(
        200,
        json=mock_model_server_response_health,
        headers={"Content-Type": "application/json"}
    )
    
    with patch.object(service, '_get_client', return_value=AsyncMock()) as mock_get_client:
        mock_client = AsyncMock()
        mock_client.post = AsyncMock(return_value=mock_response)
        mock_get_client.return_value = mock_client
        
        result = await service.is_available()
        
        assert result is True


@pytest.mark.asyncio
async def test_is_available_failure():
    """Test TTS service availability check failure."""
    service = TTSService()
    
    with patch.object(service, '_get_client', return_value=AsyncMock()) as mock_get_client:
        mock_client = AsyncMock()
        mock_client.post = AsyncMock(side_effect=Exception("Connection error"))
        mock_get_client.return_value = mock_client
        
        result = await service.is_available()
        
        assert result is False

