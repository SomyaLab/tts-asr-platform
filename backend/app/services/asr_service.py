import asyncio
from pathlib import Path
from typing import Optional

import numpy as np
from fastapi import UploadFile

from .asr_utils import ASRModel, processor


_asr_model: Optional[ASRModel] = None
_asr_lock = asyncio.Lock()


async def _get_asr(language: str) -> ASRModel:
    global _asr_model
    if _asr_model is None:
        async with _asr_lock:
            if _asr_model is None:
                _asr_model = ASRModel(model_size="medium", language=language, vad_enabled=True, batch_size=16, beam_size=5)
    return _asr_model


async def transcribe_file(file: UploadFile, language: Optional[str] = "en") -> str:
    asr = await _get_asr(language or "en")
    proc = processor()
    # Read file into temp on disk for librosa compatibility
    contents = await file.read()
    path = Path("/home/batman/website2/backend/tmp/" + file.filename)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(contents)
    try:
        audio, sr = proc.preprocess_audio(path, target_sr=16000)
        results = await asyncio.to_thread(asr.transcribe, audio, sr)
        transcript = " ".join([item.get("text", "") for item in results]).strip()
        return transcript
    finally:
        try:
            path.unlink(missing_ok=True)  # type: ignore[arg-type]
        except Exception:
            pass


