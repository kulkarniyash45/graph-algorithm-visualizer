import { describe, expect, it } from 'vitest';
import { prim } from './prim.js';
import { getVisualizationState } from '../engine/visualization.js';

function graph(pairs, ids = ['a', 'b', 'c', 'd']) {
  return {
    nodes: ids.map((id) => ({ id })),
    edges: pairs.map(([source, target, weight], index) => ({ id: `e${index}`, source, target, data: { weight } })),
    directed: false,
  };
}

describe('prim', () => {
  it('selects a minimum spanning tree with deterministic ordering without mutation', () => {
    const input = graph([['a', 'b', 8], ['a', 'c', 2], ['c', 'b', 1], ['b', 'd', 3], ['c', 'd', 9]]);
    const before = structuredClone(input);
    const result = prim(input, 'a');
    expect(result.selectedEdges.map(({ edgeId }) => edgeId)).toEqual(['e1', 'e2', 'e3']);
    expect(result.totalWeight).toBe(6);
    expect(result.isConnected).toBe(true);
    expect(result.events.filter(({ type }) => type === 'VISIT_NODE').map(({ nodeId }) => nodeId)).toEqual(['a', 'c', 'b', 'd']);
    expect(prim(input, 'd').totalWeight).toBe(6);
    expect(prim(input, 'a')).toEqual(result);
    expect(input).toEqual(before);
  });

  it('reports disconnected graphs and only spans the selected component', () => {
    const result = prim(graph([['a', 'b', 4], ['c', 'd', 1]]), 'a');
    expect(result.isConnected).toBe(false);
    expect(result.selectedEdges).toHaveLength(1);
    expect(result.totalWeight).toBe(4);
    expect(result.events.at(-1).message).toContain('no complete spanning tree exists');
    const isolated = prim(graph([], ['a', 'b']), 'a');
    expect(isolated.isConnected).toBe(false);
    expect(isolated.totalWeight).toBe(0);
  });

  it('supports negative weights, ignores self-loops and breaks ties in candidate order', () => {
    const result = prim(graph([['a', 'a', -99], ['a', 'b', -2], ['a', 'c', -2], ['b', 'c', 0]], ['a', 'b', 'c']), 'a');
    expect(result.selectedEdges.map(({ edgeId }) => edgeId)).toEqual(['e1', 'e2']);
    expect(result.totalWeight).toBe(-4);
    expect(result.isConnected).toBe(true);
    expect(prim(graph([], ['a']), 'a')).toMatchObject({ isConnected: true, selectedEdges: [], totalWeight: 0 });
  });

  it('rejects directed mode, empty graphs, and invalid starts', () => {
    expect(() => prim({ ...graph([]), directed: true }, 'a')).toThrow('undirected');
    expect(() => prim(graph([], []), 'a')).toThrow('start node');
    expect(() => prim(graph([]), 'missing')).toThrow('start node');
  });

  it('replays candidate/selected edges and totals correctly for Previous and Reset', () => {
    const result = prim(graph([['a', 'b', -2]], ['a', 'b']), 'a');
    const index = result.events.findIndex(({ type }) => type === 'SELECT_EDGE');
    const before = getVisualizationState(result.events, index);
    expect(before.candidateEdgeIds.has('e0')).toBe(true);
    expect(before.selectedEdges).toEqual([]);
    expect(before.totalWeight).toBe(0);
    const after = getVisualizationState(result.events, index + 1);
    expect(after.candidateEdgeIds.has('e0')).toBe(false);
    expect([...after.selectedEdgeIds]).toEqual(['e0']);
    expect(after.totalWeight).toBe(-2);
    const final = getVisualizationState(result.events, result.events.length);
    expect(final.selectedEdges).toEqual(result.selectedEdges);
    expect(final.candidateEdgeIds.size).toBe(0);
    const reset = getVisualizationState(result.events, 0);
    expect(reset.selectedEdges).toEqual([]);
    expect(reset.totalWeight).toBe(0);
    const disconnected = prim(graph([], ['a', 'b']), 'a');
    expect(getVisualizationState(disconnected.events, disconnected.events.length).warning).toContain('disconnected');
    expect(getVisualizationState(disconnected.events, disconnected.events.length - 1).warning).toBe('');
  });
});
