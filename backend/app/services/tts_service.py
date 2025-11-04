"""Text-to-Speech service."""
import logging
import base64
import httpx
from typing import Optional
from app.config import settings
from app.services.voice_service import voice_service
from app.storage.local_storage import storage


logger = logging.getLogger(__name__)


class TTSService:
    """Service for Text-to-Speech operations."""
    
    def __init__(self):
        """Initialize TTS service."""
        self.model_url = settings.TTS_MODEL_URL
        self.timeout = 300.0  # 300 seconds timeout for long texts
        # Create a persistent async client for connection pooling
        self._client: Optional[httpx.AsyncClient] = None
    
    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create async HTTP client with connection pooling."""
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=self.timeout,
                limits=httpx.Limits(max_keepalive_connections=10, max_connections=20)
            )
        return self._client
    
    def _get_speaker_audio_file(self, language: Optional[str], voice: Optional[str]) -> Optional[str]:
        """
        Get speaker audio file path based on language and voice.
        
        Args:
            language: Language code (e.g., 'en', 'hi')
            voice: Voice name (used to infer gender if available)
            
        Returns:
            Path to speaker audio file, or None if not found
        """
        # Default to English if language not provided
        lang = language or "en"
        
        # Try to infer gender from voice name (simple heuristic)
        # This can be enhanced based on your voice naming convention
        gender = "female"  # default
        if voice:
            voice_lower = voice.lower()
            # Simple heuristic - can be improved
            if any(male_indicator in voice_lower for male_indicator in ["male", "john", "mike", "david"]):
                gender = "male"
        
        # Get speaker audio file path
        speaker_path = storage.get_reference_voice_path(lang, gender)
        
        # Check if file exists
        if storage.reference_voice_exists(lang, gender):
            return speaker_path
        
        # Fallback: try to find any available voice for the language
        voices = storage.list_reference_voices()
        for v in voices:
            if v['language'] == lang and v['available']:
                return v['path']
        
        logger.warning(f"No speaker audio file found for language={lang}, gender={gender}")
        return None
    
    async def synthesize(
        self,
        text: str,
        voice: Optional[str] = None,
        language: Optional[str] = None,
        speed: Optional[float] = None,
        volume: Optional[float] = None,
        emotion: Optional[str] = None
    ) -> Optional[bytes]:
        """
        Synthesize speech from text using LitServe server.
        
        Args:
            text: Text to synthesize
            voice: Voice name (optional, used to infer gender)
            language: Language code (optional, defaults to 'en')
            speed: Speech speed (optional, not used by LitServe but kept for compatibility)
            volume: Volume level (optional, not used by LitServe but kept for compatibility)
            emotion: Emotion for speech (optional, not used by LitServe but kept for compatibility)
            
        Returns:
            Audio content as bytes, or None if synthesis fails
        """
        try:
            # Get speaker audio file path
            speaker_audio_file = self._get_speaker_audio_file(language, voice)
            if not speaker_audio_file:
                logger.error(f"Speaker audio file not found for language={language}, voice={voice}")
                return None
            
            # Prepare LitServe request payload
            payload = {
                "endpoint": "tts",
                "text": text,
                "speaker_audio_file": speaker_audio_file,
                "return_base64": True,
                "max_chunk_len": 250  # Default chunk length for long texts
            }
            
            # Make request to LitServe server
            client = await self._get_client()
            response = await client.post(
                self.model_url,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                # Parse LitServe response
                result = response.json()
                
                if result.get("success", False):
                    # Extract base64 audio and decode
                    audio_base64 = result.get("audio_base64")
                    if audio_base64:
                        try:
                            audio_bytes = base64.b64decode(audio_base64)
                            logger.info(f"TTS synthesis successful: {len(audio_bytes)} bytes")
                            return audio_bytes
                        except Exception as e:
                            logger.error(f"Failed to decode base64 audio: {e}")
                            return None
                    else:
                        logger.error("LitServe response missing audio_base64")
                        return None
                else:
                    error_msg = result.get("message", "Unknown error")
                    error_code = result.get("error", "UNKNOWN_ERROR")
                    logger.error(f"LitServe TTS failed: {error_code} - {error_msg}")
                    return None
            else:
                logger.error(f"LitServe server returned status {response.status_code}: {response.text}")
                return None
                    
        except httpx.TimeoutException:
            logger.error("TTS model request timed out")
            return None
        except httpx.RequestError as e:
            logger.error(f"Request error calling LitServe: {e}")
            return None
        except Exception as e:
            logger.error(f"Error calling TTS model: {e}", exc_info=True)
            return None
    
    async def is_available(self) -> bool:
        """
        Check if TTS model is available via LitServe health check.
        
        Returns:
            True if model is available, False otherwise
        """
        try:
            client = await self._get_client()
            # Call LitServe health endpoint
            payload = {"endpoint": "health"}
            response = await client.post(
                self.model_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=5.0
            )
            
            if response.status_code == 200:
                result = response.json()
                # LitServe health endpoint returns {"status": "healthy", ...}
                return result.get("status") == "healthy"
            return False
        except Exception as e:
            logger.debug(f"LitServe health check failed: {e}")
            return False
    
    async def close(self):
        """
        Close the HTTP client and clean up resources.
        
        Should be called when the service is no longer needed,
        e.g., during application shutdown.
        """
        if self._client is not None:
            try:
                await self._client.aclose()
                logger.debug("TTS service HTTP client closed")
            except Exception as e:
                logger.warning(f"Error closing TTS service HTTP client: {e}")
            finally:
                self._client = None


# Global TTS service instance
tts_service = TTSService()


async def cleanup_tts_service():
    """Cleanup function for TTS service - call during application shutdown."""
    await tts_service.close()

