import { expect, it } from 'vitest';
import { getVisualizationState } from './visualization.js';

it('replays events and restores highlights when stepping back or resetting', () => {
  const events = [
    { type: 'VISIT_NODE', nodeId: 'a' },
    { type: 'CHECK_EDGE', edgeId: 'ab', source: 'a', target: 'b' },
    { type: 'VISIT_NODE', nodeId: 'b' },
  ];
  const final = getVisualizationState(events, 3);
  expect([...final.visitedNodeIds]).toEqual(['a', 'b']);
  expect([...final.checkedEdgeIds]).toEqual(['ab']);
  expect(final.currentNode).toBe('b');
  expect(final.currentEdge).toBeNull();
  const previous = getVisualizationState(events, 2);
  expect([...previous.visitedNodeIds]).toEqual(['a']);
  expect(previous.currentEdge).toBe('ab');
  expect(previous.currentEvent).toBe('CHECK_EDGE');
  const reset = getVisualizationState(events, 0);
  expect(reset.visitedNodeIds.size).toBe(0);
  expect(reset.checkedEdgeIds.size).toBe(0);
  expect(reset.currentEvent).toBeNull();
  expect(getVisualizationState([], 0)).toEqual(reset);
});
