export default function InfoPanel({ algorithm, status = 'Idle', currentStep = 0, totalSteps = 0, currentNode = '—', currentEvent = '—' }) {
  return (
    <aside aria-label="Algorithm information and execution state" className="min-h-0 min-w-0 space-y-4 lg:space-y-5 lg:overflow-y-auto">
      <section aria-labelledby="info-heading" className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 id="info-heading" className="text-sm font-semibold">Algorithm information</h2>
        <span className="mt-5 inline-block rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-600">{algorithm.category}</span>
        <h3 className="mt-3 text-lg font-semibold tracking-tight">{algorithm.name}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{algorithm.description}</p>
        <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-400">Step explanations and algorithm details will appear here during visualization.</p>
      </section>
      <section aria-labelledby="state-heading" className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 id="state-heading" className="text-sm font-semibold">Execution state</h2>
          <span role="status" className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">{status}</span>
        </div>
        <dl className="mt-5 space-y-4 text-xs">
          {[
            ['Step', `${currentStep} / ${totalSteps}`],
            ['Current node', currentNode],
            ['Current event', currentEvent],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">{label}</dt>
              <dd className="break-all text-right font-mono text-slate-700">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 rounded-lg border border-dashed border-slate-200 p-3 text-xs leading-5 text-slate-400">{totalSteps ? 'Highlighted nodes have been visited. Highlighted edges have been checked. Use the controls to explore each event.' : 'Select BFS and choose Run BFS to start a visualization.'}</div>
      </section>
    </aside>
  );
}
