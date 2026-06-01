from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[1]
STORAGE_DIR = BASE_DIR / "storage"
UPLOADS_DIR = STORAGE_DIR / "uploads"
CONVERTED_DIR = STORAGE_DIR / "converted"
CHUNKS_DIR = STORAGE_DIR / "chunks"
RESULTS_DIR = STORAGE_DIR / "results"


class Settings(BaseSettings):
    app_name: str = "SpeechFlow AI Backend"
    app_env: str = "development"
    backend_host: str = "http://localhost:8000"
    frontend_origin: str = "http://localhost:5173"
    frontend_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    whisper_model: str = "small.en"
    whisper_device: str = "cuda"
    whisper_compute_type: str = "float16"

    max_audio_duration_seconds: int = 600
    max_file_size_mb: int = 100
    chunk_length_seconds: int = 60
    chunk_overlap_seconds: int = 2

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    def get_cors_origins(self) -> list[str]:
        origins = [self.frontend_origin]
        origins.extend(
            origin.strip()
            for origin in self.frontend_origins.split(",")
            if origin.strip()
        )
        return list(dict.fromkeys(origins))


@lru_cache
def get_settings() -> Settings:
    return Settings()


def ensure_storage_dirs() -> None:
    for directory in (UPLOADS_DIR, CONVERTED_DIR, CHUNKS_DIR, RESULTS_DIR):
        directory.mkdir(parents=True, exist_ok=True)
