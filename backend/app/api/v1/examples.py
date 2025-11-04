"""Example text/audio API endpoints."""
import logging
from fastapi import APIRouter, HTTPException, status, Query
from typing import Optional
from app.models.schemas import ExampleListResponse, ExampleText
from app.services.voice_service import voice_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/examples/tts", response_model=ExampleListResponse)
async def get_tts_examples(
    language: Optional[str] = Query(None, description="Filter by language code")
):
    """
    Get example texts for TTS demos.
    
    Args:
        language: Optional language filter
        
    Returns:
        List of example texts
    """
    try:
        examples_data = voice_service.get_example_texts(language=language)
        examples = [
            ExampleText(
                language=ex["language"],
                text=ex["text"],
                description=ex.get("description")
            )
            for ex in examples_data
        ]
        return ExampleListResponse(examples=examples)
    except Exception as e:
        logger.error(f"Error getting TTS examples: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving TTS examples."
        )


@router.get("/examples/asr", response_model=ExampleListResponse)
async def get_asr_examples(
    language: Optional[str] = Query(None, description="Filter by language code")
):
    """
    Get example texts for ASR demos.
    
    Note: This returns example texts. Audio examples can be accessed via
    the reference voices endpoint.
    
    Args:
        language: Optional language filter
        
    Returns:
        List of example texts
    """
    try:
        examples_data = voice_service.get_example_texts(language=language)
        examples = [
            ExampleText(
                language=ex["language"],
                text=ex["text"],
                description=ex.get("description")
            )
            for ex in examples_data
        ]
        return ExampleListResponse(examples=examples)
    except Exception as e:
        logger.error(f"Error getting ASR examples: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving ASR examples."
        )

