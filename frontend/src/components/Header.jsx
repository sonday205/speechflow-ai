import { AudioWaveform, PlayCircle } from "lucide-react";

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4">
        <a
          className="flex items-center gap-3 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          href="#studio"
        >
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-indigo-600 text-white shadow-button">
            <AudioWaveform className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-lg font-extrabold tracking-tight text-slate-950">
              SpeechFlow AI
            </p>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">
              English STT
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-bold text-slate-600 md:flex">
          <a className="transition hover:text-indigo-600" href="#workspace">
            Demo
          </a>
          <a className="transition hover:text-indigo-600" href="#result">
            Result
          </a>
          <a className="transition hover:text-indigo-600" href="#workflow">
            Workflow
          </a>
        </nav>

        <a
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-button transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          href="#workspace"
        >
          <PlayCircle className="h-4 w-4" aria-hidden="true" />
          Start
        </a>
      </div>
    </header>
  );
}

export default Header;
