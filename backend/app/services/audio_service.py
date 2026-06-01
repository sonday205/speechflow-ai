import json
import shutil
import subprocess
from pathlib import Path

from app.config import get_settings


class AudioProcessingError(RuntimeError):
    pass


class FfmpegNotFoundError(AudioProcessingError):
    pass


class AudioDurationError(AudioProcessingError):
    pass


def _run_media_command(command: list[str], tool_name: str) -> subprocess.CompletedProcess:
    resolved_command = command.copy()
    if command and shutil.which(command[0]) is None and command[0] == "ffmpeg":
        try:
            import imageio_ffmpeg

            resolved_command[0] = imageio_ffmpeg.get_ffmpeg_exe()
        except ImportError:
            pass

    try:
        return subprocess.run(
            resolved_command,
            capture_output=True,
            check=True,
            text=True,
        )
    except FileNotFoundError as exc:
        raise FfmpegNotFoundError(
            f"{tool_name} was not found. Please install ffmpeg and make sure it is available in PATH."
        ) from exc
    except subprocess.CalledProcessError as exc:
        error_output = exc.stderr.strip() or exc.stdout.strip()
        raise AudioProcessingError(
            f"{tool_name} failed: {error_output or 'unknown media processing error'}"
        ) from exc


def convert_to_wav(input_path: str, output_path: str) -> str:
    input_file = Path(input_path)
    output_file = Path(output_path)

    if not input_file.exists():
        raise AudioProcessingError(f"Input audio file not found: {input_file}")

    output_file.parent.mkdir(parents=True, exist_ok=True)

    command = [
        "ffmpeg",
        "-y",
        "-i",
        str(input_file),
        "-ar",
        "16000",
        "-ac",
        "1",
        "-c:a",
        "pcm_s16le",
        str(output_file),
    ]
    _run_media_command(command, "ffmpeg")
    return str(output_file)


def get_audio_duration_seconds(path: str) -> float:
    audio_file = Path(path)
    if not audio_file.exists():
        raise AudioProcessingError(f"Audio file not found: {audio_file}")

    command = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "json",
        str(audio_file),
    ]
    try:
        result = _run_media_command(command, "ffprobe")
    except FfmpegNotFoundError:
        return _get_audio_duration_seconds_with_av(audio_file)

    try:
        metadata = json.loads(result.stdout)
        return float(metadata["format"]["duration"])
    except (KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
        raise AudioProcessingError("Could not read audio duration from ffprobe output.") from exc


def _get_audio_duration_seconds_with_av(audio_file: Path) -> float:
    try:
        import av

        with av.open(str(audio_file)) as container:
            if container.duration is not None:
                return float(container.duration / av.time_base)

            audio_stream = next(
                (stream for stream in container.streams if stream.type == "audio"),
                None,
            )
            if audio_stream and audio_stream.duration and audio_stream.time_base:
                return float(audio_stream.duration * audio_stream.time_base)
    except Exception as exc:
        raise AudioProcessingError("Could not read audio duration without ffprobe.") from exc

    raise AudioProcessingError("Could not read audio duration without ffprobe.")


def validate_audio_duration(path: str, max_duration_seconds: int | None = None) -> float:
    settings = get_settings()
    max_duration = max_duration_seconds or settings.max_audio_duration_seconds
    duration = get_audio_duration_seconds(path)

    if duration > max_duration:
        raise AudioDurationError(
            f"Audio duration exceeds the {max_duration // 60}-minute limit."
        )

    return duration


def split_audio_into_chunks(
    wav_path: str,
    output_dir: str,
    chunk_length_seconds: int,
    overlap_seconds: int,
) -> list[dict]:
    wav_file = Path(wav_path)
    chunks_dir = Path(output_dir)

    if not wav_file.exists():
        raise AudioProcessingError(f"WAV file not found: {wav_file}")
    if chunk_length_seconds <= 0:
        raise AudioProcessingError("Chunk length must be greater than 0 seconds.")
    if overlap_seconds < 0:
        raise AudioProcessingError("Chunk overlap cannot be negative.")
    if overlap_seconds >= chunk_length_seconds:
        raise AudioProcessingError("Chunk overlap must be smaller than chunk length.")

    total_duration = get_audio_duration_seconds(str(wav_file))
    if total_duration <= 0:
        raise AudioProcessingError("Audio duration must be greater than 0 seconds.")

    chunks_dir.mkdir(parents=True, exist_ok=True)
    step_seconds = chunk_length_seconds - overlap_seconds
    chunks: list[dict] = []
    start_time = 0.0
    index = 1

    while start_time < total_duration:
        end_time = min(start_time + chunk_length_seconds, total_duration)
        chunk_duration = end_time - start_time
        chunk_path = chunks_dir / f"chunk_{index:03d}.wav"

        command = [
            "ffmpeg",
            "-y",
            "-ss",
            f"{start_time:.3f}",
            "-i",
            str(wav_file),
            "-t",
            f"{chunk_duration:.3f}",
            "-ar",
            "16000",
            "-ac",
            "1",
            "-c:a",
            "pcm_s16le",
            str(chunk_path),
        ]
        _run_media_command(command, "ffmpeg")

        chunks.append(
            {
                "chunk_path": str(chunk_path),
                "start_time": start_time,
                "end_time": end_time,
                "index": index,
            }
        )

        if end_time >= total_duration:
            break

        start_time += step_seconds
        index += 1

    return chunks
