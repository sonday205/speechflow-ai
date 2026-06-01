from copy import deepcopy
from threading import RLock
from uuid import uuid4

from app.models.schemas import JobState, TranscriptionResult


_jobs: dict[str, dict] = {}
_jobs_lock = RLock()


def _copy_job(job: dict) -> dict:
    return deepcopy(job)


def create_job(original_filename: str) -> dict:
    job = JobState(
        job_id=str(uuid4()),
        original_filename=original_filename,
    ).model_dump()

    with _jobs_lock:
        _jobs[job["job_id"]] = job
        return _copy_job(job)


def get_job(job_id: str) -> dict | None:
    with _jobs_lock:
        job = _jobs.get(job_id)
        return _copy_job(job) if job else None


def update_job(job_id: str, **kwargs) -> dict:
    with _jobs_lock:
        current_job = _jobs.get(job_id)
        if current_job is None:
            raise KeyError(f"Job not found: {job_id}")

        updated_job = JobState(**{**current_job, **kwargs}).model_dump()
        _jobs[job_id] = updated_job
        return _copy_job(updated_job)


def set_job_completed(job_id: str, result: dict) -> dict:
    transcription_result = TranscriptionResult(**result).model_dump()
    return update_job(
        job_id,
        status="completed",
        progress=100,
        message="Transcription completed",
        result=transcription_result,
        error=None,
    )


def set_job_failed(job_id: str, error: str) -> dict:
    return update_job(
        job_id,
        status="failed",
        progress=0,
        message=error,
        error=error,
    )


def list_jobs() -> list[dict]:
    with _jobs_lock:
        return [_copy_job(job) for job in _jobs.values()]
