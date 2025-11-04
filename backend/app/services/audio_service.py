"""Audio processing service."""
import logging
from typing import Tuple, Optional
from app.utils.audio_utils import (
    validate_audio_file,
    validate_audio_duration,
    prepare_audio_for_asr,
    apply_noise_suppression,
    convert_audio_to_wav
)
from app.config import settings


logger = logging.getLogger(__name__)


class AudioService:
    """Service for audio processing operations."""
    
    @staticmethod
    def validate_and_process_audio(
        audio_content: bytes,
        filename: str,
        apply_noise_reduction: bool = True
    ) -> Tuple[bool, Optional[str], Optional[bytes]]:
        """
        Validate and process audio file.
        
        Args:
            audio_content: Audio file content as bytes
            filename: Original filename
            apply_noise_reduction: Whether to apply noise reduction
            
        Returns:
            Tuple of (is_valid, error_message, processed_audio)
        """
        # Validate file format and size
        is_valid, error_msg = validate_audio_file(audio_content, filename)
        if not is_valid:
            return False, error_msg, None
        
        # Validate duration
        is_valid, error_msg = validate_audio_duration(audio_content, filename)
        if not is_valid:
            return False, error_msg, None
        
        # Process audio if needed
        processed_audio = audio_content
        if apply_noise_reduction:
            processed_audio = prepare_audio_for_asr(audio_content, filename)
        
        return True, None, processed_audio
    
    @staticmethod
    def process_audio_for_tts(audio_content: bytes, filename: str) -> bytes:
        """
        Process audio for TTS (format conversion only).
        
        Args:
            audio_content: Audio file content as bytes
            filename: Original filename
            
        Returns:
            Processed audio content
        """
        return convert_audio_to_wav(audio_content)
    
    @staticmethod
    def process_audio_for_asr(audio_content: bytes, filename: str) -> bytes:
        """
        Process audio for ASR (noise suppression + format conversion).
        
        Args:
            audio_content: Audio file content as bytes
            filename: Original filename
            
        Returns:
            Processed audio content
        """
        return prepare_audio_for_asr(audio_content, filename)

