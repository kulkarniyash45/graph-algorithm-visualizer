/** Bellman-Ford over toAdjacencyList output; input order determines event order.
 * Distances on a reachable negative cycle are provisional, not shortest paths.
 */
export function bellmanFord(adjacency, startNodeId) {
  if (!(adjacency instanceof Map)) throw new Error('Expected an adjacency list Map.');
  if (!adjacency.has(startNodeId)) throw new Error('Choose an existing start node.');
  const edges = [];
  for (const [source, neighbors] of adjacency) {
    if (!Array.isArray(neighbors)) throw new Error('Neighbors must be arrays.');
    for (const { nodeId: target, edgeId, weight } of neighbors) {
      if (!adjacency.has(target)) throw new Error('Every edge must connect existing nodes.');
      if (typeof weight !== 'number' || !Number.isFinite(weight)) throw new Error('Bellman-Ford requires finite numeric weights.');
      edges.push({ source, target, edgeId, weight });
    }
  }
  const distances = new Map();
  const predecessors = new Map();
  const events = [];
  for (const nodeId of adjacency.keys()) {
    const distance = nodeId === startNodeId ? 0 : Infinity;
    distances.set(nodeId, distance);
    predecessors.set(nodeId, null);
    events.push({ type: 'UPDATE_DISTANCE', nodeId, distance, predecessor: null });
  }
  const maxPasses = adjacency.size - 1;
  let passes = 0;
  for (let pass = 1; pass <= maxPasses; pass += 1) {
    passes = pass;
    events.push({ type: 'START_PASS', pass, maxPasses, phase: 'Relaxation' });
    let changed = false;
    for (const edge of edges) {
      const { source, target, weight } = edge;
      events.push({ type: 'CHECK_EDGE', ...edge, pass });
      if (distances.get(source) === Infinity) continue;
      const distance = distances.get(source) + weight;
      if (distance >= distances.get(target)) continue;
      const previousDistance = distances.get(target);
      distances.set(target, distance);
      predecessors.set(target, source);
      changed = true;
      events.push({ type: 'RELAX_EDGE', ...edge, pass, previousDistance, distance });
      events.push({ type: 'UPDATE_DISTANCE', nodeId: target, distance, predecessor: source });
    }
    if (!changed) break;
  }
  events.push({ type: 'START_PASS', pass: passes, maxPasses, phase: 'Negative cycle check' });
  let hasNegativeCycle = false;
  for (const edge of edges) {
    events.push({ type: 'CHECK_EDGE', ...edge, phase: 'Negative cycle check' });
    if (distances.get(edge.source) !== Infinity && distances.get(edge.source) + edge.weight < distances.get(edge.target)) {
      hasNegativeCycle = true;
      events.push({
        type: 'NEGATIVE_CYCLE', ...edge,
        message: 'Reachable negative-weight cycle detected. Affected shortest paths are undefined; displayed distances are provisional.',
      });
      break;
    }
  }
  return { distances, predecessors, events, passes, hasNegativeCycle };
}
