"""Audio processing utilities."""
import os
import io
import wave
import logging
from typing import Optional, Tuple
import numpy as np
try:
    import librosa
    import soundfile as sf
    HAS_LIBROSA = True
except ImportError:
    HAS_LIBROSA = False
    logging.warning("librosa not installed. Some audio processing features may be limited.")

try:
    import noisereduce as nr
    HAS_NOISEREDUCE = True
except ImportError:
    HAS_NOISEREDUCE = False
    logging.warning("noisereduce not installed. Noise suppression will be disabled.")

from app.config import settings


logger = logging.getLogger(__name__)


def validate_audio_file(file_content: bytes, filename: str) -> Tuple[bool, Optional[str]]:
    """
    Validate audio file.
    
    Args:
        file_content: Audio file content as bytes
        filename: Original filename
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Check file size
    max_size_bytes = settings.MAX_AUDIO_SIZE_MB * 1024 * 1024
    if len(file_content) > max_size_bytes:
        return False, f"File size exceeds maximum allowed size of {settings.MAX_AUDIO_SIZE_MB}MB"
    
    # Check file extension
    allowed_extensions = ['.mp3', '.wav', '.m4a', '.webm', '.ogg', '.flac']
    file_ext = os.path.splitext(filename.lower())[1]
    if file_ext not in allowed_extensions:
        return False, f"Unsupported file format. Allowed formats: {', '.join(allowed_extensions)}"
    
    return True, None


def get_audio_duration(file_content: bytes, filename: str) -> float:
    """
    Get audio duration in seconds.
    
    Args:
        file_content: Audio file content as bytes
        filename: Original filename
        
    Returns:
        Duration in seconds
    """
    if not HAS_LIBROSA:
        logger.warning("Cannot get audio duration without librosa")
        return 0.0
    
    try:
        audio_buffer = io.BytesIO(file_content)
        y, sr = librosa.load(audio_buffer, sr=None)
        duration = librosa.get_duration(y=y, sr=sr)
        return duration
    except Exception as e:
        logger.error(f"Error getting audio duration: {e}")
        return 0.0


def validate_audio_duration(file_content: bytes, filename: str) -> Tuple[bool, Optional[str]]:
    """
    Validate audio duration.
    
    Args:
        file_content: Audio file content as bytes
        filename: Original filename
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    duration = get_audio_duration(file_content, filename)
    if duration > settings.MAX_AUDIO_DURATION_SEC:
        return False, f"Audio duration exceeds maximum allowed duration of {settings.MAX_AUDIO_DURATION_SEC} seconds"
    
    return True, None


def convert_audio_to_wav(audio_content: bytes, input_format: str = None) -> bytes:
    """
    Convert audio to WAV format.
    
    Args:
        audio_content: Input audio content as bytes
        input_format: Input format hint (optional)
        
    Returns:
        WAV audio content as bytes
    """
    if not HAS_LIBROSA:
        # If librosa is not available, return original content
        logger.warning("Cannot convert audio without librosa. Returning original content.")
        return audio_content
    
    try:
        audio_buffer = io.BytesIO(audio_content)
        y, sr = librosa.load(audio_buffer, sr=16000)  # Resample to 16kHz
        
        # Convert to WAV
        wav_buffer = io.BytesIO()
        sf.write(wav_buffer, y, sr, format='WAV')
        wav_buffer.seek(0)
        
        return wav_buffer.read()
    except Exception as e:
        logger.error(f"Error converting audio to WAV: {e}")
        # Return original content if conversion fails
        return audio_content


def apply_noise_suppression(audio_content: bytes, filename: str) -> bytes:
    """
    Apply noise suppression to audio.
    
    Args:
        audio_content: Audio file content as bytes
        filename: Original filename
        
    Returns:
        Processed audio content as bytes
    """
    if not settings.NOISE_SUPPRESSION_ENABLED:
        return audio_content
    
    if not HAS_NOISEREDUCE or not HAS_LIBROSA:
        logger.warning("Noise suppression requested but dependencies not available")
        return audio_content
    
    try:
        # Load audio
        audio_buffer = io.BytesIO(audio_content)
        y, sr = librosa.load(audio_buffer, sr=16000)
        
        # Apply noise reduction
        reduced_noise = nr.reduce_noise(y=y, sr=sr)
        
        # Convert back to bytes
        output_buffer = io.BytesIO()
        sf.write(output_buffer, reduced_noise, sr, format='WAV')
        output_buffer.seek(0)
        
        return output_buffer.read()
    except Exception as e:
        logger.error(f"Error applying noise suppression: {e}")
        # Return original content if noise suppression fails
        return audio_content


def prepare_audio_for_asr(audio_content: bytes, filename: str) -> bytes:
    """
    Prepare audio for ASR processing (noise suppression + format conversion).
    
    Args:
        audio_content: Audio file content as bytes
        filename: Original filename
        
    Returns:
        Processed audio content as bytes
    """
    # Apply noise suppression
    processed_audio = apply_noise_suppression(audio_content, filename)
    
    # Convert to WAV format (if needed)
    wav_audio = convert_audio_to_wav(processed_audio)
    
    return wav_audio

