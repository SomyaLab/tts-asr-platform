"""Voice management API endpoints."""
import logging
from fastapi import APIRouter, HTTPException, status, Path
from fastapi.responses import Response
from app.models.schemas import VoiceListResponse, ReferenceVoice
from app.services.voice_service import voice_service
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/voices/reference", response_model=VoiceListResponse)
async def list_reference_voices():
    """
    List all available reference voices.
    
    Returns:
        List of available reference voices
    """
    try:
        voices_data = voice_service.get_reference_voices()
        voices = [
            ReferenceVoice(
                language=v["language"],
                gender=v["gender"],
                url=f"/api/v1/voices/reference/{v['language']}/{v['gender']}",
                available=v["available"]
            )
            for v in voices_data
        ]
        return VoiceListResponse(voices=voices)
    except Exception as e:
        logger.error(f"Error listing reference voices: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving reference voices."
        )


@router.get("/voices/reference/{language}/{gender}")
async def get_reference_voice(
    language: str = Path(..., description="Language code"),
    gender: str = Path(..., description="Gender (male or female)")
):
    """
    Get reference voice audio file.
    
    Args:
        language: Language code (en, hi, kn, te, ma, sa)
        gender: Gender (male or female)
        
    Returns:
        Audio file (MP3 format)
    """
    try:
        # Validate language and gender
        if language not in settings.SUPPORTED_LANGUAGES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported language: {language}. Supported languages: {', '.join(settings.SUPPORTED_LANGUAGES)}"
            )
        
        if gender not in settings.SUPPORTED_GENDERS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported gender: {gender}. Supported genders: {', '.join(settings.SUPPORTED_GENDERS)}"
            )
        
        # Get reference voice
        audio_content = voice_service.get_reference_voice(language, gender)
        
        if audio_content is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Reference voice not found for language '{language}' and gender '{gender}'"
            )
        
        # Determine content type based on file extension
        content_type = "audio/mpeg"  # Default to MP3
        
        return Response(
            content=audio_content,
            media_type=content_type,
            headers={
                "Content-Disposition": f"attachment; filename={language}-{gender}.mp3"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting reference voice: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving the reference voice."
        )

