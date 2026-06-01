from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services import job_service


router = APIRouter(tags=["websocket"])


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, job_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.setdefault(job_id, []).append(websocket)

    def disconnect(self, job_id: str, websocket: WebSocket) -> None:
        connections = self.active_connections.get(job_id)
        if not connections:
            return

        if websocket in connections:
            connections.remove(websocket)

        if not connections:
            self.active_connections.pop(job_id, None)

    async def send_update(self, job_id: str, payload: dict) -> None:
        connections = list(self.active_connections.get(job_id, []))
        disconnected: list[WebSocket] = []

        for websocket in connections:
            try:
                await websocket.send_json(payload)
            except RuntimeError:
                disconnected.append(websocket)

        for websocket in disconnected:
            self.disconnect(job_id, websocket)


manager = ConnectionManager()


@router.websocket("/ws/transcriptions/{job_id}")
async def transcription_progress_websocket(websocket: WebSocket, job_id: str) -> None:
    await manager.connect(job_id, websocket)

    current_job = job_service.get_job(job_id)
    if current_job is not None:
        await websocket.send_json(current_job)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(job_id, websocket)
