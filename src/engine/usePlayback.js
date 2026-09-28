import { useEffect, useMemo, useState } from 'react';
import { getVisualizationState } from './visualization.js';

export function usePlayback(speed) {
  const [events, setEvents] = useState([]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const complete = events.length > 0 && step === events.length;

  useEffect(() => {
    if (!playing || complete) return;
    const timer = setTimeout(() => setStep((value) => Math.min(value + 1, events.length)), 800 / speed);
    return () => clearTimeout(timer);
  }, [playing, complete, step, events, speed]);

  const visualization = useMemo(() => getVisualizationState(events, step), [events, step]);

  function reset() {
    setPlaying(false);
    setStep(0);
    setEvents([]);
  }

  return {
    visualization,
    step,
    totalSteps: events.length,
    status: !events.length ? 'Idle' : complete ? 'Complete' : playing ? 'Playing' : 'Paused',
    load(nextEvents) { setEvents(nextEvents); setStep(0); setPlaying(true); },
    play() { if (complete) setStep(0); setPlaying(true); },
    pause() { setPlaying(false); },
    previous() { setPlaying(false); setStep((value) => Math.max(0, value - 1)); },
    next() { setPlaying(false); setStep((value) => Math.min(events.length, value + 1)); },
    reset,
  };
}
