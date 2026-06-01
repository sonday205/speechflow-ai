import { FileAudio, UploadCloud, X } from "lucide-react";

const acceptedExtensions = ".mp3,.wav,.m4a,.webm,.ogg,.mp4";

function formatFileSize(bytes) {
  if (!bytes) {
    return "0 KB";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / 1024 ** index;
  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function AudioUploader({ selectedFile, onFileSelect, onClear }) {
  const inputId = "audio-upload";

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      className="rounded-lg border border-dashed border-sky-300 bg-white p-5 shadow-sm transition hover:border-indigo-400"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-600">
            <UploadCloud className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-xl font-extrabold text-slate-950">
              Upload an audio file
            </h2>
            <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-600">
            Supports MP3, WAV, M4A, WEBM, OGG, and MP4 up to 10 minutes.
            </p>
          </div>
        </div>
        <label
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-extrabold text-white shadow-button transition hover:bg-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2"
          htmlFor={inputId}
        >
          <UploadCloud className="h-4 w-4" aria-hidden="true" />
          Select audio
          <input
            id={inputId}
            className="sr-only"
            type="file"
            accept={acceptedExtensions}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onFileSelect(file);
              }
              event.target.value = "";
            }}
          />
        </label>
      </div>

      {selectedFile ? (
        <div className="mt-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-indigo-600 shadow-sm">
              <FileAudio className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-slate-950">{selectedFile.name}</p>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-rose-300 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
            onClick={onClear}
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Clear
          </button>
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
          Drag and drop an audio file here
        </div>
      )}
    </div>
  );
}

export default AudioUploader;
