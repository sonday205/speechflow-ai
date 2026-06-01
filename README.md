# SpeechFlow AI

SpeechFlow AI is a full-stack English speech-to-text web app built with React, Tailwind CSS, FastAPI, WebSocket, ffmpeg, and faster-whisper.

It supports uploading audio files, recording audio directly in the browser, tracking realtime transcription progress, viewing timestamped transcript segments, copying plain text, and downloading the final transcript as `.txt`.

## Demo

Demo GIF placeholder:

```txt
docs/demo/speechflow-ai-demo.gif
```

## Screenshots

Screenshot placeholders:

```txt
docs/screenshots/home.png
docs/screenshots/progress.png
docs/screenshots/transcript.png
```

## Features

- Upload audio files: `.mp3`, `.wav`, `.m4a`, `.webm`, `.ogg`, `.mp4`
- Record directly in the browser with press-and-hold recording
- Convert audio to WAV, 16000 Hz, mono using ffmpeg
- Split audio into overlapping chunks for long-file processing
- Run English transcription with faster-whisper
- Stream job progress through WebSocket
- Display transcript with timestamps
- Copy transcript text to clipboard
- Download transcript as `.txt`
- Keep local job state in memory for version 1

## Tech Stack

Frontend:

- React
- Vite
- Tailwind CSS
- MediaRecorder API
- WebSocket API

Backend:

- Python
- FastAPI
- Uvicorn
- WebSocket
- faster-whisper
- ffmpeg / ffprobe
- Pydantic settings

## Architecture

```txt
User
 |
 | upload file / hold-to-record
 v
React Frontend
 |
 | POST /api/transcriptions
 v
FastAPI Backend
 |
 | save upload
 | convert to WAV 16k mono
 | split into chunks
 | run faster-whisper
 | save result txt
 v
WebSocket Progress
 |
 v
React Frontend
 |
 | progress bar
 | timestamped transcript
 | copy / download
```

## Local Setup

### 1. Install ffmpeg

Install ffmpeg on Windows and make sure these commands work:

```powershell
ffmpeg -version
ffprobe -version
```

### 2. Run Backend

```powershell
cd backend
py -3 -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Backend:

```txt
http://localhost:8000
```

API docs:

```txt
http://localhost:8000/docs
```

### 3. Run Frontend

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend:

```txt
http://localhost:5173
```

## Environment Variables

Backend `.env`:

```env
APP_NAME=SpeechFlow AI Backend
APP_ENV=development
BACKEND_HOST=http://localhost:8000
FRONTEND_ORIGIN=http://localhost:5173
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

WHISPER_MODEL=small.en
WHISPER_DEVICE=cuda
WHISPER_COMPUTE_TYPE=float16

MAX_AUDIO_DURATION_SECONDS=600
MAX_FILE_SIZE_MB=100
CHUNK_LENGTH_SECONDS=60
CHUNK_OVERLAP_SECONDS=2
```

Frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000
```

## API Documentation

Health check:

```http
GET /api/health
```

Create transcription job:

```http
POST /api/transcriptions
Content-Type: multipart/form-data

file: audio file
```

Get job status:

```http
GET /api/transcriptions/{job_id}
```

Download transcript:

```http
GET /api/transcriptions/{job_id}/download
```

Realtime progress:

```txt
WS /ws/transcriptions/{job_id}
```

## Folder Structure

```txt
speechflow-ai/
|-- backend/
|   |-- app/
|   |   |-- api/
|   |   |-- models/
|   |   |-- services/
|   |   |-- websocket/
|   |   |-- workers/
|   |   |-- config.py
|   |   `-- main.py
|   |-- storage/
|   |   |-- uploads/
|   |   |-- converted/
|   |   |-- chunks/
|   |   `-- results/
|   |-- .env.example
|   |-- README.md
|   `-- requirements.txt
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- utils/
|   |   `-- App.jsx
|   |-- .env.example
|   |-- README.md
|   `-- package.json
|-- .gitignore
`-- README.md
```

## Video Coding Series Outline

1. Project overview and repository setup
2. FastAPI backend foundation
3. Upload API and validation
4. Audio conversion with ffmpeg
5. Chunking and timestamp offsets
6. faster-whisper transcription service
7. Background jobs and WebSocket progress
8. React + Tailwind frontend foundation
9. Upload and recording UI
10. Realtime progress and transcript viewer
11. Copy/download actions
12. Final polish and README

## Troubleshooting

`ffmpeg not found`

Install ffmpeg and add it to PATH. Confirm with:

```powershell
ffmpeg -version
ffprobe -version
```

`cuda not available`

Use CPU fallback in `backend/.env`:

```env
WHISPER_DEVICE=cpu
WHISPER_COMPUTE_TYPE=int8
```

`out of GPU memory`

Use a smaller model or lower compute type:

```env
WHISPER_MODEL=small.en
WHISPER_COMPUTE_TYPE=int8_float16
```

`microphone permission denied`

Allow microphone access in the browser and reload the frontend.

`CORS error`

Confirm:

```env
FRONTEND_ORIGIN=http://localhost:5173
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

`backend unavailable`

Make sure FastAPI is running:

```powershell
cd backend
.\.venv\Scripts\activate
uvicorn app.main:app --reload
```

## Future Improvements

- Speaker diarization
- SRT/VTT subtitle export
- Transcript summarization
- User login
- History page
- Cloud deployment
- Redis queue
- Database storage
- Multi-language support
- Noise reduction
- Model selector UI

## Author

Built as a portfolio-ready speech-to-text project for learning full-stack AI application development.
