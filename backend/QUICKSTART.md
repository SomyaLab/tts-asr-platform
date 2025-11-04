# Quick Start Guide

## Installation

1. **Navigate to backend directory**:
```bash
cd tts-asr-platform/backend
```

2. **Create and activate virtual environment**:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Configure environment**:
```bash
# Copy example env file
cp .env.example .env

# Edit .env and set your model endpoints:
# ASR_MODEL_URL=http://your-asr-server:port/asr
# TTS_MODEL_URL=http://your-tts-server:port/tts
```

## Running the Server

**Development mode** (with auto-reload):
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Production mode**:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Testing the API

1. **Health check**:
```bash
curl http://localhost:8000/health
```

2. **TTS endpoint**:
```bash
curl -X POST http://localhost:8000/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, world!", "voice": "Tessa", "language": "en"}' \
  --output output.wav
```

3. **ASR endpoint**:
```bash
curl -X POST http://localhost:8000/asr \
  -F "audio=@your_audio_file.wav" \
  -F "language=en"
```

## API Documentation

Once the server is running:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Frontend Integration

The backend is configured to work with the React frontend:

1. Set `VITE_API_BASE_URL=http://localhost:8000` in your frontend `.env`
2. The frontend will automatically connect to the backend
3. Direct endpoints (`/tts`, `/asr`) are available without `/api/v1` prefix

## Troubleshooting

**Module not found errors**:
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again

**Model connection errors**:
- Verify `ASR_MODEL_URL` and `TTS_MODEL_URL` in `.env` are correct
- Check that your model servers are running and accessible

**CORS errors**:
- Add your frontend URL to `CORS_ORIGINS` in `.env`
- Default includes: `http://localhost:5173,http://localhost:3000`

**Audio processing errors**:
- Ensure `librosa` and `noisereduce` are installed
- Check audio file format and size limits

