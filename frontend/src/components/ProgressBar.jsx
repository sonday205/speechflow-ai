import { AlertTriangle, CheckCircle2, LoaderCircle } from "lucide-react";

const statusLabels = {
  queued: "Queued",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

function ProgressBar({ status, progress, message, error }) {
  const value = Math.max(0, Math.min(progress || 0, 100));
  const isFailed = status === "failed";
  const isCompleted = status === "completed";
  const isWorking = status === "queued" || status === "processing";
  const StatusIcon = isFailed ? AlertTriangle : isCompleted ? CheckCircle2 : LoaderCircle;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-indigo-600">
            Progress
          </p>
          <h2 className="mt-2 font-display text-xl font-extrabold text-slate-950">
            {statusLabels[status] || "Waiting"}
          </h2>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-extrabold ${
            isFailed
              ? "bg-rose-50 text-rose-700"
              : isCompleted
                ? "bg-emerald-50 text-emerald-700"
                : "bg-sky-50 text-sky-700"
          }`}
        >
          <StatusIcon
            className={`h-4 w-4 ${isWorking ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          {value}%
        </span>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isFailed ? "bg-rose-500" : isCompleted ? "bg-emerald-500" : "bg-indigo-600"
          }`}
          style={{ width: `${value}%` }}
        />
      </div>

      <p className="mt-4 text-sm font-medium leading-6 text-slate-600">
        {error || message || "Waiting for backend progress updates..."}
      </p>
    </section>
  );
}

export default ProgressBar;
