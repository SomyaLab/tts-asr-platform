"""Text-to-Speech API endpoints."""
import logging
from fastapi import APIRouter, HTTPException, status, Request
from fastapi.responses import Response
from app.models.schemas import TTSRequest
from app.services.tts_service import tts_service
from app.core.security import get_rate_limiter

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = get_rate_limiter()


@router.post("/tts")
@limiter.limit("30/minute")
async def text_to_speech(request: Request, tts_request: TTSRequest):
    """
    Convert text to speech.
    
    Args:
        request: FastAPI request object (for rate limiting)
        tts_request: TTS request containing text and optional parameters
        
    Returns:
        Audio file (WAV format)
    """
    try:
        logger.info(f"Received TTS request: text='{tts_request.text[:50]}...', voice={tts_request.voice}, cloneing={tts_request.cloneing}")
        
        # Synthesize speech
        audio_content = await tts_service.synthesize(
            text=tts_request.text,
            voice=tts_request.voice,
            language=tts_request.language,
            cloneing=tts_request.cloneing or False,
            ref_speker_base64=tts_request.ref_speker_base64,
            ref_speker_name=tts_request.ref_speker_name
        )
        
        if audio_content is None:
            logger.warning(f"TTS service returned None for voice={tts_request.voice}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"TTS service is unavailable for voice '{tts_request.voice}'. Please try again later."
            )
        
        logger.info(f"TTS synthesis successful: {len(audio_content)} bytes")
        
        # Return audio response
        return Response(
            content=audio_content,
            media_type="audio/wav",
            headers={
                "Content-Disposition": "attachment; filename=tts.wav"
            }
        )
        
    except HTTPException as e:
        logger.warning(f"HTTPException in TTS endpoint: {e.status_code} - {e.detail}")
        raise
    except Exception as e:
        logger.error(f"Error in TTS endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing your request: {str(e)}"
        )

