import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { bfs } from '../algorithms/bfs.js';
import { dfs } from '../algorithms/dfs.js';
import { dijkstra } from '../algorithms/dijkstra.js';
import { bellmanFord } from '../algorithms/bellmanFord.js';
import { floydWarshall } from '../algorithms/floydWarshall.js';
import { prim } from '../algorithms/prim.js';
import { toAdjacencyList } from '../utils/graphUtils.js';
import { getVisualizationState } from './visualization.js';

// A single pending callback; cancel also invalidates callbacks already queued.
export function createPlaybackTimer() {
  let timer;
  let generation = 0;
  function cancel() {
    generation += 1;
    clearTimeout(timer);
  }
  return {
    cancel,
    schedule(callback, delay) {
      cancel();
      const scheduledGeneration = generation;
      timer = setTimeout(() => {
        if (scheduledGeneration === generation) callback();
      }, delay);
    },
  };
}

export function useVisualizer(speed = 1) {
  const [events, setEvents] = useState([]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  if (!timerRef.current) timerRef.current = createPlaybackTimer();
  const timer = timerRef.current;
  const complete = events.length > 0 && step === events.length;
  const pause = useCallback(() => {
    timer.cancel();
    setPlaying(false);
  }, [timer]);
  const reset = useCallback(() => {
    pause();
    setEvents([]);
    setStep(0);
    setError('');
  }, [pause]);

  useEffect(() => {
    if (playing && events.length && !complete) {
      const safeSpeed = Number.isFinite(speed) && speed > 0 ? speed : 1;
      timer.schedule(() => setStep((value) => Math.min(value + 1, events.length)), 800 / safeSpeed);
    }
    return timer.cancel;
  }, [playing, complete, step, events, speed, timer]);

  const visualization = useMemo(() => {
    const state = getVisualizationState(events, step);
    if (complete) { state.currentNode = null; state.currentEdge = null; state.currentEdgeIds = []; }
    return state;
  }, [events, step, complete]);

  return {
    visualization, step, totalSteps: events.length, error,
    status: !events.length ? 'Idle' : complete ? 'Complete' : playing ? 'Playing' : 'Paused',
    run(graph, startNodeId, algorithmId = 'bfs') {
      reset();
      try {
        if (!graph.nodes.length) throw new Error('Add a node before running an algorithm.');
        const algorithm = algorithmId === 'bfs' ? bfs : algorithmId === 'dfs' ? dfs : algorithmId === 'dijkstra' ? dijkstra : algorithmId === 'bellman-ford' ? bellmanFord : algorithmId === 'floyd-warshall' ? floydWarshall : algorithmId === 'prim' ? prim : null;
        if (!algorithm) throw new Error('Choose an implemented algorithm to run.');
        const result = algorithmId === 'floyd-warshall' ? floydWarshall(graph) : algorithmId === 'prim' ? prim(graph, startNodeId) : algorithm(toAdjacencyList(graph), startNodeId);
        setEvents(result.events);
        setPlaying(true);
      } catch (cause) {
        setError(cause.message);
      }
    },
    play() {
      if (playing && !complete) return;
      timer.cancel();
      if (!events.length) return;
      if (complete) setStep(0);
      setPlaying(true);
    },
    pause,
    previous() { pause(); setStep((value) => Math.max(0, value - 1)); },
    next() { pause(); setStep((value) => Math.min(events.length, value + 1)); },
    reset,
  };
}
