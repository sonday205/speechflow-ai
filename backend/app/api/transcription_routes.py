from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse

from app.config import RESULTS_DIR, UPLOADS_DIR, get_settings
from app.models.schemas import JobCreateResponse, JobStatusResponse
from app.services import job_service
from app.services.file_service import (
    UploadedFileTooLargeError,
    UnsupportedFileTypeError,
    get_safe_filename,
    get_upload_file_size,
    save_upload_file,
    validate_audio_extension,
)
from app.workers.transcription_worker import process_transcription_job


router = APIRouter(prefix="/api/transcriptions", tags=["transcriptions"])
settings = get_settings()


@router.get("/test")
async def test_transcription_route() -> dict[str, str]:
    return {
        "status": "ok",
        "message": "Transcription route is ready",
    }


@router.post("", response_model=JobCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_transcription(
    background_tasks: BackgroundTasks,
    file: UploadFile | None = File(None),
) -> dict:
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No audio file was provided.",
        )

    try:
        validate_audio_extension(file.filename)
    except UnsupportedFileTypeError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    file_size = get_upload_file_size(file)
    max_size_bytes = settings.max_file_size_mb * 1024 * 1024
    if file_size is not None and file_size > max_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File is too large. Maximum allowed size is {settings.max_file_size_mb}MB.",
        )

    safe_filename = get_safe_filename(file.filename)
    job = job_service.create_job(original_filename=file.filename)
    saved_path = UPLOADS_DIR / f"{job['job_id']}_{safe_filename}"

    try:
        await save_upload_file(file, saved_path, settings.max_file_size_mb)
    except UploadedFileTooLargeError as exc:
        job_service.set_job_failed(job["job_id"], str(exc))
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=str(exc),
        ) from exc

    job_service.update_job(
        job["job_id"],
        original_path=str(saved_path),
        message="Transcription job created",
    )
    background_tasks.add_task(process_transcription_job, job["job_id"])

    return {
        "job_id": job["job_id"],
        "status": "queued",
        "message": "Transcription job created",
    }


@router.get("/{job_id}", response_model=JobStatusResponse)
async def get_transcription(job_id: str) -> dict:
    job = job_service.get_job(job_id)
    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcription job not found.",
        )
    return job


@router.get("/{job_id}/download")
async def download_transcription(job_id: str) -> FileResponse:
    job = job_service.get_job(job_id)
    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcription job not found.",
        )

    if job["status"] != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transcription is not completed yet.",
        )

    result_path = Path(job.get("result_path") or RESULTS_DIR / f"{job_id}.txt")
    if not result_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcript file was not found.",
        )

    return FileResponse(
        path=str(result_path),
        media_type="text/plain",
        filename=f"speechflow_{job_id}.txt",
    )
