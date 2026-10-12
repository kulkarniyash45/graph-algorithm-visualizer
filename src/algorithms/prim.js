import { toAdjacencyList } from '../utils/graphUtils.js';

/** Prim with a frontier queue and linear minimum extraction. Equal weights
 * retain insertion order. Disconnected results span only the start component.
 */
export function prim(graph, startNodeId) {
  if (graph.directed) throw new Error('Prim requires an undirected graph. Switch to undirected mode.');
  const adjacency = toAdjacencyList(graph);
  if (!adjacency.has(startNodeId)) throw new Error('Choose an existing start node.');
  const visited = new Set();
  const candidates = [];
  const selectedEdges = [];
  const events = [];
  let totalWeight = 0;
  function visit(nodeId) {
    visited.add(nodeId);
    events.push({ type: 'VISIT_NODE', nodeId });
    for (const { nodeId: target, edgeId, weight } of adjacency.get(nodeId)) {
      const edge = { edgeId, source: nodeId, target, weight };
      events.push({ type: 'CHECK_EDGE', ...edge });
      if (!visited.has(target)) {
        candidates.push(edge);
        events.push({ type: 'CANDIDATE_EDGE', ...edge });
      }
    }
  }
  visit(startNodeId);
  while (candidates.length) {
    let minimumIndex = 0;
    for (let index = 1; index < candidates.length; index += 1) {
      if (candidates[index].weight < candidates[minimumIndex].weight) minimumIndex = index;
    }
    const edge = candidates.splice(minimumIndex, 1)[0];
    events.push({ type: 'CHECK_EDGE', ...edge });
    if (visited.has(edge.target)) {
      events.push({ type: 'REJECT_EDGE', ...edge });
      continue;
    }
    selectedEdges.push(edge);
    totalWeight += edge.weight;
    events.push({ type: 'SELECT_EDGE', ...edge, totalWeight });
    visit(edge.target);
  }
  const isConnected = visited.size === adjacency.size;
  if (!isConnected) {
    events.push({ type: 'DISCONNECTED_GRAPH', message: 'Graph is disconnected: no complete spanning tree exists. Selected edges and weight cover only the starting component.' });
  }
  return { selectedEdges, totalWeight, isConnected, events };
}
