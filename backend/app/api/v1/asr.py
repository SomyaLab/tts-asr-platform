"""Automatic Speech Recognition API endpoints."""
import logging
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form, Request
from app.models.schemas import ASRResponse
from app.services.asr_service import asr_service
from app.services.audio_service import AudioService
from app.core.security import get_rate_limiter

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = get_rate_limiter()
audio_service = AudioService()


@router.post("/asr", response_model=ASRResponse)
@limiter.limit("30/minute")
async def speech_to_text(
    request: Request,
    audio: UploadFile = File(..., description="Audio file to transcribe"),
    language: str = Form(..., description="Language code (required)")
):
    """
    Transcribe audio to text.
    
    Args:
        audio: Audio file (MP3, WAV, M4A, WebM, etc.)
        language: Language code (required)
        
    Returns:
        Transcribed text
    """
    try:
        # Read audio file
        audio_content = await audio.read()
        filename = audio.filename or "audio.wav"
        
        # Validate and process audio
        is_valid, error_msg, processed_audio = audio_service.validate_and_process_audio(
            audio_content,
            filename,
            apply_noise_reduction=True
        )
        
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        # Transcribe audio
        transcribed_text = await asr_service.transcribe(
            processed_audio,
            language=language
        )
        
        if transcribed_text is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="ASR service is currently unavailable. Please try again later."
            )
        
        return ASRResponse(
            text=transcribed_text,
            transcript=transcribed_text
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in ASR endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request."
        )

