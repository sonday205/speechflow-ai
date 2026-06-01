import re
from pathlib import Path

from fastapi import UploadFile


SUPPORTED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".m4a", ".webm", ".ogg", ".mp4"}
CHUNK_SIZE = 1024 * 1024


class UnsupportedFileTypeError(ValueError):
    pass


class UploadedFileTooLargeError(ValueError):
    pass


def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()


def validate_audio_extension(filename: str) -> None:
    extension = get_file_extension(filename)
    if extension not in SUPPORTED_AUDIO_EXTENSIONS:
        supported = ", ".join(sorted(SUPPORTED_AUDIO_EXTENSIONS))
        raise UnsupportedFileTypeError(
            f"Unsupported audio format. Supported formats: {supported}"
        )


def get_safe_filename(filename: str) -> str:
    original_name = Path(filename).name
    stem = Path(original_name).stem or "audio"
    extension = get_file_extension(original_name)
    safe_stem = re.sub(r"[^A-Za-z0-9_-]+", "_", stem).strip("_") or "audio"
    return f"{safe_stem}{extension}"


def get_upload_file_size(upload_file: UploadFile) -> int | None:
    file_object = upload_file.file

    try:
        current_position = file_object.tell()
        file_object.seek(0, 2)
        size = file_object.tell()
        file_object.seek(current_position)
        return size
    except (OSError, AttributeError):
        return None


async def save_upload_file(
    upload_file: UploadFile,
    destination: Path,
    max_size_mb: int,
) -> Path:
    max_size_bytes = max_size_mb * 1024 * 1024
    total_bytes = 0

    destination.parent.mkdir(parents=True, exist_ok=True)
    await upload_file.seek(0)

    try:
        with destination.open("wb") as output_file:
            while chunk := await upload_file.read(CHUNK_SIZE):
                total_bytes += len(chunk)
                if total_bytes > max_size_bytes:
                    raise UploadedFileTooLargeError(
                        f"File is too large. Maximum allowed size is {max_size_mb}MB."
                    )
                output_file.write(chunk)
    except Exception:
        destination.unlink(missing_ok=True)
        raise
    finally:
        await upload_file.seek(0)

    return destination
