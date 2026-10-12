import { describe, expect, it } from 'vitest';
import { toAdjacencyList, toAdjacencyMatrix, toEdgeList } from './graphUtils.js';

const graph = {
  nodes: ['a', 'b', 'isolated'].map((id) => ({ id, data: { label: id } })),
  edges: [{ id: 'ab', source: 'a', target: 'b', data: { weight: 2.5 }, label: '99' }],
};

describe('graph representation utilities', () => {
  it('preserves outgoing connections and isolated nodes in directed mode', () => {
    const directed = { ...graph, directed: true };
    expect(toAdjacencyList(directed)).toEqual(new Map([
      ['a', [{ nodeId: 'b', edgeId: 'ab', weight: 2.5 }]],
      ['b', []], ['isolated', []],
    ]));
    expect(toAdjacencyMatrix(directed)).toEqual({
      nodeIds: ['a', 'b', 'isolated'],
      matrix: [[null, 2.5, null], [null, null, null], [null, null, null]],
    });
    expect(toEdgeList(directed)).toEqual({
      nodeIds: ['a', 'b', 'isolated'], directed: true,
      edges: [{ id: 'ab', source: 'a', target: 'b', weight: 2.5 }],
    });
  });

  it('mirrors undirected connections while storing each edge once', () => {
    expect(toAdjacencyList(graph).get('b')).toEqual([{ nodeId: 'a', edgeId: 'ab', weight: 2.5 }]);
    expect(toAdjacencyMatrix(graph).matrix).toEqual([
      [null, 2.5, null], [2.5, null, null], [null, null, null],
    ]);
    expect(toEdgeList(graph).edges).toHaveLength(1);
    expect(toEdgeList(graph).directed).toBe(false);
  });

  it('retains zero, negative, and fractional weights without mutating input', () => {
    const weighted = {
      ...graph,
      edges: [
        ...graph.edges,
        { id: 'ba', source: 'b', target: 'a', data: { weight: 0 } },
        { id: 'aa', source: 'a', target: 'a', data: { weight: -3 } },
      ],
      directed: true,
    };
    const before = structuredClone(weighted);
    expect(toAdjacencyMatrix(weighted).matrix).toEqual([
      [-3, 2.5, null], [0, null, null], [null, null, null],
    ]);
    expect(toEdgeList(weighted).edges.map(({ weight }) => weight)).toEqual([2.5, 0, -3]);
    const adjacency = toAdjacencyList(weighted);
    adjacency.get('a')[0].weight = 100;
    const edgeList = toEdgeList(weighted);
    edgeList.edges[0].weight = 100;
    expect(weighted).toEqual(before);
  });

  it('handles empty graphs in either mode', () => {
    for (const directed of [false, true]) {
      const empty = { nodes: [], edges: [], directed };
      expect(toAdjacencyList(empty)).toEqual(new Map());
      expect(toAdjacencyMatrix(empty)).toEqual({ nodeIds: [], matrix: [] });
      expect(toEdgeList(empty)).toEqual({ nodeIds: [], edges: [], directed });
    }
  });

  it('handles parallel edges and undirected self-loops deterministically', () => {
    const parallel = {
      ...graph,
      edges: [
        ...graph.edges,
        { id: 'ab2', source: 'a', target: 'b', data: { weight: 1 } },
        { id: 'aa', source: 'a', target: 'a', data: { weight: 0 } },
      ],
    };
    expect(toAdjacencyMatrix(parallel).matrix[0]).toEqual([0, 1, null]);
    expect(toAdjacencyList(parallel).get('a').map(({ edgeId }) => edgeId)).toEqual(['ab', 'ab2', 'aa']);
    expect(toEdgeList(parallel).edges).toHaveLength(3);
  });

  it('rejects invalid endpoints, duplicate nodes, and nonnumeric weights', () => {
    for (const convert of [toAdjacencyList, toAdjacencyMatrix, toEdgeList]) {
      expect(() => convert({ ...graph, nodes: [...graph.nodes, graph.nodes[0]] })).toThrow('unique');
      expect(() => convert({ ...graph, nodes: [] })).toThrow('existing nodes');
      expect(() => convert({ ...graph, edges: [{ ...graph.edges[0], data: { weight: '2' } }] })).toThrow('numeric');
    }
  });
});
