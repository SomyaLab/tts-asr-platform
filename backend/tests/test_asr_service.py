"""Tests for ASR service."""
import pytest
import base64
from unittest.mock import AsyncMock, patch
from httpx import Response
from app.services.asr_service import ASRService


@pytest.mark.asyncio
async def test_transcribe_success(mock_model_server_response_asr_success, sample_audio_bytes):
    """Test successful ASR transcription."""
    service = ASRService()
    
    mock_response = Response(
        200,
        json=mock_model_server_response_asr_success,
        headers={"Content-Type": "application/json"}
    )
    
    with patch.object(service, '_get_client', return_value=AsyncMock()) as mock_get_client:
        mock_client = AsyncMock()
        mock_client.post = AsyncMock(return_value=mock_response)
        mock_get_client.return_value = mock_client
        
        result = await service.transcribe(
            audio_content=sample_audio_bytes,
            filename="test.wav",
            language="en"
        )
        
        assert result is not None
        assert result == "This is a test transcription"
        
        # Verify base64 encoding was used
        call_args = mock_client.post.call_args
        payload = call_args[1]['json']
        assert 'audio_base64' in payload
        assert payload['language'] == "en"


@pytest.mark.asyncio
async def test_transcribe_without_language(mock_model_server_response_asr_success, sample_audio_bytes):
    """Test ASR transcription without language parameter."""
    service = ASRService()
    
    mock_response = Response(
        200,
        json=mock_model_server_response_asr_success,
        headers={"Content-Type": "application/json"}
    )
    
    with patch.object(service, '_get_client', return_value=AsyncMock()) as mock_get_client:
        mock_client = AsyncMock()
        mock_client.post = AsyncMock(return_value=mock_response)
        mock_get_client.return_value = mock_client
        
        result = await service.transcribe(
            audio_content=sample_audio_bytes,
            filename="test.wav"
        )
        
        assert result is not None
        
        # Verify language was not included
        call_args = mock_client.post.call_args
        payload = call_args[1]['json']
        assert 'language' not in payload


@pytest.mark.asyncio
async def test_transcribe_error_response(mock_model_server_response_asr_error, sample_audio_bytes):
    """Test ASR transcription with error response."""
    service = ASRService()
    
    mock_response = Response(
        200,
        json=mock_model_server_response_asr_error,
        headers={"Content-Type": "application/json"}
    )
    
    with patch.object(service, '_get_client', return_value=AsyncMock()) as mock_get_client:
        mock_client = AsyncMock()
        mock_client.post = AsyncMock(return_value=mock_response)
        mock_get_client.return_value = mock_client
        
        result = await service.transcribe(
            audio_content=sample_audio_bytes,
            filename="test.wav",
            language="en"
        )
        
        assert result is None


@pytest.mark.asyncio
async def test_transcribe_http_error(sample_audio_bytes):
    """Test ASR transcription with HTTP error."""
    service = ASRService()
    
    mock_response = Response(
        500,
        text="Internal Server Error",
        headers={"Content-Type": "text/plain"}
    )
    
    with patch.object(service, '_get_client', return_value=AsyncMock()) as mock_get_client:
        mock_client = AsyncMock()
        mock_client.post = AsyncMock(return_value=mock_response)
        mock_get_client.return_value = mock_client
        
        result = await service.transcribe(
            audio_content=sample_audio_bytes,
            filename="test.wav",
            language="en"
        )
        
        assert result is None


@pytest.mark.asyncio
async def test_is_available_success(mock_model_server_response_health):
    """Test ASR service availability check."""
    service = ASRService()
    
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

