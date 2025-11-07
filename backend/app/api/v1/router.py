"""API v1 router aggregation."""
from fastapi import APIRouter
from app.api.v1 import tts, asr, voices

router = APIRouter()

# Include all endpoint routers
router.include_router(tts.router, tags=["TTS"])
router.include_router(asr.router, tags=["ASR"])
router.include_router(voices.router, tags=["Voices"])

