from pathlib import Path

from app.config import CHUNKS_DIR, CONVERTED_DIR, RESULTS_DIR, get_settings
from app.services import job_service
from app.services.audio_service import (
    convert_to_wav,
    split_audio_into_chunks,
    validate_audio_duration,
)
from app.services.transcription_service import transcription_service
from app.websocket.progress_ws import manager


settings = get_settings()


async def _update_job(job_id: str, **kwargs) -> dict:
    job = job_service.update_job(job_id, **kwargs)
    await manager.send_update(job_id, job)
    return job


async def process_transcription_job(job_id: str) -> None:
    try:
        job = job_service.get_job(job_id)
        if job is None:
            raise RuntimeError("Transcription job not found.")

        original_path = job.get("original_path")
        if not original_path:
            raise RuntimeError("Uploaded audio path is missing.")

        await _update_job(
            job_id,
            status="processing",
            progress=5,
            message="Preparing file...",
            error=None,
        )

        converted_path = CONVERTED_DIR / f"{job_id}.wav"
        await _update_job(
            job_id,
            progress=15,
            message="Converting audio...",
        )
        convert_to_wav(original_path, str(converted_path))
        validate_audio_duration(str(converted_path), settings.max_audio_duration_seconds)

        chunks_dir = CHUNKS_DIR / job_id
        await _update_job(
            job_id,
            progress=25,
            message="Splitting audio...",
        )
        chunks = split_audio_into_chunks(
            str(converted_path),
            str(chunks_dir),
            settings.chunk_length_seconds,
            settings.chunk_overlap_seconds,
        )
        if not chunks:
            raise RuntimeError("No audio chunks were created.")

        all_segments: list[dict] = []
        total_chunks = len(chunks)

        for chunk in chunks:
            chunk_index = int(chunk["index"])
            await _update_job(
                job_id,
                progress=25 + int(((chunk_index - 1) / total_chunks) * 70),
                message=f"Processing chunk {chunk_index}/{total_chunks}...",
            )
            segments = transcription_service.transcribe_file(
                chunk["chunk_path"],
                time_offset=float(chunk["start_time"]),
            )
            all_segments.extend(segments)

        await _update_job(
            job_id,
            progress=95,
            message="Finalizing transcript...",
        )

        plain_text = " ".join(segment["text"] for segment in all_segments if segment["text"])
        result = {
            "segments": all_segments,
            "plain_text": plain_text,
        }

        RESULTS_DIR.mkdir(parents=True, exist_ok=True)
        result_path = Path(RESULTS_DIR) / f"{job_id}.txt"
        result_path.write_text(plain_text, encoding="utf-8")

        job_service.set_job_completed(job_id, result)
        completed_job = job_service.update_job(job_id, result_path=str(result_path))
        await manager.send_update(job_id, completed_job)

    except Exception as exc:
        failed_job = job_service.set_job_failed(job_id, str(exc))
        await manager.send_update(job_id, failed_job)
