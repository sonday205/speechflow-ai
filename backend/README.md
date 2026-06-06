# SpeechFlow AI Backend

FastAPI backend for audio upload, conversion, chunking, transcription jobs, WebSocket progress, and transcript downloads.

## Setup

```powershell
cd backend
py -3 -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Install `ffmpeg` on Windows and make sure both commands work:

```powershell
ffmpeg -version
ffprobe -version
```

## Run

```powershell
uvicorn app.main:app --reload
```

Backend runs at:

```txt
http://localhost:8000
```

API docs:

```txt
http://localhost:8000/docs
```

## Run with Docker GPU

From the project root:

```powershell
cd D:\SpeechToText\speechflow-ai
docker compose up --build backend
```

The backend container uses CUDA, exposes port `8000`, keeps generated files in
`backend/storage`, and keeps downloaded Whisper models in `backend/.cache`.

Before running the backend, verify Docker can access the NVIDIA GPU:

```powershell
docker run --rm --gpus all nvidia/cuda:12.4.1-base-ubuntu22.04 nvidia-smi
```

To run the frontend locally:

```powershell
cd D:\SpeechToText\speechflow-ai\frontend
npm run dev
```

## Environment

Main variables in `.env`:

```env
FRONTEND_ORIGIN=http://localhost:5173
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
WHISPER_MODEL=small.en
WHISPER_DEVICE=cuda
WHISPER_COMPUTE_TYPE=int8_float16
MAX_AUDIO_DURATION_SECONDS=600
MAX_FILE_SIZE_MB=100
CHUNK_LENGTH_SECONDS=60
CHUNK_OVERLAP_SECONDS=2
```

If CUDA or VRAM is a problem, use:

```env
WHISPER_DEVICE=cpu
WHISPER_COMPUTE_TYPE=int8
```
