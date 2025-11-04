"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional, List


class TTSRequest(BaseModel):
    """Request schema for Text-to-Speech."""
    text: str = Field(..., min_length=1, max_length=5000, description="Text to convert to speech")
    voice: Optional[str] = Field(default="Tessa", description="Voice name")
    language: Optional[str] = Field(default="en", description="Language code")
    speed: Optional[float] = Field(default=1.0, ge=0.5, le=2.0, description="Speech speed multiplier")
    volume: Optional[float] = Field(default=1.0, ge=0.0, le=2.0, description="Volume multiplier")
    emotion: Optional[str] = Field(default="neutral", description="Emotion for speech")


class ASRResponse(BaseModel):
    """Response schema for Automatic Speech Recognition."""
    text: str = Field(..., description="Transcribed text")
    transcript: Optional[str] = Field(default=None, description="Alternative transcript field")
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Confidence score")


class ReferenceVoice(BaseModel):
    """Schema for reference voice information."""
    language: str
    gender: str
    url: str
    available: bool


class VoiceListResponse(BaseModel):
    """Response schema for voice list."""
    voices: List[ReferenceVoice]


class ExampleText(BaseModel):
    """Schema for example text."""
    language: str
    text: str
    description: Optional[str] = None


class ExampleListResponse(BaseModel):
    """Response schema for example list."""
    examples: List[ExampleText]


class HealthResponse(BaseModel):
    """Health check response schema."""
    status: str
    version: str
    asr_model_available: bool
    tts_model_available: bool

