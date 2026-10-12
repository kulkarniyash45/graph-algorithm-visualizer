export default function ControlPanel({ speed = 1, onSpeedChange, disabled = true, onPrevious, onPlay, onPause, onNext, onReset, step = 0, totalSteps = 0, onSeek, status }) {
  const controls = [{ label: 'Previous', onClick: onPrevious }, { label: 'Play', onClick: onPlay, primary: true }, { label: 'Pause', onClick: onPause }, { label: 'Next', onClick: onNext }, { label: 'Reset', onClick: onReset }];
  return (
    <section aria-label="Playback controls" className="glass-panel rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-400"><label htmlFor="playback-timeline">Execution timeline</label><span>{status} · {step} / {totalSteps}</span></div>
      <input id="playback-timeline" aria-label="Playback step" type="range" min="0" max={totalSteps || 1} value={step} disabled={disabled} onChange={(event) => onSeek(Number(event.target.value))} className="mb-4 w-full accent-cyan-400" />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">{controls.map(({ label, onClick, primary }) => <button key={label} type="button" disabled={disabled || !onClick} onClick={onClick} className={'rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-35 ' + (primary ? 'border-blue-400/50 bg-blue-600 text-white shadow-[0_0_20px_#2563eb30]' : 'border-blue-400/20 bg-blue-400/5 text-slate-300 hover:bg-blue-400/15')}>{label}</button>)}</div>
        <div className="flex items-center gap-3 text-xs"><label htmlFor="playback-speed" className="text-slate-400">Speed</label><input id="playback-speed" type="range" min="0.25" max="2" step="0.25" value={speed} onChange={(event) => onSpeedChange(Number(event.target.value))} aria-valuetext={`${speed} times`} className="w-24 accent-violet-400" /><output htmlFor="playback-speed" className="w-10 text-violet-300">{speed}×</output></div>
      </div>
    </section>
  );
}
