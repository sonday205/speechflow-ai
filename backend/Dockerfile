FROM nvidia/cuda:12.3.2-cudnn9-runtime-ubuntu22.04

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ffmpeg \
        python3 \
        python3-pip \
        python3-venv \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN python3 -m pip install --upgrade pip setuptools wheel \
    && python3 -m pip install -r requirements.txt

COPY app ./app
COPY storage ./storage

RUN mkdir -p storage/uploads storage/converted storage/chunks storage/results

EXPOSE 8000

CMD ["python3", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
