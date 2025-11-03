from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import io
import uvicorn
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Website2 TTS/ASR API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TTSPayload(BaseModel):
    text: str
    voice_prefix: Optional[str] = None


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/tts")
async def tts_endpoint(payload: TTSPayload):
    try:
        from .services.tts_service import synthesize_speech
        audio_wav_bytes = await synthesize_speech(payload.text, payload.voice_prefix)
        if not audio_wav_bytes:
            raise HTTPException(status_code=500, detail="TTS synthesis failed")
        return StreamingResponse(io.BytesIO(audio_wav_bytes), media_type="audio/wav")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/asr")
async def asr_endpoint(file: UploadFile = File(...), language: Optional[str] = Form("en")):
    try:
        from .services.asr_service import transcribe_file
        transcript = await transcribe_file(file, language)
        return JSONResponse({"text": transcript})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)


