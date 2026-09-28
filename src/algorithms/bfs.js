/**
 * Traverse outgoing edges from startNodeId. Weights are ignored.
 * Nodes are { id }; edges are { id, source, target }. Input order breaks ties.
 * Returns { events, visitOrder }; only reachable nodes are visited.
 * Events: VISIT_NODE { nodeId }, CHECK_EDGE { edgeId, source, target }.
 */
export function bfs({ nodes, edges }, startNodeId) {
  const adjacency = new Map(nodes.map(({ id }) => [id, []]));
  if (adjacency.size !== nodes.length) throw new Error('Node IDs must be unique.');
  if (!adjacency.has(startNodeId)) throw new Error('Choose an existing start node.');
  const edgeIds = new Set();
  for (const edge of edges) {
    if (!adjacency.has(edge.source) || !adjacency.has(edge.target)) {
      throw new Error('Every edge must connect existing nodes.');
    }
    if (edgeIds.has(edge.id)) throw new Error('Edge IDs must be unique.');
    edgeIds.add(edge.id);
    adjacency.get(edge.source).push(edge);
  }

  const queue = [startNodeId];
  const discovered = new Set(queue);
  const events = [];
  const visitOrder = [];
  for (let head = 0; head < queue.length; head += 1) {
    const nodeId = queue[head];
    visitOrder.push(nodeId);
    events.push({ type: 'VISIT_NODE', nodeId });
    for (const { id, source, target } of adjacency.get(nodeId)) {
      events.push({ type: 'CHECK_EDGE', edgeId: id, source, target });
      if (!discovered.has(target)) {
        discovered.add(target);
        queue.push(target);
      }
    }
  }
  return { events, visitOrder };
}
