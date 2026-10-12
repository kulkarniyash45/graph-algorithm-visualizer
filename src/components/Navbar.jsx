export default function Navbar() {
  return (
    <header className="border-b border-blue-400/10 bg-[#0b1122]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="grid size-10 place-items-center rounded-xl border border-cyan-400/40 bg-cyan-400/10 text-xl text-cyan-300 shadow-[0_0_24px_#22d3ee20]">◎</span>
          <div><h1 className="text-xl font-bold tracking-tight">Graph<span className="text-cyan-300">OS</span> <span className="ml-2 text-[10px] font-medium tracking-[0.2em] text-violet-300">NEON</span></h1><p className="text-[11px] text-slate-400">The algorithm exploration studio</p></div>
        </div>
        <span className="rounded-full border border-blue-400/20 px-3 py-1.5 text-[10px] tracking-widest text-cyan-300">INTERACTIVE WORKSPACE</span>
      </div>
    </header>
  );
}
