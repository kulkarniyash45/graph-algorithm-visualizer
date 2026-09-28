export default function ControlPanel({ speed = 1, onSpeedChange, disabled = true, onPrevious, onPlay, onPause, onNext, onReset }) {
  const controls = [
    { label: 'Previous', onClick: onPrevious },
    { label: 'Play', onClick: onPlay, primary: true },
    { label: 'Pause', onClick: onPause },
    { label: 'Next', onClick: onNext },
    { label: 'Reset', onClick: onReset },
  ];

  return (
    <footer aria-label="Playback controls" className="shrink-0 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1800px] grid-cols-[minmax(0,1fr)] items-center gap-4 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[200px_minmax(0,1fr)_260px] lg:gap-5 lg:px-5 xl:grid-cols-[220px_minmax(0,1fr)_280px]">
        <div>
          <p className="text-xs font-semibold text-slate-700">Playback</p>
          <p id="playback-help" className="mt-1 text-xs text-slate-400">{disabled ? 'Waiting for a visualization' : 'Explore one step at a time'}</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:col-span-2 sm:row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:justify-center" aria-describedby="playback-help">
          {controls.map(({ label, onClick, primary }) => (
            <button
              key={label}
              type="button"
              disabled={disabled || !onClick}
              onClick={onClick}
              className={`min-h-10 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-45 ${primary ? 'border-indigo-600 bg-indigo-600 text-white enabled:hover:bg-indigo-700' : 'border-slate-200 bg-white text-slate-600 enabled:hover:bg-slate-50'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 sm:col-start-2 sm:row-start-1 sm:justify-end lg:col-start-3">
          <label htmlFor="playback-speed" className="text-xs font-medium text-slate-600">Speed</label>
          <input
            id="playback-speed"
            type="range"
            min="0.25"
            max="2"
            step="0.25"
            value={speed}
            onChange={(event) => onSpeedChange?.(Number(event.target.value))}
            aria-valuetext={`${speed} times`}
            className="w-24 cursor-pointer accent-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
          />
          <output htmlFor="playback-speed" className="w-10 text-right font-mono text-xs text-slate-500">{speed}×</output>
        </div>
      </div>
    </footer>
  );
}
