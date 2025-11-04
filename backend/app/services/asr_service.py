"""Automatic Speech Recognition service."""
import logging
import os
import httpx
from typing import Optional
from app.config import settings
from app.utils.file_utils import temporary_audio_file


logger = logging.getLogger(__name__)


class ASRService:
    """Service for Automatic Speech Recognition operations."""
    
    def __init__(self):
        """Initialize ASR service."""
        self.model_url = settings.ASR_MODEL_URL
        self.timeout = 300.0  # 300 seconds timeout for longer audio files
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
    
    async def transcribe(
        self,
        audio_content: bytes,
        filename: str = "audio.wav",
        language: Optional[str] = None
    ) -> Optional[str]:
        """
        Transcribe audio to text using LitServe server.
        
        Args:
            audio_content: Audio file content as bytes
            filename: Original filename (used to determine file extension)
            language: Language code hint (optional, not used by LitServe but kept for compatibility)
            
        Returns:
            Transcribed text, or None if transcription fails
        """
        # Determine file extension from filename
        _, ext = os.path.splitext(filename)
        if not ext:
            ext = ".wav"  # Default to .wav
        
        # Save audio bytes to temporary file for LitServe (which expects file path)
        with temporary_audio_file(audio_content, suffix=ext) as temp_file_path:
            try:
                # Prepare LitServe request payload
                payload = {
                    "endpoint": "asr",
                    "audio_file": temp_file_path
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
                        # Extract transcription from response
                        transcription = result.get("transcription", "")
                        if transcription:
                            logger.info(f"ASR transcription successful: {len(transcription)} characters")
                            return transcription
                        else:
                            logger.warning("LitServe response missing transcription")
                            return None
                    else:
                        error_msg = result.get("message", "Unknown error")
                        error_code = result.get("error", "UNKNOWN_ERROR")
                        logger.error(f"LitServe ASR failed: {error_code} - {error_msg}")
                        return None
                else:
                    logger.error(f"LitServe server returned status {response.status_code}: {response.text}")
                    return None
                    
            except httpx.TimeoutException:
                logger.error("ASR model request timed out")
                return None
            except httpx.RequestError as e:
                logger.error(f"Request error calling LitServe: {e}")
                return None
            except Exception as e:
                logger.error(f"Error calling ASR model: {e}", exc_info=True)
                return None
    
    async def is_available(self) -> bool:
        """
        Check if ASR model is available via LitServe health check.
        
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
                logger.debug("ASR service HTTP client closed")
            except Exception as e:
                logger.warning(f"Error closing ASR service HTTP client: {e}")
            finally:
                self._client = None


# Global ASR service instance
asr_service = ASRService()


async def cleanup_asr_service():
    """Cleanup function for ASR service - call during application shutdown."""
    await asr_service.close()

