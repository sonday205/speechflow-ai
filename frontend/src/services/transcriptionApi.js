const browserHost = typeof window !== "undefined" ? window.location.hostname : "localhost";
const wsProtocol =
  typeof window !== "undefined" && window.location.protocol === "https:" ? "wss" : "ws";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? `http://${browserHost}:8000`;
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL ?? `${wsProtocol}://${browserHost}:8000`;

async function parseApiResponse(response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.detail || "Request failed. Please try again.");
  }

  return payload;
}

async function requestJson(url, options) {
  try {
    const response = await fetch(url, options);
    return parseApiResponse(response);
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error("Backend unavailable. Make sure the FastAPI server is running.");
    }
    throw err;
  }
}

export async function uploadAudio(file) {
  const formData = new FormData();
  formData.append("file", file);

  return requestJson(`${API_BASE_URL}/api/transcriptions`, {
    method: "POST",
    body: formData,
  });
}

export async function getTranscription(jobId) {
  return requestJson(`${API_BASE_URL}/api/transcriptions/${jobId}`);
}

export function getDownloadUrl(jobId) {
  return `${API_BASE_URL}/api/transcriptions/${jobId}/download`;
}
