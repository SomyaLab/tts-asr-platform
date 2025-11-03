Website2 Backend (FastAPI)

Run locally:

1) Create venv and install requirements:
   python3 -m venv .venv && source .venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt

2) Ensure TTS checkpoint is available at:
   /home/batman/website2/backend/models/tts/outputs/checkpoint-120
   (copied from /home/batman/.SOMYA/TTS_things/GNR/outputs/checkpoint-120)

3) Start server:
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

Endpoints:
- GET /health
- POST /tts  {"text": "hello", "voice_prefix": "optional"} -> audio/wav
- POST /asr  multipart/form-data with file=<audio>, language=en -> {text}

Environment variables:
- TTS_CHECKPOINT_PATH: override checkpoint path (default models/tts/outputs/checkpoint-120)
- APP_TMP_DIR: temporary dir for audio files (default backend/tmp)


