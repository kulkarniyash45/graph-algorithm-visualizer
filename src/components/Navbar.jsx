export default function Navbar({ title = 'Graph Algorithm Visualizer' }) {
  return (
    <header className="shrink-0 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-3 px-4 py-4 lg:px-5">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">G</span>
          <div>
            <h1 className="text-lg font-bold tracking-tight sm:text-xl">{title}</h1>
            <p className="mt-0.5 text-xs text-slate-500">Explore connections. Understand every step.</p>
          </div>
        </div>
        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">Algorithm workspace</span>
      </div>
    </header>
  );
}
