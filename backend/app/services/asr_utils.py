# Thin wrappers: reuse the user's ASR code so we don't modify logic
# Copied lightly from /home/batman/website/tts_api/asr/main.py

import warnings
warnings.filterwarnings("ignore")

import torch
import librosa
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Optional, Union, Tuple
from faster_whisper import WhisperModel, BatchedInferencePipeline


def _clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    return " ".join(text.strip().split())


class ASRModel:
    def __init__(
        self,
        model_size: str = "small",
        language: str = "en",
        *,
        compute_type: Optional[str] = None,
        device_index: Optional[Union[int, List[int]]] = None,
        vad_enabled: bool = True,
        batch_size: Optional[int] = None,
        beam_size: int = 5,
    ):
        self.language = language
        self.vad_enabled = vad_enabled
        self.batch_size = batch_size
        self.beam_size = beam_size
        self.device = self._get_device()
        if compute_type is None:
            if self.device.type == "cuda":
                compute_type = "float32"
            else:
                compute_type = "float32"
        model_name = model_size.strip()
        try:
            fw_device = "cuda" if self.device.type == "cuda" else "cpu"
            if device_index is None:
                self.model = WhisperModel(model_name, device=fw_device, compute_type=compute_type)
            else:
                self.model = WhisperModel(model_name, device=fw_device, device_index=device_index, compute_type=compute_type)
            self.pipeline = BatchedInferencePipeline(self.model)
        except Exception as e:
            raise RuntimeError(f"Error loading faster-whisper model: {e}")

    def _get_device(self):
        if torch.cuda.is_available():
            return torch.device("cuda")
        elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            return torch.device("mps")
        else:
            return torch.device("cpu")

    def transcribe(self, audio: np.ndarray, sr: int = 16000) -> List[Dict[str, Any]]:
        try:
            bs = self.batch_size if isinstance(self.batch_size, int) and self.batch_size > 0 else 16
            lang_value = (self.language or "").strip().lower()
            effective_language: Optional[str] = None if lang_value in ("", "auto", "none") else self.language
            segments, _info = self.pipeline.transcribe(
                audio,
                language=effective_language,
                vad_filter=self.vad_enabled,
                without_timestamps=True,
                word_timestamps=False,
                beam_size=self.beam_size,
                batch_size=bs,
            )
            out: List[Dict[str, Any]] = [{"text": _clean_text(getattr(seg, "text", "") or "")} for seg in segments]
            detected_language = None
            try:
                detected_language = getattr(_info, "language", None)
                if detected_language is None and isinstance(_info, dict):
                    detected_language = _info.get("language")
            except Exception:
                detected_language = None
            if effective_language is None and not detected_language:
                segments_en, _info_en = self.pipeline.transcribe(
                    audio,
                    language="en",
                    vad_filter=self.vad_enabled,
                    without_timestamps=True,
                    word_timestamps=False,
                    beam_size=self.beam_size,
                    batch_size=bs,
                )
                out = [{"text": _clean_text(getattr(seg, "text", "") or "")} for seg in segments_en]
            return out
        except Exception as e:
            raise RuntimeError(f"Error during faster-whisper transcription: {e}")


class processor:
    def __init__(self):
        pass

    def get_input(self, uploaded_file: Path = None, recording: np.ndarray = None, sr: int = 16000) -> Tuple[np.ndarray, int]:
        if uploaded_file is not None:
            audio, sample_rate = self.preprocess_audio(uploaded_file, target_sr=sr)
            return audio, sample_rate
        elif recording is not None:
            return recording, sr
        else:
            raise ValueError("No audio input provided. Please upload a file or provide a recording.")

    def preprocess_audio(self, audio_file: Path, target_sr: int = 16000) -> Tuple[np.ndarray, int]:
        try:
            audio, sr = librosa.load(str(audio_file), sr=None)
            if sr != target_sr:
                audio = librosa.resample(audio, orig_sr=sr, target_sr=target_sr)
                sr = target_sr
            return audio, sr
        except Exception as e:
            raise RuntimeError(f"Error loading audio {audio_file}: {e}")


