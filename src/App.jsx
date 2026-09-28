import { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import AlgorithmPanel from './components/AlgorithmPanel.jsx';
import GraphCanvas from './components/GraphCanvas.jsx';
import InfoPanel from './components/InfoPanel.jsx';
import ControlPanel from './components/ControlPanel.jsx';
import { algorithms } from './data/algorithms.js';
import { bfs } from './algorithms/bfs.js';
import { usePlayback } from './engine/usePlayback.js';

export default function App() {
  const [selectedId, setSelectedId] = useState('bfs');
  const [speed, setSpeed] = useState(1);
  const playback = usePlayback(speed);
  const selectedAlgorithm = algorithms.find(({ id }) => id === selectedId);

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 font-sans text-slate-800 antialiased lg:h-dvh lg:overflow-hidden">
      <Navbar />
      <main className="mx-auto grid w-full max-w-[1800px] min-h-0 flex-1 grid-cols-[minmax(0,1fr)] gap-4 p-4 lg:grid-cols-[200px_minmax(0,1fr)_260px] lg:gap-5 lg:p-5 xl:grid-cols-[220px_minmax(0,1fr)_280px]">
        <AlgorithmPanel algorithms={algorithms} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); playback.reset(); }} />
        <GraphCanvas
          bfsEnabled={selectedId === 'bfs'}
          onRun={(graph, startNodeId) => playback.load(bfs(graph, startNodeId).events)}
          onGraphChange={playback.reset}
          visualization={playback.visualization}
        />
        <InfoPanel algorithm={selectedAlgorithm} status={playback.status} currentStep={playback.step} totalSteps={playback.totalSteps} currentNode={playback.visualization.currentNode ?? '—'} currentEvent={playback.visualization.currentEvent ?? '—'} />
      </main>
      <ControlPanel speed={speed} onSpeedChange={setSpeed} disabled={!playback.totalSteps} onPrevious={playback.previous} onPlay={playback.play} onPause={playback.pause} onNext={playback.next} onReset={playback.reset} />
    </div>
  );
}
