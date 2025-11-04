"""FastAPI application entry point."""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.core.security import setup_cors, setup_rate_limiting
from app.core.exceptions import (
    validation_exception_handler,
    http_exception_handler,
    general_exception_handler
)
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.api.v1.router import router as api_v1_router
from app.models.schemas import HealthResponse
from app.services.tts_service import tts_service, cleanup_tts_service
from app.services.asr_service import asr_service, cleanup_asr_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-ready TTS-ASR Platform Backend API"
)

# Setup CORS
setup_cors(app)

# Setup rate limiting
setup_rate_limiting(app)

# Add exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Include API routers
app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup resources on application shutdown."""
    logger.info("Shutting down application, cleaning up resources...")
    await cleanup_tts_service()
    await cleanup_asr_service()
    logger.info("Shutdown complete")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "TTS-ASR Platform API",
        "version": settings.VERSION,
        "docs": "/docs"
    }

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        Health status of the API and connected services
    """
    # Check model availability (non-blocking, quick check)
    asr_available = await asr_service.is_available()
    tts_available = await tts_service.is_available()
    
    return HealthResponse(
        status="healthy" if (asr_available or tts_available) else "degraded",
        version=settings.VERSION,
        asr_model_available=asr_available,
        tts_model_available=tts_available
    )

# Direct endpoints for frontend compatibility (without /api/v1 prefix)
from app.models.schemas import TTSRequest
from fastapi import UploadFile, File, Form, HTTPException, status
from fastapi.responses import Response
from typing import Optional
from app.services.tts_service import tts_service
from app.services.asr_service import asr_service
from app.services.audio_service import AudioService

audio_service = AudioService()

@app.post("/tts")
async def tts_direct(request: TTSRequest):
    """Direct TTS endpoint for frontend compatibility."""
    try:
        audio_content = await tts_service.synthesize(
            text=request.text,
            voice=request.voice,
            language=request.language,
            speed=request.speed,
            volume=request.volume,
            emotion=request.emotion
        )
        
        if audio_content is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="TTS service is currently unavailable. Please try again later."
            )
        
        return Response(
            content=audio_content,
            media_type="audio/wav",
            headers={
                "Content-Disposition": "attachment; filename=tts.wav"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in TTS endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request."
        )

@app.post("/asr")
async def asr_direct(
    audio: UploadFile = File(...),
    language: Optional[str] = Form(None)
):
    """Direct ASR endpoint for frontend compatibility."""
    try:
        audio_content = await audio.read()
        filename = audio.filename or "audio.wav"
        
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
        
        transcribed_text = await asr_service.transcribe(
            processed_audio,
            filename=filename,
            language=language
        )
        
        if transcribed_text is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="ASR service is currently unavailable. Please try again later."
            )
        
        from app.models.schemas import ASRResponse
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )

