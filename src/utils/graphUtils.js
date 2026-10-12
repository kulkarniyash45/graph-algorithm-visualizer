// Input is the existing React Flow graph: { nodes, edges, directed = false }.
// All outputs are fresh data, in input order; weights come from edge.data.weight.
function normalizeGraph({ nodes, edges, directed = false }) {
  const nodeIds = nodes.map(({ id }) => id);
  const ids = new Set(nodeIds);
  if (ids.size !== nodeIds.length) throw new Error('Node IDs must be unique.');
  const normalizedEdges = edges.map(({ id, source, target, data }) => {
    if (!ids.has(source) || !ids.has(target)) {
      throw new Error('Every edge must connect existing nodes.');
    }
    const weight = data?.weight;
    if (typeof weight !== 'number' || !Number.isFinite(weight)) {
      throw new Error('Every edge must have a finite numeric data.weight.');
    }
    return { id, source, target, weight };
  });
  return { nodeIds, edges: normalizedEdges, directed };
}

/** Returns a Map from every node ID to ordered { nodeId, edgeId, weight } neighbors. */
export function toAdjacencyList(graph) {
  const { nodeIds, edges, directed } = normalizeGraph(graph);
  const adjacency = new Map(nodeIds.map((id) => [id, []]));
  for (const { id, source, target, weight } of edges) {
    adjacency.get(source).push({ nodeId: target, edgeId: id, weight });
    if (!directed && source !== target) {
      adjacency.get(target).push({ nodeId: source, edgeId: id, weight });
    }
  }
  return adjacency;
}

/**
 * Returns { nodeIds, matrix }; row/column indices follow nodeIds.
 * Missing connections (including the diagonal) are null. Parallel edges use
 * their minimum weight; adjacency and edge lists retain each individual edge.
 */
export function toAdjacencyMatrix(graph) {
  const { nodeIds, edges, directed } = normalizeGraph(graph);
  const indices = new Map(nodeIds.map((id, index) => [id, index]));
  const matrix = nodeIds.map(() => nodeIds.map(() => null));
  function setWeight(row, column, weight) {
    const previous = matrix[row][column];
    matrix[row][column] = previous === null ? weight : Math.min(previous, weight);
  }
  for (const { source, target, weight } of edges) {
    const row = indices.get(source);
    const column = indices.get(target);
    setWeight(row, column, weight);
    if (!directed) setWeight(column, row, weight);
  }
  return { nodeIds, matrix };
}

/**
 * Returns { nodeIds, edges: [{ id, source, target, weight }] }.
 * nodeIds preserves isolated nodes. Undirected edges occur once, in their
 * stored orientation; directed determines how consumers interpret them.
 */
export function toEdgeList(graph) {
  const { nodeIds, edges, directed } = normalizeGraph(graph);
  return { nodeIds, edges, directed };
}
