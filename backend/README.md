# TTS-ASR Platform Backend

Production-ready FastAPI backend for Text-to-Speech (TTS) and Automatic Speech Recognition (ASR) platform.

## Features

- **TTS Integration**: Text-to-Speech conversion with voice, speed, volume, and emotion control
- **ASR Integration**: Speech-to-Text transcription with noise suppression
- **Noise Suppression**: Backend-side audio noise reduction for improved ASR accuracy
- **Reference Voices**: Default speaker voices and examples for multiple languages
- **Production Ready**: Rate limiting, error handling, logging, health checks
- **Optimized**: Efficient audio processing pipeline with format conversion

## Supported Languages

- English (en)
- Hindi (hi)
- Kannada (kn)
- Telugu (te)
- Marathi (ma)
- Sanskrit (sa)

## Installation

1. **Create virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Configure environment variables**:
```bash
cp .env.example .env
# Edit .env with your model endpoints and configuration
```

4. **Set up reference voices** (optional):
   - Copy reference audio files to `storage/reference_voices/{language}/{gender}.mp3`
   - Example: `storage/reference_voices/en/female.mp3`

## Configuration

Key environment variables (see `.env.example`):

- `ASR_MODEL_URL`: URL to your deployed ASR REST API endpoint
- `TTS_MODEL_URL`: URL to your deployed TTS REST API endpoint
- `STORAGE_PATH`: Path for storing reference voices and examples
- `NOISE_SUPPRESSION_ENABLED`: Enable/disable noise suppression (default: true)
- `MAX_AUDIO_SIZE_MB`: Maximum upload size in MB (default: 50)
- `CORS_ORIGINS`: Comma-separated list of allowed CORS origins

## Running the Server

**Development mode**:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Production mode**:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### Core Endpoints (Frontend Compatible)

- `POST /tts` - Text-to-Speech conversion
  - Request body: `{ "text": "...", "voice": "...", "language": "...", "speed": 1.0, "volume": 1.0 }`
  - Response: Audio file (WAV format)

- `POST /asr` - Speech-to-Text transcription
  - Request: FormData with `audio` file
  - Optional: `language` form field
  - Response: `{ "text": "...", "transcript": "..." }`

### Additional Endpoints

- `GET /health` - Health check
- `GET /api/v1/voices/reference` - List reference voices
- `GET /api/v1/voices/reference/{language}/{gender}` - Get reference voice audio
- `GET /api/v1/examples/tts` - Get TTS example texts
- `GET /api/v1/examples/asr` - Get ASR example texts

### API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── api/v1/              # API endpoints
│   ├── core/                # Core functionality (security, exceptions)
│   ├── services/            # Business logic services
│   ├── models/              # Pydantic schemas
│   ├── utils/               # Utility functions
│   └── storage/             # Storage management
├── storage/
│   └── reference_voices/    # Reference voice files
├── tests/                   # Test files
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Audio Processing

The backend includes:

- **Format Conversion**: Automatic conversion to WAV format (16kHz)
- **Noise Suppression**: Uses `noisereduce` library for audio cleaning
- **Validation**: File size, duration, and format validation
- **Optimization**: Efficient processing pipeline

## Dependencies

- **FastAPI**: Modern web framework
- **librosa**: Audio processing and analysis
- **noisereduce**: Noise suppression
- **httpx**: Async HTTP client for model integration
- **slowapi**: Rate limiting

## Frontend Integration

The backend is designed to work seamlessly with the React frontend:

1. Frontend expects `VITE_API_BASE_URL` environment variable (defaults to `http://localhost:8000`)
2. Direct endpoints (`/tts`, `/asr`) are available without `/api/v1` prefix for compatibility
3. CORS is configured to allow frontend origins

## Development

### Running Tests

```bash
pytest tests/
```

### Code Style

The project follows PEP 8 style guidelines. Consider using:
- `black` for code formatting
- `flake8` for linting
- `mypy` for type checking

## Production Deployment

1. Set environment variables appropriately
2. Use a production ASGI server (e.g., `uvicorn` with multiple workers)
3. Set up reverse proxy (nginx) for HTTPS
4. Configure proper logging and monitoring
5. Set up health check monitoring

## License

Copyright © 2025 Somya AI. All rights reserved.

