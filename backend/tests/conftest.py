"""Pytest configuration and fixtures."""
import pytest
import base64
from unittest.mock import AsyncMock, MagicMock
from httpx import Response
import json


@pytest.fixture
def mock_model_server_response_tts_success():
    """Mock successful TTS response from model server."""
    audio_bytes = b"fake_audio_data"
    audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
    return {
        "success": True,
        "audio_base64": audio_base64
    }


@pytest.fixture
def mock_model_server_response_tts_error():
    """Mock error TTS response from model server."""
    return {
        "success": False,
        "error": "TTS_ERROR",
        "message": "TTS synthesis failed"
    }


@pytest.fixture
def mock_model_server_response_asr_success():
    """Mock successful ASR response from model server."""
    return {
        "success": True,
        "transcription": "This is a test transcription"
    }


@pytest.fixture
def mock_model_server_response_asr_error():
    """Mock error ASR response from model server."""
    return {
        "success": False,
        "error": "ASR_ERROR",
        "message": "ASR transcription failed"
    }


@pytest.fixture
def mock_model_server_response_health():
    """Mock health check response from model server."""
    return {
        "status": "healthy"
    }


@pytest.fixture
def mock_httpx_client():
    """Mock httpx AsyncClient."""
    client = AsyncMock()
    return client


@pytest.fixture
def sample_audio_bytes():
    """Sample audio bytes for testing."""
    return b"fake_audio_data_for_testing"


@pytest.fixture
def sample_audio_base64(sample_audio_bytes):
    """Sample audio base64 for testing."""
    return base64.b64encode(sample_audio_bytes).decode('utf-8')

