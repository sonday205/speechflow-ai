import { FileText } from "lucide-react";

import { formatTime } from "../utils/formatTime";

function TranscriptViewer({ segments, plainText }) {
  const hasSegments = segments?.length > 0;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-indigo-600">
            Transcript
          </p>
          <h2 className="mt-2 font-display text-xl font-extrabold text-slate-950">Final text</h2>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 text-sky-600">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-5 max-h-[28rem] space-y-5 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
        {hasSegments ? (
          segments.map((segment, index) => (
            <article
              key={`${segment.start}-${segment.end}-${index}`}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <p className="font-mono text-xs font-extrabold text-indigo-600">
                [{formatTime(segment.start)} - {formatTime(segment.end)}]
              </p>
              <p className="mt-2 font-medium leading-7 text-slate-800">{segment.text}</p>
            </article>
          ))
        ) : (
          <p className="whitespace-pre-wrap font-medium leading-7 text-slate-800">
            {plainText || "Transcript is empty."}
          </p>
        )}
      </div>
    </section>
  );
}

export default TranscriptViewer;
