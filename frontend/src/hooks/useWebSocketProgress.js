import { useEffect, useState } from "react";

import { WS_BASE_URL } from "../services/transcriptionApi";

const initialProgressState = {
  status: "",
  progress: 0,
  message: "",
  error: "",
};

export function useWebSocketProgress(jobId) {
  const [state, setState] = useState(initialProgressState);

  useEffect(() => {
    if (!jobId) {
      setState(initialProgressState);
      return undefined;
    }

    const socket = new WebSocket(`${WS_BASE_URL}/ws/transcriptions/${jobId}`);

    socket.onmessage = (event) => {
      let payload;
      try {
        payload = JSON.parse(event.data);
      } catch {
        setState((current) => ({
          ...current,
          error: "Received an unreadable progress update.",
        }));
        return;
      }

      setState({
        status: payload.status ?? "",
        progress: payload.progress ?? 0,
        message: payload.message ?? "",
        error: payload.status === "failed" ? payload.error || payload.message || "" : "",
      });

      if (payload.status === "completed" || payload.status === "failed") {
        socket.close();
      }
    };

    socket.onerror = () => {
      setState((current) => ({
        ...current,
        error: "Realtime progress connection failed. Check that the backend is running.",
      }));
    };

    socket.onclose = () => {
      setState((current) => {
        if (current.status === "completed" || current.status === "failed") {
          return current;
        }
        return {
          ...current,
          error: current.error || "Realtime progress connection closed.",
        };
      });
    };

    return () => {
      socket.close();
    };
  }, [jobId]);

  return state;
}
