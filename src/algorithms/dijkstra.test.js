import { describe, expect, it } from 'vitest';
import { dijkstra } from './dijkstra.js';
import { toAdjacencyList } from '../utils/graphUtils.js';
import { getVisualizationState } from '../engine/visualization.js';

function graph(pairs, directed = true) {
  return toAdjacencyList({
    nodes: ['a', 'b', 'c', 'd', 'isolated'].map((id) => ({ id })),
    edges: pairs.map(([source, target, weight], index) => ({ id: `e${index}`, source, target, data: { weight } })),
    directed,
  });
}

describe('dijkstra', () => {
  it('finds weighted paths and predecessors, skipping expensive direct paths', () => {
    const adjacency = graph([['a', 'b', 8], ['a', 'c', 1.5], ['c', 'b', 2], ['b', 'd', 0], ['c', 'd', 9]]);
    const before = structuredClone(adjacency);
    const result = dijkstra(adjacency, 'a');
    expect([...result.distances]).toEqual([['a', 0], ['b', 3.5], ['c', 1.5], ['d', 3.5], ['isolated', Infinity]]);
    expect([...result.predecessors]).toEqual([['a', null], ['b', 'c'], ['c', 'a'], ['d', 'b'], ['isolated', null]]);
    expect(result.visitOrder).toEqual(['a', 'c', 'b', 'd']);
    expect(result.events).toContainEqual({ type: 'RELAX_EDGE', edgeId: 'e2', source: 'c', target: 'b', weight: 2, previousDistance: 8, distance: 3.5 });
    expect(dijkstra(adjacency, 'a')).toEqual(result);
    expect(adjacency).toEqual(before);
  });

  it('respects directed edges and mirrors undirected edges', () => {
    expect(dijkstra(graph([['a', 'b', 4]]), 'b').distances.get('a')).toBe(Infinity);
    const result = dijkstra(graph([['a', 'b', 4]], false), 'b');
    expect(result.distances.get('a')).toBe(4);
    expect(result.predecessors.get('a')).toBe('b');
  });

  it('handles isolated starts, zero cycles and deterministic ties', () => {
    const adjacency = graph([['a', 'c', 0], ['a', 'b', 0], ['b', 'a', 0], ['a', 'a', 0]]);
    expect(dijkstra(adjacency, 'a').visitOrder).toEqual(['a', 'b', 'c']);
    const isolated = dijkstra(adjacency, 'isolated');
    expect(isolated.visitOrder).toEqual(['isolated']);
    expect(isolated.distances.get('isolated')).toBe(0);
    expect(isolated.distances.get('a')).toBe(Infinity);
  });

  it('rejects negative weights even in unreachable components and invalid inputs', () => {
    expect(() => dijkstra(graph([['c', 'd', -1]]), 'a')).toThrow('negative edge weights');
    expect(() => dijkstra(graph([['a', 'b', -1]], false), 'a')).toThrow('negative edge weights');
    expect(() => dijkstra(graph([]), 'missing')).toThrow('start node');
    expect(() => dijkstra(new Map(), 'a')).toThrow('start node');
    expect(() => dijkstra({}, 'a')).toThrow('Map');
    expect(() => dijkstra(new Map([['a', [{ nodeId: 'a', weight: NaN }]]]), 'a')).toThrow('finite');
  });

  it('replays distance and predecessor updates and restores earlier relaxation state', () => {
    const result = dijkstra(graph([['a', 'b', 8], ['a', 'c', 1], ['c', 'b', 2]]), 'a');
    const final = getVisualizationState(result.events, result.events.length);
    expect(final.distances).toEqual(result.distances);
    expect(final.predecessors).toEqual(result.predecessors);
    const update = result.events.findIndex((event) => event.type === 'UPDATE_DISTANCE' && event.nodeId === 'b' && event.distance === 3);
    const earlier = getVisualizationState(result.events, update);
    expect(earlier.distances.get('b')).toBe(8);
    expect(earlier.predecessors.get('b')).toBe('a');
    expect(earlier.currentEdge).toBe('e2');
    expect(getVisualizationState(result.events, update + 1).distances.get('b')).toBe(3);
    expect(getVisualizationState(result.events, 0).distances.size).toBe(0);
  });
});
