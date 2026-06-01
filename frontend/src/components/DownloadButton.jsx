import { Download } from "lucide-react";

import { getDownloadUrl } from "../services/transcriptionApi";

function DownloadButton({ jobId, disabled }) {
  if (disabled || !jobId) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-400"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Download TXT
      </button>
    );
  }

  return (
    <a
      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      href={getDownloadUrl(jobId)}
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      Download TXT
    </a>
  );
}

export default DownloadButton;
