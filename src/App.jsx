import { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import AlgorithmPanel from './components/AlgorithmPanel.jsx';
import GraphCanvas from './components/GraphCanvas.jsx';
import InfoPanel from './components/InfoPanel.jsx';
import ControlPanel from './components/ControlPanel.jsx';
import { algorithms } from './data/algorithms.js';
import { useVisualizer } from './engine/useVisualizer.js';

export default function App() {
  const [selectedId, setSelectedId] = useState('bfs');
  const [speed, setSpeed] = useState(1);
  const playback = useVisualizer(speed);
  const selectedAlgorithm = algorithms.find(({ id }) => id === selectedId);

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 font-sans text-slate-800 antialiased lg:h-dvh lg:overflow-hidden">
      <Navbar />
      <main className="mx-auto grid w-full max-w-[1800px] min-h-0 flex-1 grid-cols-[minmax(0,1fr)] gap-4 p-4 lg:grid-cols-[200px_minmax(0,1fr)_260px] lg:gap-5 lg:p-5 xl:grid-cols-[220px_minmax(0,1fr)_280px]">
        <AlgorithmPanel algorithms={algorithms} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); playback.reset(); }} />
        <GraphCanvas
          algorithmId={selectedId}
          onRun={(graph, startNodeId) => playback.run(graph, startNodeId, selectedId)}
          error={playback.error}
          onGraphChange={playback.reset}
          visualization={playback.visualization}
        />
        <InfoPanel selectedEdges={playback.visualization.selectedEdges} totalWeight={playback.visualization.totalWeight} matrix={playback.visualization.matrix} matrixLabels={playback.visualization.matrixLabels} matrixNodeIds={playback.visualization.matrixNodeIds} matrixCell={playback.visualization.matrixCell} intermediateNode={playback.visualization.intermediateNode} pass={playback.visualization.pass} maxPasses={playback.visualization.maxPasses} phase={playback.visualization.phase} warning={playback.visualization.warning} distances={playback.visualization.distances} predecessors={playback.visualization.predecessors} queue={playback.visualization.queue} traversalOrder={playback.visualization.traversalOrder} algorithm={selectedAlgorithm} status={playback.status} currentStep={playback.step} totalSteps={playback.totalSteps} currentNode={playback.visualization.currentNode ?? '—'} currentEvent={playback.visualization.currentEvent ?? '—'} />
      </main>
      <ControlPanel speed={speed} onSpeedChange={setSpeed} disabled={!playback.totalSteps} onPrevious={playback.previous} onPlay={playback.play} onPause={playback.pause} onNext={playback.next} onReset={playback.reset} />
    </div>
  );
}
