import { describe, expect, it } from 'vitest';
import { floydWarshall } from './floydWarshall.js';
import { getVisualizationState } from '../engine/visualization.js';

function graph(pairs, directed = true) {
  return {
    nodes: ['a', 'b', 'c', 'isolated'].map((id) => ({ id, data: { label: id.toUpperCase() } })),
    edges: pairs.map(([source, target, weight], index) => ({ id: `e${index}`, source, target, data: { weight } })),
    directed,
  };
}

describe('floydWarshall', () => {
  it('computes directed weighted paths deterministically without changing input', () => {
    const input = graph([['a', 'b', 5], ['b', 'c', 2], ['a', 'c', 10]]);
    const before = structuredClone(input);
    const result = floydWarshall(input);
    expect(result.distances).toEqual([[0, 5, 7, Infinity], [Infinity, 0, 2, Infinity], [Infinity, Infinity, 0, Infinity], [Infinity, Infinity, Infinity, 0]]);
    expect(result.hasNegativeCycle).toBe(false);
    expect(result.events.filter(({ type }) => type === 'COMPARE_PATH')).toHaveLength(64);
    expect(result.events.filter(({ type }) => type === 'SET_INTERMEDIATE').map(({ nodeId }) => nodeId)).toEqual(['a', 'b', 'c', 'isolated']);
    expect(floydWarshall(input)).toEqual(result);
    expect(input).toEqual(before);
  });

  it('mirrors undirected paths and preserves disconnected nodes', () => {
    const result = floydWarshall(graph([['a', 'b', 3], ['b', 'c', 1]], false));
    expect(result.distances[0][2]).toBe(4);
    expect(result.distances[2][0]).toBe(4);
    expect(result.distances[3]).toEqual([Infinity, Infinity, Infinity, 0]);
  });

  it('allows negative edges and uses minimum parallel weights and zero diagonals', () => {
    const result = floydWarshall(graph([['a', 'b', 8], ['a', 'b', 4], ['b', 'c', -6], ['a', 'a', 5]]));
    expect(result.distances[0][0]).toBe(0);
    expect(result.distances[0][2]).toBe(-2);
    expect(result.hasNegativeCycle).toBe(false);
  });

  it('detects negative cycles including disconnected cycles and negative self-loops', () => {
    const result = floydWarshall(graph([['b', 'c', -2], ['c', 'b', 1]]));
    expect(result.hasNegativeCycle).toBe(true);
    expect(result.negativeCycleNodeIds).toEqual(['b', 'c']);
    expect(result.distances[0][1]).toBe(Infinity);
    expect(floydWarshall(graph([['a', 'b', -1]], false)).hasNegativeCycle).toBe(true);
    expect(floydWarshall(graph([['a', 'a', -1]])).hasNegativeCycle).toBe(true);
  });

  it('replays labeled matrices, comparisons, updates and warnings with correct Previous/reset', () => {
    const result = floydWarshall(graph([['a', 'b', 3], ['b', 'c', -1]]));
    const final = getVisualizationState(result.events, result.events.length);
    expect(final.matrix).toEqual(result.distances);
    expect(final.matrixLabels).toEqual(['A', 'B', 'C', 'ISOLATED']);
    const update = result.events.findIndex(({ type, i, j }) => type === 'UPDATE_MATRIX_DISTANCE' && i === 0 && j === 2);
    const before = getVisualizationState(result.events, update);
    expect(before.matrix[0][2]).toBe(Infinity);
    expect(before.currentNode).toBe('b');
    expect(before.currentEdgeIds).toEqual(['e0', 'e1']);
    expect(getVisualizationState(result.events, update + 1).matrix[0][2]).toBe(2);
    final.matrix[0][0] = 99;
    expect(result.events[0].matrix[0][0]).toBe(0);
    expect(getVisualizationState(result.events, 0).matrix).toEqual([]);
    const cycle = floydWarshall(graph([['a', 'a', -1]]));
    expect(getVisualizationState(cycle.events, cycle.events.length).warning).toContain('Negative-weight cycle');
    expect(getVisualizationState(cycle.events, cycle.events.length - 1).warning).toBe('');
  });

  it('handles empty and single-node graphs without a start', () => {
    expect(floydWarshall({ nodes: [], edges: [] }).distances).toEqual([]);
    expect(floydWarshall({ nodes: [{ id: 'a' }], edges: [] }).distances).toEqual([[0]]);
  });
});
