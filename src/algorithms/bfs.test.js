import { describe, expect, it } from 'vitest';
import { bfs } from './bfs.js';

const graph = {
  nodes: ['a', 'b', 'c', 'd', 'isolated'].map((id) => ({ id })),
  edges: [
    { id: 'ab', source: 'a', target: 'b', weight: -5 },
    { id: 'ac', source: 'a', target: 'c', weight: 0 },
    { id: 'bd', source: 'b', target: 'd', weight: 100 },
    { id: 'cd', source: 'c', target: 'd' },
    { id: 'da', source: 'd', target: 'a' },
    { id: 'aa', source: 'a', target: 'a' },
  ],
};

describe('bfs', () => {
  it('visits reachable nodes breadth-first once despite cycles and converging paths', () => {
    const before = structuredClone(graph);
    const result = bfs(graph, 'a');
    expect(result.visitOrder).toEqual(['a', 'b', 'c', 'd']);
    expect(result.events.filter((event) => event.type === 'VISIT_NODE').map((event) => event.nodeId)).toEqual(result.visitOrder);
    expect(result.events.filter((event) => event.type === 'CHECK_EDGE')).toHaveLength(6);
    expect(result.events.slice(0, 3)).toEqual([
      { type: 'VISIT_NODE', nodeId: 'a' },
      { type: 'CHECK_EDGE', edgeId: 'ab', source: 'a', target: 'b' },
      { type: 'CHECK_EDGE', edgeId: 'ac', source: 'a', target: 'c' },
    ]);
    expect(bfs(graph, 'a')).toEqual(result);
    expect(graph).toEqual(before);
  });

  it('handles an isolated start and follows only outgoing connections', () => {
    expect(bfs(graph, 'isolated')).toEqual({ visitOrder: ['isolated'], events: [{ type: 'VISIT_NODE', nodeId: 'isolated' }] });
    expect(bfs({ nodes: graph.nodes, edges: [graph.edges[0]] }, 'b').visitOrder).toEqual(['b']);
  });

  it('rejects missing starts, invalid endpoints, and duplicate IDs', () => {
    expect(() => bfs({ nodes: [], edges: [] }, 'a')).toThrow('start node');
    expect(() => bfs(graph, 'missing')).toThrow('start node');
    expect(() => bfs({ ...graph, edges: [{ id: 'bad', source: 'a', target: 'missing' }] }, 'a')).toThrow('existing nodes');
    expect(() => bfs({ ...graph, nodes: [...graph.nodes, graph.nodes[0]] }, 'a')).toThrow('unique');
    expect(() => bfs({ ...graph, edges: [...graph.edges, graph.edges[0]] }, 'a')).toThrow('unique');
  });
});
