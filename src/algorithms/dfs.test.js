import { describe, expect, it } from 'vitest';
import { dfs } from './dfs.js';
import { bfs } from './bfs.js';
import { toAdjacencyList } from '../utils/graphUtils.js';
import { getVisualizationState } from '../engine/visualization.js';

function graph(ids, pairs, directed = true) {
  return toAdjacencyList({
    nodes: ids.map((id) => ({ id })),
    edges: pairs.map(([source, target], index) => ({ id: `e${index}`, source, target, data: { weight: 1 } })),
    directed,
  });
}

describe('dfs', () => {
  it('explores each branch before siblings deterministically without mutation', () => {
    const adjacency = graph(['a', 'b', 'c', 'd'], [['a', 'b'], ['a', 'c'], ['b', 'd'], ['d', 'c']]);
    const before = structuredClone(adjacency);
    const result = dfs(adjacency, 'a');
    expect(result.visitOrder).toEqual(['a', 'b', 'd', 'c']);
    expect(bfs(adjacency, 'a').visitOrder).toEqual(['a', 'b', 'c', 'd']);
    expect(result.events.filter(({ type }) => type === 'CHECK_EDGE').map(({ edgeId }) => edgeId)).toEqual(['e0', 'e2', 'e3', 'e1']);
    expect(dfs(adjacency, 'a')).toEqual(result);
    expect(adjacency).toEqual(before);
  });

  it('handles disconnected, cyclic, undirected, and single-node graphs', () => {
    const adjacency = graph(['a', 'b', 'c', 'isolated'], [['a', 'b'], ['b', 'c'], ['c', 'a'], ['a', 'a']], false);
    const result = dfs(adjacency, 'a');
    expect(result.visitOrder).toEqual(['a', 'b', 'c']);
    expect(result.events.filter(({ type }) => type === 'DISCOVER_NODE')).toHaveLength(3);
    expect(dfs(adjacency, 'isolated').visitOrder).toEqual(['isolated']);
    expect(dfs(graph(['only'], []), 'only').visitOrder).toEqual(['only']);
  });

  it('emits events compatible with playback and restores previous highlights', () => {
    const { events } = dfs(graph(['a', 'b'], [['a', 'b']]), 'a');
    expect(events).toEqual([
      { type: 'DISCOVER_NODE', nodeId: 'a', parentNodeId: null, edgeId: null },
      { type: 'VISIT_NODE', nodeId: 'a' },
      { type: 'CHECK_EDGE', edgeId: 'e0', source: 'a', target: 'b' },
      { type: 'DISCOVER_NODE', nodeId: 'b', parentNodeId: 'a', edgeId: 'e0' },
      { type: 'VISIT_NODE', nodeId: 'b' },
    ]);
    const final = getVisualizationState(events, events.length);
    expect(final.traversalOrder).toEqual(['a', 'b']);
    const previous = getVisualizationState(events, 3);
    expect(previous.traversalOrder).toEqual(['a']);
    expect(previous.currentEdge).toBe('e0');
    expect(previous.currentNode).toBe('a');
    expect(getVisualizationState(events, 0).visitedNodeIds.size).toBe(0);
  });

  it('rejects missing starts and invalid adjacency lists', () => {
    expect(() => dfs(new Map(), 'a')).toThrow('start node');
    expect(() => dfs(graph(['a'], []), 'missing')).toThrow('start node');
    expect(() => dfs({}, 'a')).toThrow('Map');
    expect(() => dfs(new Map([['a', null]]), 'a')).toThrow('arrays');
    expect(() => dfs(new Map([['a', [{ nodeId: 'missing' }]]]), 'a')).toThrow('existing nodes');
  });
});
