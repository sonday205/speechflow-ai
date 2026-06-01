from typing import Literal

from pydantic import BaseModel, Field


JobStatus = Literal["queued", "processing", "completed", "failed"]
VALID_JOB_STATUSES = {"queued", "processing", "completed", "failed"}


class TranscriptSegment(BaseModel):
    start: float = Field(ge=0)
    end: float = Field(ge=0)
    text: str


class TranscriptionResult(BaseModel):
    segments: list[TranscriptSegment] = Field(default_factory=list)
    plain_text: str = ""


class JobState(BaseModel):
    job_id: str
    status: JobStatus = "queued"
    progress: int = Field(default=0, ge=0, le=100)
    message: str = "Transcription job created"
    original_filename: str
    original_path: str | None = None
    result_path: str | None = None
    result: TranscriptionResult | None = None
    error: str | None = None


class JobCreateResponse(BaseModel):
    job_id: str
    status: JobStatus
    message: str


class JobStatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    progress: int = Field(ge=0, le=100)
    message: str
    result: TranscriptionResult | None = None
    error: str | None = None
