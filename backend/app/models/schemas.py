"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional, List


class TTSRequest(BaseModel):
    """Request schema for Text-to-Speech."""
    text: str = Field(..., min_length=1, max_length=5000, description="Text to convert to speech")
    voice: str = Field(..., description="Voice name (e.g., 'diana', 'patrick', 'pooja', 'surya')")
    language: Optional[str] = Field(default=None, description="Language of the text")
    cloneing: Optional[bool] = Field(default=False, description="Enable voice cloning")
    ref_speker_base64: Optional[str] = Field(default=None, description="Base64 encoded reference audio for cloning")
    ref_speker_name: Optional[str] = Field(default=None, description="Name for the cloned voice")


class ASRResponse(BaseModel):
    """Response schema for Automatic Speech Recognition."""
    text: str = Field(..., description="Transcribed text")
    transcript: Optional[str] = Field(default=None, description="Alternative transcript field")
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Confidence score")


class ReferenceVoice(BaseModel):
    """Schema for reference voice information."""
    language: str
    voice_name: str
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


class ContactFormRequest(BaseModel):
    """Request schema for Contact Form."""
    first: str = Field(..., min_length=1, description="First name")
    last: str = Field(..., min_length=1, description="Last name")
    email: str = Field(..., description="Email address")
    phone: str = Field(..., description="Phone number")
    company: str = Field(..., description="Company name")


class ContactFormResponse(BaseModel):
    """Response schema for Contact Form."""
    success: bool = Field(..., description="Whether the submission was successful")
    message: str = Field(..., description="Response message")

