"""Voice management service."""
import logging
from typing import List, Optional
from app.config import settings


logger = logging.getLogger(__name__)


class VoiceService:
    """Service for voice management operations."""
    
    @staticmethod
    def get_reference_voices() -> List[dict]:
        """
        Get list of available reference voices.
        Voices are managed by the model server, so we return a static list
        based on known voice names.
        
        Returns:
            List of voice dictionaries
        """
        # Voice names mapped by language and gender
        # These match the voice names used in the frontend and model server
        voices = [
            {"language": "en", "voice_name": "patrick", "available": True},
            {"language": "en", "voice_name": "diana", "available": True},
            {"language": "hi", "voice_name": "surya", "available": True},
            {"language": "hi", "voice_name": "pooja", "available": True},
            {"language": "kn", "voice_name": "ranna", "available": True},
            {"language": "kn", "voice_name": "vidhya", "available": True},
            {"language": "te", "voice_name": "arush", "available": True},
            {"language": "te", "voice_name": "bhagya", "available": True},
            {"language": "ma", "voice_name": "kabir", "available": True},
            {"language": "ma", "voice_name": "neha", "available": True},
            {"language": "sa", "voice_name": "raghava", "available": True},
            {"language": "sa", "voice_name": "janki", "available": True},
        ]
        return voices
    
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

