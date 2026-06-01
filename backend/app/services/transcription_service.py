from pathlib import Path
from typing import Any

from app.config import Settings, get_settings
from app.services.audio_service import AudioProcessingError


class TranscriptionModelError(RuntimeError):
    pass


class TranscriptionService:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self._model: Any | None = None

    def load_model(self) -> Any:
        if self._model is not None:
            return self._model

        try:
            from faster_whisper import WhisperModel
        except ImportError as exc:
            raise TranscriptionModelError(
                "faster-whisper is not installed. Run pip install -r requirements.txt."
            ) from exc

        try:
            self._model = WhisperModel(
                self.settings.whisper_model,
                device=self.settings.whisper_device,
                compute_type=self.settings.whisper_compute_type,
            )
        except Exception as exc:
            if self.settings.whisper_device == "cuda":
                print(
                    "Failed to load Whisper on CUDA. "
                    "Try WHISPER_DEVICE=cpu and WHISPER_COMPUTE_TYPE=int8, "
                    "or use WHISPER_COMPUTE_TYPE=int8_float16 for lower VRAM."
                )
            raise TranscriptionModelError(f"Whisper model failed to load: {exc}") from exc

        return self._model

    def transcribe_file(self, audio_path: str, time_offset: float = 0.0) -> list[dict]:
        audio_file = Path(audio_path)
        if not audio_file.exists():
            raise AudioProcessingError(f"Audio file not found: {audio_file}")

        model = self.load_model()

        try:
            segments, _info = model.transcribe(
                str(audio_file),
                language="en",
                vad_filter=True,
            )
            return [
                {
                    "start": float(segment.start) + time_offset,
                    "end": float(segment.end) + time_offset,
                    "text": segment.text.strip(),
                }
                for segment in segments
            ]
        except Exception as exc:
            raise TranscriptionModelError(f"Transcription failed: {exc}") from exc


transcription_service = TranscriptionService()
