"""File handling utilities."""
import os
import logging
import tempfile
from pathlib import Path
from typing import Optional
from contextlib import contextmanager


logger = logging.getLogger(__name__)


def ensure_directory_exists(directory_path: str) -> None:
    """
    Ensure a directory exists, create if it doesn't.
    
    Args:
        directory_path: Path to directory
    """
    Path(directory_path).mkdir(parents=True, exist_ok=True)


def get_file_extension(filename: str) -> str:
    """
    Get file extension from filename.
    
    Args:
        filename: Filename
        
    Returns:
        File extension (with dot)
    """
    return os.path.splitext(filename)[1].lower()


def is_audio_file(filename: str) -> bool:
    """
    Check if file is an audio file based on extension.
    
    Args:
        filename: Filename
        
    Returns:
        True if audio file, False otherwise
    """
    audio_extensions = ['.mp3', '.wav', '.m4a', '.webm', '.ogg', '.flac']
    return get_file_extension(filename) in audio_extensions


def get_file_size_mb(file_path: str) -> float:
    """
    Get file size in MB.
    
    Args:
        file_path: Path to file
        
    Returns:
        File size in MB
    """
    try:
        size_bytes = os.path.getsize(file_path)
        return size_bytes / (1024 * 1024)
    except Exception as e:
        logger.error(f"Error getting file size: {e}")
        return 0.0


@contextmanager
def temporary_audio_file(audio_content: bytes, suffix: str = ".wav"):
    """
    Create a temporary audio file from bytes content.
    
    Context manager that creates a temporary file, writes content to it,
    yields the file path, and cleans up on exit.
    
    Args:
        audio_content: Audio file content as bytes
        suffix: File extension (default: .wav)
        
    Yields:
        Path to temporary file
    """
    temp_file = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(audio_content)
            temp_file = tmp.name
        yield temp_file
    finally:
        if temp_file and os.path.exists(temp_file):
            try:
                os.unlink(temp_file)
            except Exception as e:
                logger.warning(f"Failed to delete temporary file {temp_file}: {e}")

