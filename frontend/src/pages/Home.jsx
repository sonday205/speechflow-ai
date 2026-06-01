import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, FileText, Gauge, Radio, Sparkles } from "lucide-react";

import AudioUploader from "../components/AudioUploader";
import CopyButton from "../components/CopyButton";
import DownloadButton from "../components/DownloadButton";
import Header from "../components/Header";
import HoldToRecordButton from "../components/HoldToRecordButton";
import ProgressBar from "../components/ProgressBar";
import TranscriptViewer from "../components/TranscriptViewer";
import { useRecorder } from "../hooks/useRecorder";
import { useWebSocketProgress } from "../hooks/useWebSocketProgress";
import { getTranscription, uploadAudio } from "../services/transcriptionApi";

const stackItems = ["React", "Tailwind CSS", "FastAPI", "WebSocket", "faster-whisper"];
const highlightItems = [
  { value: "10 min", label: "max local audio" },
  { value: "16 kHz", label: "mono WAV target" },
  { value: "TXT", label: "export format" },
];
const workflowItems = [
  {
    title: "Upload or record",
    description: "Bring an English audio file or capture a short sample directly in browser.",
    icon: Radio,
  },
  {
    title: "Track realtime status",
    description: "Follow queue, processing, completion, and backend errors from WebSocket updates.",
    icon: Gauge,
  },
  {
    title: "Review clean text",
    description: "Read timestamped segments, copy the transcript, or download the final TXT file.",
    icon: FileText,
  },
];

function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobId, setJobId] = useState("");
  const [transcription, setTranscription] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const {
    isRecording,
    audioBlob,
    audioUrl,
    error: recorderError,
    startRecording,
    stopRecording,
    clearRecording,
  } = useRecorder();
  const progressState = useWebSocketProgress(jobId);
  const isProcessing = Boolean(
    jobId && !["completed", "failed"].includes(progressState.status),
  );
  const isBusy = isUploading || isProcessing;
  const transcriptResult = transcription?.result;

  useEffect(() => {
    if (!jobId || progressState.status !== "completed") {
      return undefined;
    }

    let isActive = true;

    getTranscription(jobId)
      .then((data) => {
        if (isActive) {
          setTranscription(data);
        }
      })
      .catch((err) => {
        if (isActive) {
          setError(err.message || "Could not fetch transcript result.");
        }
      });

    return () => {
      isActive = false;
    };
  }, [jobId, progressState.status]);

  const handleStartTranscription = async () => {
    const audioFile =
      selectedFile ||
      (audioBlob
        ? new File([audioBlob], "recording.webm", {
            type: audioBlob.type || "audio/webm",
          })
        : null);

    if (isBusy) {
      return;
    }

    if (!audioFile) {
      setError("Please select or record an audio file first.");
      return;
    }

    setIsUploading(true);
    setError("");
    setJobId("");
    setTranscription(null);

    try {
      const response = await uploadAudio(audioFile);
      setJobId(response.job_id);
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden text-slate-950">
      <Header />

      <section
        id="studio"
        className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-14 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(430px,0.88fr)] lg:items-start lg:pb-20 lg:pt-16"
      >
        <div className="lg:pt-8">
          <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
            <Sparkles className="h-4 w-4 text-violet-600" aria-hidden="true" />
            English Speech-to-Text demo
          </div>
          <h1 className="max-w-4xl font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Transcribe English audio into clean, readable text.
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-lg leading-8 text-slate-600">
            SpeechFlow AI turns uploaded or recorded audio into timestamped text with realtime
            processing feedback. The interface is built for a clear project demo: input, progress,
            result.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-extrabold text-white shadow-button transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              href="#workspace"
            >
              Start demo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-extrabold text-slate-800 transition hover:border-indigo-300 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              href="#result"
            >
              View output area
            </a>
          </div>
          <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {highlightItems.map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-2xl font-extrabold text-slate-950">{item.value}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="workspace" className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-indigo-600">
                  Live workspace
                </p>
                <h2 className="mt-2 font-display text-2xl font-extrabold text-slate-950">
                  Create a transcript
                </h2>
              </div>
              <BadgeCheck className="mt-1 h-6 w-6 text-sky-500" aria-hidden="true" />
            </div>
          </div>

          <AudioUploader
            selectedFile={selectedFile}
            onFileSelect={(file) => {
              setSelectedFile(file);
              clearRecording();
              setError("");
              setJobId("");
              setTranscription(null);
            }}
            onClear={() => {
              setSelectedFile(null);
              setJobId("");
              setTranscription(null);
              setError("");
            }}
          />

          <div className="flex items-center gap-3 px-1">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
              or
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <HoldToRecordButton
            isRecording={isRecording}
            error={recorderError}
            disabled={isBusy}
            onStart={() => {
              setSelectedFile(null);
              setError("");
              setJobId("");
              setTranscription(null);
              startRecording();
            }}
            onStop={stopRecording}
          />

          {audioUrl ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-slate-950">Recorded audio preview</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">recording.webm</p>
                </div>
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-rose-300 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
                  onClick={() => {
                    clearRecording();
                    setError("");
                    setJobId("");
                    setTranscription(null);
                  }}
                >
                  Clear
                </button>
              </div>
              <audio className="mt-4 w-full" controls src={audioUrl} />
            </div>
          ) : null}

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <button
              type="button"
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-extrabold text-white shadow-button transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
              disabled={isBusy || (!selectedFile && !audioBlob)}
              onClick={handleStartTranscription}
            >
              {isUploading ? "Uploading audio..." : "Start transcription"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {jobId ? (
            <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
              <p className="text-sm font-bold text-sky-800">Job created</p>
              <p className="mt-1 break-all font-mono text-xs font-semibold text-sky-700">{jobId}</p>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
              {error}
            </div>
          ) : null}
        </div>
      </section>

      <section
        id="result"
        className="mx-auto grid w-full max-w-7xl gap-5 px-5 pb-14 lg:grid-cols-[0.8fr_1.2fr]"
      >
        <ProgressBar
          status={jobId ? progressState.status || "queued" : ""}
          progress={jobId ? progressState.progress : 0}
          message={jobId ? progressState.message : "Upload or record audio to start a job."}
          error={jobId ? progressState.error : ""}
        />

        {transcriptResult ? (
          <div>
            <div className="mb-3 flex flex-wrap justify-end gap-3">
              <CopyButton text={transcriptResult.plain_text} />
              <DownloadButton jobId={jobId} disabled={progressState.status !== "completed"} />
            </div>
            <TranscriptViewer
              segments={transcriptResult.segments}
              plainText={transcriptResult.plain_text}
            />
          </div>
        ) : (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-indigo-600">
              Transcript
            </p>
            <h2 className="mt-2 font-display text-xl font-extrabold text-slate-950">Final text</h2>
            <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm font-medium leading-6 text-slate-500">
              Transcript segments will appear here after the backend completes processing.
            </div>
          </section>
        )}
      </section>

      <section id="workflow" className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto w-full max-w-7xl px-5 py-12">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-indigo-600">
              Project flow
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-950">
              One focused page for the full demo.
            </h2>
          </div>
          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {workflowItems.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-sky-50 text-sky-600">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-lg font-extrabold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-7 rounded-lg border border-sky-200 bg-sky-50 p-5 shadow-sm">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-indigo-600">
              Tech stack
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {stackItems.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
