export default function AlgorithmPanel({ algorithms, selectedId, onSelect }) {
  const categories = [...new Set(algorithms.map(({ category }) => category))];

  return (
    <aside aria-labelledby="algorithms-heading" className="min-h-0 min-w-0 glass-panel rounded-2xl border border-blue-400/15 bg-[#101a30]/80 p-5 lg:overflow-y-auto">
      <h2 id="algorithms-heading" className="text-sm font-semibold">Algorithms</h2>
      <p className="mt-1 text-xs leading-5 text-slate-400">Choose an algorithm to explore.</p>
      <div className="mt-6 space-y-6">
        {categories.map((category) => (
          <fieldset key={category}>
            <legend className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{category}</legend>
            <div className="space-y-1">
              {algorithms.filter((algorithm) => algorithm.category === category).map((algorithm) => (
                <button
                  key={algorithm.id}
                  type="button"
                  aria-pressed={selectedId === algorithm.id}
                  onClick={() => onSelect(algorithm.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${selectedId === algorithm.id ? 'bg-blue-500/15 font-semibold text-cyan-300' : 'text-slate-300 hover:bg-blue-500/10 hover:text-slate-900'}`}
                >
                  {algorithm.shortName}
                  {selectedId === algorithm.id && <span aria-hidden="true" className="size-1.5 rounded-full bg-blue-600" />}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </aside>
  );
}
