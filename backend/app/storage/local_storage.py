"""Local filesystem storage utilities."""
import os
import logging
from pathlib import Path
from typing import Optional, List
from app.config import settings
from app.utils.file_utils import ensure_directory_exists


logger = logging.getLogger(__name__)


class LocalStorage:
    """Local filesystem storage manager."""
    
    def __init__(self):
        """Initialize storage paths."""
        self.storage_path = settings.STORAGE_PATH
        self.reference_voices_path = settings.REFERENCE_VOICES_PATH
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Ensure storage directories exist."""
        ensure_directory_exists(self.storage_path)
        ensure_directory_exists(self.reference_voices_path)
    
    def get_reference_voice_path(self, language: str, gender: str, filename: Optional[str] = None) -> str:
        """
        Get path to reference voice file.
        
        Args:
            language: Language code (e.g., 'en', 'hi')
            gender: Gender ('male' or 'female')
            filename: Optional filename (defaults to gender.mp3)
            
        Returns:
            Full path to reference voice file
        """
        lang_dir = os.path.join(self.reference_voices_path, language)
        ensure_directory_exists(lang_dir)
        
        if filename is None:
            filename = f"{gender}.mp3"
        
        return os.path.join(lang_dir, filename)
    
    def reference_voice_exists(self, language: str, gender: str) -> bool:
        """
        Check if reference voice file exists.
        
        Args:
            language: Language code
            gender: Gender ('male' or 'female')
            
        Returns:
            True if file exists, False otherwise
        """
        file_path = self.get_reference_voice_path(language, gender)
        return os.path.exists(file_path)
    
    def list_reference_voices(self) -> List[dict]:
        """
        List all available reference voices.
        
        Returns:
            List of dictionaries with language, gender, and availability
        """
        voices = []
        
        if not os.path.exists(self.reference_voices_path):
            return voices
        
        for lang_dir in os.listdir(self.reference_voices_path):
            lang_path = os.path.join(self.reference_voices_path, lang_dir)
            if not os.path.isdir(lang_path):
                continue
            
            for gender in ['male', 'female']:
                voice_path = self.get_reference_voice_path(lang_dir, gender)
                voices.append({
                    'language': lang_dir,
                    'gender': gender,
                    'available': os.path.exists(voice_path),
                    'path': voice_path if os.path.exists(voice_path) else None
                })
        
        return voices
    
    def read_reference_voice(self, language: str, gender: str) -> Optional[bytes]:
        """
        Read reference voice file.
        
        Args:
            language: Language code
            gender: Gender ('male' or 'female')
            
        Returns:
            File content as bytes, or None if not found
        """
        file_path = self.get_reference_voice_path(language, gender)
        
        if not os.path.exists(file_path):
            return None
        
        try:
            with open(file_path, 'rb') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error reading reference voice file: {e}")
            return None


# Global storage instance
storage = LocalStorage()

