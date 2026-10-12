export default function ResultsPanel({ algorithm, visualization, events, step, totalSteps, nodeLabel, error }) {
  const state = visualization;
  const log = events.slice(Math.max(0, step - 40), step);
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <div className="glass-panel min-w-0 rounded-2xl p-5">
        <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Results</h2><span className="text-[10px] uppercase tracking-widest text-violet-300">{algorithm.shortName}</span></div>
        {error || state.warning ? <p role="status" className="mt-3 text-xs text-rose-300">{error || state.warning}</p> : null}
        {!totalSteps && <p className="mt-4 text-xs text-slate-400">Build your graph, choose an algorithm, and run to explore its results.</p>}
        {totalSteps > 0 && <p className="mt-3 text-xs text-slate-400">{step === totalSteps ? 'Execution complete' : 'Live results'} · {step} / {totalSteps} events</p>}
        {state.traversalOrder.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{state.traversalOrder.map((id, index) => <span key={index} className="rounded-md border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 font-mono text-xs text-cyan-200">{nodeLabel(id)}</span>)}</div>}
        {state.distances.size > 0 && <div className="mt-4 flex flex-wrap gap-2">{[...state.distances].map(([id, distance]) => <span key={id} className="rounded-md border border-blue-400/20 px-3 py-2 font-mono text-xs">{nodeLabel(id)} <span className="text-cyan-300">{distance === Infinity ? '∞' : distance}</span></span>)}</div>}
        {algorithm.id === 'prim' && totalSteps > 0 && <div className="mt-4 text-xs"><p className="text-emerald-300">Selected weight: {state.totalWeight}</p><p className="mt-2 text-slate-400">{state.selectedEdges.map((edge) => `${nodeLabel(edge.source)} — ${nodeLabel(edge.target)} (${edge.weight})`).join(' · ') || 'No edges selected'}</p></div>}
        {state.matrix.length > 0 && <p className="mt-4 text-xs text-cyan-200">{state.matrix.length} × {state.matrix.length} distance matrix · intermediate {nodeLabel(state.intermediateNode)} · live matrix in inspector</p>}
      </div>
      <div className="glass-panel min-w-0 rounded-2xl p-5">
        <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Execution log</h2><span className="text-[10px] text-slate-400">Last 40 applied events</span></div>
        <ol aria-label="Execution events" className="mt-4 max-h-52 space-y-2 overflow-y-auto font-mono text-[11px]">
          {!log.length && <li className="text-slate-500">Awaiting execution…</li>}
          {log.map((event, index) => <li key={step - log.length + index} className="flex gap-3 border-b border-blue-400/5 pb-2"><span className="text-slate-500">{String(step - log.length + index + 1).padStart(3, '0')}</span><div><span className="text-cyan-300">{event.type}</span><span className="ml-2 text-slate-400">{event.nodeId ? nodeLabel(event.nodeId) : event.source ? `${nodeLabel(event.source)} → ${nodeLabel(event.target)}` : event.pass !== undefined ? `Pass ${event.pass}` : ''}{event.distance !== undefined ? ` · distance ${event.distance === Infinity ? '∞' : event.distance}` : ''}{event.queue ? ` · [${event.queue.map(nodeLabel).join(', ')}]` : ''}</span></div></li>)}
        </ol>
      </div>
    </section>
  );
}
