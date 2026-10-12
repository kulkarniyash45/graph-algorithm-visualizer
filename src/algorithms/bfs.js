/**
 * Accepts the Map returned by toAdjacencyList and visits reachable nodes.
 * Neighbor array order breaks ties; weights do not affect BFS.
 * Returns { visitOrder, events } without changing the adjacency list.
 * DISCOVER_NODE includes the parent and connecting edge (null for the start).
 * QUEUE_SNAPSHOT contains a fresh array after every enqueue and dequeue.
 */
export function bfs(adjacency, startNodeId) {
  if (!(adjacency instanceof Map)) throw new Error('Expected an adjacency list Map.');
  if (!adjacency.has(startNodeId)) throw new Error('Choose an existing start node.');
  for (const neighbors of adjacency.values()) {
    if (!Array.isArray(neighbors)) throw new Error('Neighbors must be arrays.');
    for (const { nodeId } of neighbors) {
      if (!adjacency.has(nodeId)) throw new Error('Every edge must connect existing nodes.');
    }
  }

  const queue = [startNodeId];
  const visited = new Set(queue);
  const events = [
    { type: 'DISCOVER_NODE', nodeId: startNodeId, parentNodeId: null, edgeId: null },
    { type: 'QUEUE_SNAPSHOT', queue: [startNodeId] },
  ];
  const visitOrder = [];
  let head = 0;
  while (head < queue.length) {
    const nodeId = queue[head++];
    events.push({ type: 'QUEUE_SNAPSHOT', queue: queue.slice(head) });
    visitOrder.push(nodeId);
    events.push({ type: 'VISIT_NODE', nodeId });
    for (const { nodeId: target, edgeId } of adjacency.get(nodeId)) {
      events.push({ type: 'CHECK_EDGE', edgeId, source: nodeId, target });
      if (!visited.has(target)) {
        visited.add(target);
        queue.push(target);
        events.push({ type: 'DISCOVER_NODE', nodeId: target, parentNodeId: nodeId, edgeId });
        events.push({ type: 'QUEUE_SNAPSHOT', queue: queue.slice(head) });
      }
    }
  }
  return { events, visitOrder };
}
