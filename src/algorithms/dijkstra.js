/**
 * Dijkstra over toAdjacencyList output. Linear minimum extraction is equivalent
 * to a min-priority queue (O(V^2 + E)); node input order breaks distance ties.
 * Returns Maps for every node, with Infinity/null for unreachable nodes.
 */
export function dijkstra(adjacency, startNodeId) {
  if (!(adjacency instanceof Map)) throw new Error('Expected an adjacency list Map.');
  if (!adjacency.has(startNodeId)) throw new Error('Choose an existing start node.');
  for (const neighbors of adjacency.values()) {
    if (!Array.isArray(neighbors)) throw new Error('Neighbors must be arrays.');
    for (const { nodeId, weight } of neighbors) {
      if (!adjacency.has(nodeId)) throw new Error('Every edge must connect existing nodes.');
      if (typeof weight !== 'number' || !Number.isFinite(weight)) throw new Error('Dijkstra requires finite numeric weights.');
      if (weight < 0) throw new Error('Dijkstra cannot run with negative edge weights. Use nonnegative weights.');
    }
  }
  const distances = new Map();
  const predecessors = new Map();
  const events = [];
  const visitOrder = [];
  const processed = new Set();
  for (const nodeId of adjacency.keys()) {
    distances.set(nodeId, Infinity);
    predecessors.set(nodeId, null);
    events.push({ type: 'UPDATE_DISTANCE', nodeId, distance: Infinity, predecessor: null });
  }
  distances.set(startNodeId, 0);
  events.push({ type: 'UPDATE_DISTANCE', nodeId: startNodeId, distance: 0, predecessor: null });
  while (processed.size < adjacency.size) {
    let nodeId;
    let minimum = Infinity;
    for (const [candidate, distance] of distances) {
      if (!processed.has(candidate) && distance < minimum) {
        nodeId = candidate;
        minimum = distance;
      }
    }
    if (minimum === Infinity) break;
    processed.add(nodeId);
    visitOrder.push(nodeId);
    events.push({ type: 'VISIT_NODE', nodeId });
    for (const { nodeId: target, edgeId, weight } of adjacency.get(nodeId)) {
      events.push({ type: 'CHECK_EDGE', edgeId, source: nodeId, target, weight });
      const distance = minimum + weight;
      if (processed.has(target) || distance >= distances.get(target)) continue;
      const previousDistance = distances.get(target);
      distances.set(target, distance);
      predecessors.set(target, nodeId);
      events.push({ type: 'RELAX_EDGE', edgeId, source: nodeId, target, weight, previousDistance, distance });
      events.push({ type: 'UPDATE_DISTANCE', nodeId: target, distance, predecessor: nodeId });
    }
  }
  return { distances, predecessors, visitOrder, events };
}
