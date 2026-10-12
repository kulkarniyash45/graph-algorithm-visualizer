import { useCallback, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import AlgorithmPanel from './components/AlgorithmPanel.jsx';
import GraphCanvas from './components/GraphCanvas.jsx';
import InfoPanel from './components/InfoPanel.jsx';
import ControlPanel from './components/ControlPanel.jsx';
import ResultsPanel from './components/ResultsPanel.jsx';
import { algorithms } from './data/algorithms.js';
import { useVisualizer } from './engine/useVisualizer.js';

const complexities = {
  bfs: 'O(V + E)', dfs: 'O(V + E)', dijkstra: 'O(V² + E)',
  'bellman-ford': 'O(VE)', 'floyd-warshall': 'O(V³)', prim: 'O(E² + V)',
};

export default function App() {
  const [selectedId, setSelectedId] = useState('bfs');
  const [speed, setSpeed] = useState(1);
  const [graph, setGraph] = useState({ nodes: [], edges: [], directed: false });
  const onGraphSnapshot = useCallback((nextGraph) => setGraph(nextGraph), []);
  const playback = useVisualizer(speed);
  const selectedAlgorithm = algorithms.find(({ id }) => id === selectedId);
  const state = playback.visualization;
  const labels = new Map(graph.nodes.map((node) => [node.id, node.data.label]));
  const nodeLabel = (id) => labels.get(id) ?? id ?? '—';

  return (
    <div className="graphos min-h-dvh bg-[#070B17] font-sans text-slate-100 antialiased">
      <Navbar />
      <main className="mx-auto max-w-[1800px] space-y-5 px-4 py-5 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400">Explore / Visualize / Understand</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Every connection tells a story.</h2></div>
          <p className="text-xs text-slate-400">{graph.directed ? 'Directed' : 'Undirected'} graph · {selectedAlgorithm.name}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[['Nodes', graph.nodes.length], ['Edges', graph.edges.length], ['Execution', playback.status], ['Complexity', complexities[selectedId] ?? 'Not implemented']].map(([label, value]) => (
            <div key={label} className="glass-panel flex items-center justify-between rounded-xl px-5 py-4"><span className="text-[10px] uppercase tracking-widest text-slate-400">{label}</span><span className="font-mono text-sm text-cyan-200">{value}</span></div>
          ))}
        </div>
        <div className="grid items-start gap-4 lg:grid-cols-[190px_minmax(0,1fr)_280px] xl:grid-cols-[210px_minmax(0,1fr)_300px]">
          <AlgorithmPanel algorithms={algorithms} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); playback.reset(); }} />
          <div className="min-w-0 space-y-4">
            <GraphCanvas algorithmId={selectedId} onRun={(currentGraph, startNodeId) => playback.run(currentGraph, startNodeId, selectedId)} error={playback.error} onGraphChange={playback.reset} onGraphSnapshot={onGraphSnapshot} visualization={state} />
            <ControlPanel speed={speed} onSpeedChange={setSpeed} disabled={!playback.totalSteps} onPrevious={playback.previous} onPlay={playback.play} onPause={playback.pause} onNext={playback.next} onReset={playback.reset} step={playback.step} totalSteps={playback.totalSteps} onSeek={playback.seek} status={playback.status} />
          </div>
          <InfoPanel {...state} matrixLabels={state.matrixLabels} algorithm={selectedAlgorithm} status={playback.status} currentStep={playback.step} totalSteps={playback.totalSteps} currentNode={nodeLabel(state.currentNode)} currentEvent={state.currentEvent ?? '—'} queue={state.queue.map(nodeLabel)} traversalOrder={state.traversalOrder.map(nodeLabel)} />
        </div>
        <ResultsPanel algorithm={selectedAlgorithm} visualization={state} events={playback.events} step={playback.step} totalSteps={playback.totalSteps} nodeLabel={nodeLabel} error={playback.error} />
      </main>
    </div>
  );
}
