"""Voice management service."""
import logging
from typing import List, Optional
from app.storage.local_storage import storage
from app.config import settings


logger = logging.getLogger(__name__)


class VoiceService:
    """Service for voice management operations."""
    
    @staticmethod
    def get_reference_voices() -> List[dict]:
        """
        Get list of available reference voices.
        
        Returns:
            List of voice dictionaries
        """
        return storage.list_reference_voices()
    
    @staticmethod
    def get_reference_voice(language: str, gender: str) -> Optional[bytes]:
        """
        Get reference voice audio file.
        
        Args:
            language: Language code
            gender: Gender ('male' or 'female')
            
        Returns:
            Audio file content as bytes, or None if not found
        """
        if language not in settings.SUPPORTED_LANGUAGES:
            logger.warning(f"Unsupported language: {language}")
            return None
        
        if gender not in settings.SUPPORTED_GENDERS:
            logger.warning(f"Unsupported gender: {gender}")
            return None
        
        return storage.read_reference_voice(language, gender)
    
    @staticmethod
    def get_example_texts(language: Optional[str] = None) -> List[dict]:
        """
        Get example texts for TTS/ASR demos.
        
        Args:
            language: Optional language filter
            
        Returns:
            List of example text dictionaries
        """
        examples = {
            "en": [
                {
                    "text": "Welcome to Somya Labs. We provide cutting-edge speech technology solutions.",
                    "description": "Welcome message"
                },
                {
                    "text": "I'm in the process of recording some audio so I can create a digital clone of my voice. Once it's ready, I'll be able to generate speech that sounds exactly like me — same tone, rhythm, and personality.",
                    "description": "Voice cloning example"
                },
                {
                    "text": "It's nice to meet you. Hope you're having a great day.",
                    "description": "Greeting"
                }
            ],
            "hi": [
                {
                    "text": "सोम्या लैब्स में आपका स्वागत है। हम अत्याधुनिक भाषण प्रौद्योगिकी समाधान प्रदान करते हैं।",
                    "description": "Welcome message"
                }
            ],
            "kn": [
                {
                    "text": "ಸೋಮ್ಯಾ ಲ್ಯಾಬ್ಸ್ಗೆ ಸ್ವಾಗತ. ನಾವು ಅತ್ಯಾಧುನಿಕ ಭಾಷಣ ತಂತ್ರಜ್ಞಾನ ಪರಿಹಾರಗಳನ್ನು ಒದಗಿಸುತ್ತೇವೆ।",
                    "description": "Welcome message"
                }
            ],
            "te": [
                {
                    "text": "సోమ్యా ల్యాబ్స్‌కు స్వాగతం. మేము అత్యాధునిక స్పీచ్ టెక్నాలజీ పరిష్కారాలను అందిస్తాము.",
                    "description": "Welcome message"
                }
            ],
            "ma": [
                {
                    "text": "सोम्या लॅब्समध्ये आपले स्वागत आहे. आम्ही अत्याधुनिक भाषण तंत्रज्ञान उपाय प्रदान करतो.",
                    "description": "Welcome message"
                }
            ],
            "sa": [
                {
                    "text": "सोम्यालैब्से स्वागतम्। वयं अत्याधुनिक वाक्-तकनीकी समाधानानि प्रददामः।",
                    "description": "Welcome message"
                }
            ]
        }
        
        if language:
            return examples.get(language, [])
        
        # Return all examples grouped by language
        result = []
        for lang, texts in examples.items():
            for text_dict in texts:
                result.append({
                    "language": lang,
                    **text_dict
                })
        
        return result


# Global voice service instance
voice_service = VoiceService()

