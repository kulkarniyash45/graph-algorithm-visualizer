import { describe, expect, it } from 'vitest';
import { bellmanFord } from './bellmanFord.js';
import { toAdjacencyList } from '../utils/graphUtils.js';
import { getVisualizationState } from '../engine/visualization.js';

function graph(pairs, directed = true, ids = ['a', 'b', 'c', 'isolated']) {
  return toAdjacencyList({
    nodes: ids.map((id) => ({ id })),
    edges: pairs.map(([source, target, weight], index) => ({ id: `e${index}`, source, target, data: { weight } })),
    directed,
  });
}

describe('bellmanFord', () => {
  it('computes positive weighted paths in directed and undirected modes', () => {
    const adjacency = graph([['a', 'b', 8], ['a', 'c', 2], ['c', 'b', 1]]);
    const before = structuredClone(adjacency);
    const result = bellmanFord(adjacency, 'a');
    expect([...result.distances]).toEqual([['a', 0], ['b', 3], ['c', 2], ['isolated', Infinity]]);
    expect(result.predecessors.get('b')).toBe('c');
    expect(result.hasNegativeCycle).toBe(false);
    expect(bellmanFord(adjacency, 'b').distances.get('a')).toBe(Infinity);
    expect(bellmanFord(graph([['a', 'b', 4]], false), 'b').distances.get('a')).toBe(4);
    expect(bellmanFord(adjacency, 'a')).toEqual(result);
    expect(adjacency).toEqual(before);
  });

  it('relaxes negative edges for up to V-1 passes', () => {
    // Reverse node order forces the path to propagate across multiple passes.
    const result = bellmanFord(graph([['a', 'b', 4], ['b', 'c', -6]], true, ['c', 'b', 'a']), 'a');
    expect(result.distances.get('c')).toBe(-2);
    expect(result.predecessors.get('c')).toBe('b');
    expect(result.passes).toBe(2);
    expect(result.hasNegativeCycle).toBe(false);
    expect(result.events.filter((event) => event.type === 'START_PASS' && event.phase === 'Relaxation').map(({ pass }) => pass)).toEqual([1, 2]);
    expect(result.events).toContainEqual({ type: 'RELAX_EDGE', edgeId: 'e1', source: 'b', target: 'c', weight: -6, pass: 2, previousDistance: Infinity, distance: -2 });
  });

  it('detects reachable directed cycles and undirected negative edges', () => {
    const result = bellmanFord(graph([['a', 'b', 1], ['b', 'c', -2], ['c', 'b', 0]]), 'a');
    expect(result.hasNegativeCycle).toBe(true);
    expect(result.events.find(({ type }) => type === 'NEGATIVE_CYCLE').message).toContain('Reachable negative-weight cycle');
    expect(bellmanFord(graph([['a', 'b', -1]], false), 'a').hasNegativeCycle).toBe(true);
    expect(bellmanFord(graph([['a', 'a', -1]], true, ['a']), 'a').hasNegativeCycle).toBe(true);
  });

  it('ignores disconnected negative cycles and retains unreachable Infinity', () => {
    const result = bellmanFord(graph([['b', 'c', -2], ['c', 'b', -1]]), 'a');
    expect(result.hasNegativeCycle).toBe(false);
    expect([...result.distances]).toEqual([['a', 0], ['b', Infinity], ['c', Infinity], ['isolated', Infinity]]);
    expect(result.predecessors.get('b')).toBeNull();
    expect(result.passes).toBe(1);
    expect(bellmanFord(graph([], true, ['a']), 'a').distances.get('a')).toBe(0);
  });

  it('restores pass, distances and cycle warnings when stepping backwards or resetting', () => {
    const result = bellmanFord(graph([['a', 'b', 1], ['b', 'c', -2], ['c', 'b', 0]]), 'a');
    const final = getVisualizationState(result.events, result.events.length);
    expect(final.distances).toEqual(result.distances);
    expect(final.predecessors).toEqual(result.predecessors);
    expect(final.warning).toContain('negative-weight cycle');
    const earlier = getVisualizationState(result.events, result.events.length - 1);
    expect(earlier.warning).toBe('');
    expect(earlier.phase).toBe('Negative cycle check');
    expect(earlier.pass).toBe(result.passes);
    const firstPass = result.events.findIndex(({ type }) => type === 'START_PASS');
    const initial = getVisualizationState(result.events, firstPass);
    expect(initial.distances.get('a')).toBe(0);
    expect(initial.distances.get('b')).toBe(Infinity);
    const reset = getVisualizationState(result.events, 0);
    expect(reset.pass).toBe(0);
    expect(reset.warning).toBe('');
    expect(reset.distances.size).toBe(0);
  });

  it('rejects invalid starts and malformed weighted adjacency', () => {
    expect(() => bellmanFord(new Map(), 'a')).toThrow('start node');
    expect(() => bellmanFord(graph([]), 'missing')).toThrow('start node');
    expect(() => bellmanFord({}, 'a')).toThrow('Map');
    expect(() => bellmanFord(new Map([['a', [{ nodeId: 'a', weight: Infinity }]]]), 'a')).toThrow('finite');
  });
});
