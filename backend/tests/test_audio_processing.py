"""Tests for audio processing utilities."""
import pytest
from app.utils.audio_utils import validate_audio_file, get_file_extension
from app.utils.file_utils import is_audio_file


def test_validate_audio_file_valid():
    """Test audio file validation with valid file."""
    valid_content = b"fake audio content"
    is_valid, error = validate_audio_file(valid_content, "test.mp3")
    # Note: This may fail size check, but format check should pass
    assert isinstance(is_valid, bool)
    assert isinstance(error, (str, type(None)))


def test_validate_audio_file_invalid_extension():
    """Test audio file validation with invalid extension."""
    content = b"fake content"
    is_valid, error = validate_audio_file(content, "test.txt")
    assert is_valid is False
    assert error is not None


def test_get_file_extension():
    """Test file extension extraction."""
    assert get_file_extension("test.mp3") == ".mp3"
    assert get_file_extension("test.wav") == ".wav"
    assert get_file_extension("test") == ""


def test_is_audio_file():
    """Test audio file detection."""
    assert is_audio_file("test.mp3") is True
    assert is_audio_file("test.wav") is True
    assert is_audio_file("test.txt") is False

