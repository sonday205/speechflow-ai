import { Mic, Square } from "lucide-react";

function HoldToRecordButton({ isRecording, error, onStart, onStop, disabled }) {
  const handleTouchStart = (event) => {
    event.preventDefault();
    onStart();
  };

  const handleTouchEnd = (event) => {
    event.preventDefault();
    onStop();
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${
              isRecording ? "bg-rose-50 text-rose-600" : "bg-violet-50 text-violet-600"
            }`}
          >
            {isRecording ? (
              <Square className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Mic className="h-5 w-5" aria-hidden="true" />
            )}
          </div>
          <div>
            <h2 className="font-display text-xl font-extrabold text-slate-950">
              Record in browser
            </h2>
            <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-600">
              Press and hold, then release to create an audio preview.
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={disabled}
          className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            isRecording
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
              : "border border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-300 hover:bg-violet-100"
          }`}
          onMouseDown={onStart}
          onMouseUp={onStop}
          onMouseLeave={onStop}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {isRecording ? (
            <Square className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Mic className="h-4 w-4" aria-hidden="true" />
          )}
          {isRecording ? "Recording..." : "Hold to Record"}
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default HoldToRecordButton;
