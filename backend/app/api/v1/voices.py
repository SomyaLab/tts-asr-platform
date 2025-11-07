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
                voice_name=v["voice_name"],
                url=f"/api/v1/voices/reference/{v['language']}/{v['voice_name']}",
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


# Note: Reference voice files are now managed by the model server.
# This endpoint is kept for API compatibility but voices should be accessed
# directly from the model server if needed.

