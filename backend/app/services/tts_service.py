"""Text-to-Speech service."""
import logging
import base64
import httpx
from typing import Optional
from app.config import settings


logger = logging.getLogger(__name__)


class TTSService:
    """Service for Text-to-Speech operations."""
    
    def __init__(self):
        """Initialize TTS service."""
        self.model_url = settings.MODEL_BASE_URL
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
    
    async def synthesize(
        self,
        text: str,
        voice: str,
        language: Optional[str] = None,
        cloneing: bool = False,
        ref_speker_base64: Optional[str] = None,
        ref_speker_name: Optional[str] = None
    ) -> Optional[bytes]:
        """
        Synthesize speech from text using LitServe server.
        
        Args:
            text: Text to synthesize
            voice: Voice name (e.g., 'diana', 'patrick', 'pooja', 'surya')
            cloneing: Whether to enable voice cloning
            ref_speker_base64: Base64 encoded reference audio for cloning (optional)
            ref_speker_name: Name for the cloned voice (optional)
            
        Returns:
            Audio content as bytes, or None if synthesis fails
        """
        try:
            # Prepare LitServe request payload
            payload = {
                "endpoint": "tts",
                "text": text,
                "language": language,
                "voice": voice,
                "return_base64": True
            }
            
            # Add cloning parameters if enabled
            if cloneing:
                payload["cloneing"] = True
                if ref_speker_base64:
                    payload["ref_speker_base64"] = ref_speker_base64
                if ref_speker_name:
                    payload["ref_speker_name"] = ref_speker_name
            
            logger.info(f"Sending TTS request: voice={voice}, cloneing={cloneing}, text_length={len(text)}")
            
            # Make request to LitServe server
            client = await self._get_client()
            response = await client.post(
                f"{self.model_url}/predict",
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
                f"{self.model_url}/health",
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

