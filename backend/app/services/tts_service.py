import asyncio
import io
import os
import gc
import tempfile
from typing import List, Optional, Tuple

import torch
import torchaudio
from snac import SNAC


DEFAULT_BACKEND_CHECKPOINT = "/home/batman/website2/backend/models/tts/outputs/checkpoint-120"
DEFAULT_ORIGINAL_CHECKPOINT = "/home/batman/.SOMYA/TTS_things/GNR/outputs/checkpoint-120"
ENV_CHECKPOINT = os.environ.get("TTS_CHECKPOINT_PATH")
TEMP_DIR = os.environ.get("APP_TMP_DIR", "/home/batman/website2/backend/tmp")


class TTSInferenceEngine:
    START_TOKEN = 128259
    END_TEXT_TOKEN = 128009
    END_HUMAN_TOKEN = 128260
    PAD_TOKEN = 128263
    AUDIO_START_TOKEN = 128257
    AUDIO_END_TOKEN = 128258
    CODE_OFFSET = 128266

    def __init__(self, checkpoint_path: Optional[str]):
        self.explicit_checkpoint_path = checkpoint_path
        self.checkpoint_path = None  # resolved later
        self.model = None
        self.tokenizer = None
        self.snac_model = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    def load(self) -> None:
        if self.model is not None and self.snac_model is not None:
            return

        torch.cuda.empty_cache()
        gc.collect()

        load_in_4bit = torch.cuda.is_available()

        # Resolve checkpoint path with fallbacks
        candidate_paths = [
            p for p in [
                self.explicit_checkpoint_path,
                ENV_CHECKPOINT,
                DEFAULT_BACKEND_CHECKPOINT,
                DEFAULT_ORIGINAL_CHECKPOINT,
            ]
            if p
        ]
        resolved = None
        for p in candidate_paths:
            if os.path.isdir(p):
                resolved = p
                break
        if resolved is None:
            raise RuntimeError(
                "No valid TTS checkpoint directory found. Set TTS_CHECKPOINT_PATH or copy the checkpoint to backend/models/tts/outputs/checkpoint-120."
            )
        self.checkpoint_path = resolved

        # Allow forcing Transformers/PEFT path to avoid any Unsloth import
        if os.environ.get("TTS_FORCE_TRANSFORMERS", "0") == "1":
            self._load_with_transformers_peft(load_in_4bit)
        else:
            # Try Unsloth first; if it fails (e.g., circular import), fall back to Transformers+PEFT
            try:
                # Hint unsloth to avoid importing vision/VLM stacks which may cause circular import in some builds
                os.environ.setdefault("UNSLOTH_DISABLE_VISION", "1")
                os.environ.setdefault("UNSLOTH_DISABLE_VLM", "1")
                os.environ.setdefault("UNSLOTH_DISABLE_IMAGE", "1")
                os.environ.setdefault("UNSLOTH_DISABLE_VLLM", "1")

                # Lazily import unsloth here to avoid module import at app load
                from unsloth import FastLanguageModel as UFastLanguageModel  # type: ignore

                self.model, self.tokenizer = UFastLanguageModel.from_pretrained(
                    model_name=self.checkpoint_path,
                    max_seq_length=2048,
                    dtype=None,
                    load_in_4bit=load_in_4bit,
                )

                self.model = UFastLanguageModel.get_peft_model(
                    self.model,
                    r=64,
                    target_modules=[
                        "q_proj",
                        "k_proj",
                        "v_proj",
                        "o_proj",
                        "gate_proj",
                        "up_proj",
                        "down_proj",
                    ],
                    lora_alpha=64,
                    lora_dropout=0,
                    bias="none",
                    use_gradient_checkpointing="unsloth",
                    random_state=3407,
                    use_rslora=False,
                    loftq_config=None,
                )

                if self.tokenizer.pad_token is None:
                    self.tokenizer.pad_token = self.tokenizer.eos_token
                    self.tokenizer.pad_token_id = self.tokenizer.eos_token_id

                UFastLanguageModel.for_inference(self.model)

                # Move model to target device if supported
                try:
                    self.model.to(self.device)  # type: ignore[attr-defined]
                except Exception:
                    pass
            except Exception:
                # Fallback: vanilla Transformers + PEFT LoRA
                self._load_with_transformers_peft(load_in_4bit)

        self.snac_model = SNAC.from_pretrained("hubertsiuzdak/snac_24khz").to("cpu")

    def _load_with_transformers_peft(self, want_4bit: bool) -> None:
        # Deferred imports to avoid heavy modules at import time
        from peft import PeftConfig, PeftModel
        from transformers import AutoModelForCausalLM, AutoTokenizer
        try:
            from transformers import BitsAndBytesConfig  # type: ignore
        except Exception:
            BitsAndBytesConfig = None  # type: ignore

        peft_config = PeftConfig.from_pretrained(self.checkpoint_path)
        base_model_name = peft_config.base_model_name_or_path

        quant_config = None
        if want_4bit and torch.cuda.is_available() and 'bitsandbytes' in {m.__name__ for m in list(__import__('sys').modules.values()) if hasattr(m, '__name__')}:
            if BitsAndBytesConfig is not None:
                quant_config = BitsAndBytesConfig(
                    load_in_4bit=True,
                    bnb_4bit_use_double_quant=True,
                    bnb_4bit_quant_type="nf4",
                    bnb_4bit_compute_dtype=torch.float16,
                )

        self.model = AutoModelForCausalLM.from_pretrained(
            base_model_name,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto" if torch.cuda.is_available() else None,
            quantization_config=quant_config,
        )
        self.model = PeftModel.from_pretrained(self.model, self.checkpoint_path)
        self.model.eval()

        self.tokenizer = AutoTokenizer.from_pretrained(base_model_name)
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
            self.tokenizer.pad_token_id = self.tokenizer.eos_token_id

    def prepare_inputs(self, prompts: List[str], voice_prefix: Optional[str]) -> Tuple[torch.Tensor, torch.Tensor]:
        if voice_prefix:
            prompts = [f"{voice_prefix}: {p}" for p in prompts]

        all_input_ids: List[torch.Tensor] = []
        for prompt in prompts:
            input_ids = self.tokenizer(prompt, return_tensors="pt").input_ids
            all_input_ids.append(input_ids)

        start_token = torch.tensor([[self.START_TOKEN]], dtype=torch.int64)
        end_tokens = torch.tensor([[self.END_TEXT_TOKEN, self.END_HUMAN_TOKEN]], dtype=torch.int64)

        modified_inputs: List[torch.Tensor] = []
        for input_ids in all_input_ids:
            modified = torch.cat([start_token, input_ids, end_tokens], dim=1)
            modified_inputs.append(modified)

        max_length = max(ids.shape[1] for ids in modified_inputs)

        padded_tensors: List[torch.Tensor] = []
        attention_masks: List[torch.Tensor] = []
        for input_ids in modified_inputs:
            padding_len = max_length - input_ids.shape[1]
            padded = torch.cat(
                [torch.full((1, padding_len), self.PAD_TOKEN, dtype=torch.int64), input_ids],
                dim=1,
            )
            attention_mask = torch.cat(
                [torch.zeros((1, padding_len), dtype=torch.int64), torch.ones((1, input_ids.shape[1]), dtype=torch.int64)],
                dim=1,
            )
            padded_tensors.append(padded)
            attention_masks.append(attention_mask)

        input_ids = torch.cat(padded_tensors, dim=0)
        attention_mask = torch.cat(attention_masks, dim=0)
        return input_ids, attention_mask

    def generate_codes(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        target_device = self.device
        input_ids = input_ids.to(target_device)
        attention_mask = attention_mask.to(target_device)
        with torch.no_grad():
            generated_ids = self.model.generate(  # type: ignore[operator]
                input_ids=input_ids,
                attention_mask=attention_mask,
                max_new_tokens=1200,
                do_sample=True,
                temperature=0.6,
                top_p=0.95,
                repetition_penalty=1.1,
                num_return_sequences=1,
                eos_token_id=self.AUDIO_END_TOKEN,
                use_cache=True,
            )
        return generated_ids

    def extract_code_lists(self, generated_ids: torch.Tensor) -> List[List[int]]:
        token_indices = (generated_ids == self.AUDIO_START_TOKEN).nonzero(as_tuple=True)
        if len(token_indices[1]) > 0:
            last_idx = token_indices[1][-1].item()
            cropped = generated_ids[:, last_idx + 1 :]
        else:
            cropped = generated_ids

        processed_rows: List[torch.Tensor] = []
        for row in cropped:
            masked = row[row != self.AUDIO_END_TOKEN]
            processed_rows.append(masked)

        code_lists: List[List[int]] = []
        for row in processed_rows:
            row_len = row.size(0)
            new_len = (row_len // 7) * 7
            trimmed = row[:new_len]
            code_list = [int(t) - self.CODE_OFFSET for t in trimmed]
            code_lists.append(code_list)
        return code_lists

    def decode_audio_codes(self, code_list: List[int]) -> torch.Tensor:
        if len(code_list) == 0:
            return torch.zeros(1, 1)

        num_frames = len(code_list) // 7
        layer_1: List[int] = []
        layer_2: List[int] = []
        layer_3: List[int] = []
        for i in range(num_frames):
            base_idx = 7 * i
            layer_1.append(code_list[base_idx])
            layer_2.append(code_list[base_idx + 1] - 4096)
            layer_3.append(code_list[base_idx + 2] - (2 * 4096))
            layer_3.append(code_list[base_idx + 3] - (3 * 4096))
            layer_2.append(code_list[base_idx + 4] - (4 * 4096))
            layer_3.append(code_list[base_idx + 5] - (5 * 4096))
            layer_3.append(code_list[base_idx + 6] - (6 * 4096))

        codes = [
            torch.tensor(layer_1).unsqueeze(0),
            torch.tensor(layer_2).unsqueeze(0),
            torch.tensor(layer_3).unsqueeze(0),
        ]
        with torch.no_grad():
            audio_waveform = self.snac_model.decode(codes)
        return audio_waveform

    def save_audio_to_file(self, audio_tensor: torch.Tensor) -> bytes:
        os.makedirs(TEMP_DIR, exist_ok=True)
        audio = audio_tensor.cpu().squeeze()
        if audio.dim() == 1:
            audio = audio.unsqueeze(0)
        elif audio.dim() > 2:
            audio = audio.view(-1, audio.size(-1))

        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav", dir=TEMP_DIR) as tmp:
            tmp_path = tmp.name
        try:
            torchaudio.save(tmp_path, audio, sample_rate=24000)
            with open(tmp_path, "rb") as f:
                data = f.read()
            return data
        finally:
            try:
                os.remove(tmp_path)
            except Exception:
                pass

    def synthesize(self, prompts: List[str], voice_prefix: Optional[str]) -> bytes:
        self.load()
        input_ids, attention_mask = self.prepare_inputs(prompts, voice_prefix)
        generated_ids = self.generate_codes(input_ids, attention_mask)
        code_lists = self.extract_code_lists(generated_ids)
        audio_bytes: Optional[bytes] = None
        for code_list in code_lists:
            audio_wave = self.decode_audio_codes(code_list)
            audio_bytes = self.save_audio_to_file(audio_wave)
            break  # Return first sample
        if audio_bytes is None:
            audio_bytes = b""
        return audio_bytes


_tts_engine: Optional[TTSInferenceEngine] = None
_engine_lock = asyncio.Lock()


async def _get_engine() -> TTSInferenceEngine:
    global _tts_engine
    if _tts_engine is not None:
        return _tts_engine
    async with _engine_lock:
        if _tts_engine is None:
            _tts_engine = TTSInferenceEngine(ENV_CHECKPOINT)
            # Load synchronously in a thread to avoid blocking event loop
            await asyncio.to_thread(_tts_engine.load)
    return _tts_engine


async def synthesize_speech(text: str, voice_prefix: Optional[str]) -> bytes:
    engine = await _get_engine()
    prompts = [text]
    audio_bytes: bytes = await asyncio.to_thread(engine.synthesize, prompts, voice_prefix)
    return audio_bytes


