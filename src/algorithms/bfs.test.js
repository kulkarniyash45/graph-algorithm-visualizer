import { describe, expect, it } from 'vitest';
import { bfs } from './bfs.js';
import { toAdjacencyList } from '../utils/graphUtils.js';

function adjacency(nodeIds, pairs, directed = true) {
  return toAdjacencyList({
    nodes: nodeIds.map((id) => ({ id })),
    edges: pairs.map(([source, target], index) => ({
      id: `edge-${index}`, source, target, data: { weight: index - 2 },
    })),
    directed,
  });
}

const connected = adjacency(['a', 'b', 'c', 'd'], [
  ['a', 'b'], ['a', 'c'], ['b', 'd'], ['c', 'd'],
]);

describe('bfs', () => {
  it('traverses a connected graph deterministically without changing input', () => {
    const before = structuredClone(connected);
    const result = bfs(connected, 'a');
    expect(result.visitOrder).toEqual(['a', 'b', 'c', 'd']);
    expect(result.events.filter(({ type }) => type === 'VISIT_NODE').map(({ nodeId }) => nodeId)).toEqual(result.visitOrder);
    expect(result.events.filter(({ type }) => type === 'CHECK_EDGE')).toEqual([
      { type: 'CHECK_EDGE', edgeId: 'edge-0', source: 'a', target: 'b' },
      { type: 'CHECK_EDGE', edgeId: 'edge-1', source: 'a', target: 'c' },
      { type: 'CHECK_EDGE', edgeId: 'edge-2', source: 'b', target: 'd' },
      { type: 'CHECK_EDGE', edgeId: 'edge-3', source: 'c', target: 'd' },
    ]);
    expect(bfs(connected, 'a')).toEqual(result);
    expect(connected).toEqual(before);
  });

  it('records discoveries once and independent queue snapshots after each change', () => {
    const { events } = bfs(connected, 'a');
    expect(events.filter(({ type }) => type === 'DISCOVER_NODE')).toEqual([
      { type: 'DISCOVER_NODE', nodeId: 'a', parentNodeId: null, edgeId: null },
      { type: 'DISCOVER_NODE', nodeId: 'b', parentNodeId: 'a', edgeId: 'edge-0' },
      { type: 'DISCOVER_NODE', nodeId: 'c', parentNodeId: 'a', edgeId: 'edge-1' },
      { type: 'DISCOVER_NODE', nodeId: 'd', parentNodeId: 'b', edgeId: 'edge-2' },
    ]);
    const snapshots = events.filter(({ type }) => type === 'QUEUE_SNAPSHOT').map(({ queue }) => queue);
    expect(snapshots).toEqual([['a'], [], ['b'], ['b', 'c'], ['c'], ['c', 'd'], ['d'], []]);
    expect(new Set(snapshots).size).toBe(snapshots.length);
    snapshots[0].push('changed');
    expect(snapshots[3]).toEqual(['b', 'c']);
  });

  it('visits only the reachable component of a disconnected graph', () => {
    const graph = adjacency(['a', 'b', 'c', 'd', 'isolated'], [['a', 'b'], ['c', 'd']]);
    expect(bfs(graph, 'a').visitOrder).toEqual(['a', 'b']);
    expect(bfs(graph, 'c').visitOrder).toEqual(['c', 'd']);
    expect(bfs(graph, 'isolated').visitOrder).toEqual(['isolated']);
    expect(bfs(graph, 'b').visitOrder).toEqual(['b']);
  });

  it('terminates on cycles and self-loops, checking all reachable edges', () => {
    const graph = adjacency(['a', 'b', 'c'], [['a', 'b'], ['b', 'c'], ['c', 'a'], ['a', 'a']]);
    const result = bfs(graph, 'a');
    expect(result.visitOrder).toEqual(['a', 'b', 'c']);
    expect(result.events.filter(({ type }) => type === 'DISCOVER_NODE')).toHaveLength(3);
    expect(result.events.filter(({ type }) => type === 'CHECK_EDGE')).toHaveLength(4);
    const undirected = bfs(adjacency(['a', 'b'], [['a', 'b']], false), 'b');
    expect(undirected.visitOrder).toEqual(['b', 'a']);
    expect(undirected.events.filter(({ type }) => type === 'CHECK_EDGE')).toHaveLength(2);
  });

  it('returns complete events for a single isolated node', () => {
    expect(bfs(adjacency(['only'], []), 'only')).toEqual({
      visitOrder: ['only'],
      events: [
        { type: 'DISCOVER_NODE', nodeId: 'only', parentNodeId: null, edgeId: null },
        { type: 'QUEUE_SNAPSHOT', queue: ['only'] },
        { type: 'QUEUE_SNAPSHOT', queue: [] },
        { type: 'VISIT_NODE', nodeId: 'only' },
      ],
    });
  });

  it('rejects invalid starts, empty graphs, and malformed adjacency lists', () => {
    expect(() => bfs(connected, 'missing')).toThrow('start node');
    expect(() => bfs(connected)).toThrow('start node');
    expect(() => bfs(new Map(), 'a')).toThrow('start node');
    expect(() => bfs({}, 'a')).toThrow('Map');
    expect(() => bfs(new Map([['a', null]]), 'a')).toThrow('arrays');
    expect(() => bfs(new Map([['a', [{ nodeId: 'missing' }]]]), 'a')).toThrow('existing nodes');
  });
});
