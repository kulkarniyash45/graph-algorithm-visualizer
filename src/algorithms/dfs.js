/** Iterative depth-first traversal; neighbor order breaks ties, weights are ignored. */
export function dfs(adjacency, startNodeId) {
  if (!(adjacency instanceof Map)) throw new Error('Expected an adjacency list Map.');
  if (!adjacency.has(startNodeId)) throw new Error('Choose an existing start node.');
  for (const neighbors of adjacency.values()) {
    if (!Array.isArray(neighbors)) throw new Error('Neighbors must be arrays.');
    for (const { nodeId } of neighbors) {
      if (!adjacency.has(nodeId)) throw new Error('Every edge must connect existing nodes.');
    }
  }

  const visited = new Set([startNodeId]);
  const visitOrder = [startNodeId];
  const events = [
    { type: 'DISCOVER_NODE', nodeId: startNodeId, parentNodeId: null, edgeId: null },
    { type: 'VISIT_NODE', nodeId: startNodeId },
  ];
  // Frames resume the parent after exploring each child, matching recursive DFS.
  const stack = [{ nodeId: startNodeId, nextNeighbor: 0 }];
  while (stack.length) {
    const frame = stack[stack.length - 1];
    const neighbors = adjacency.get(frame.nodeId);
    if (frame.nextNeighbor === neighbors.length) {
      stack.pop();
      continue;
    }
    const { nodeId: target, edgeId } = neighbors[frame.nextNeighbor++];
    events.push({ type: 'CHECK_EDGE', edgeId, source: frame.nodeId, target });
    if (visited.has(target)) continue;
    visited.add(target);
    visitOrder.push(target);
    events.push({ type: 'DISCOVER_NODE', nodeId: target, parentNodeId: frame.nodeId, edgeId });
    events.push({ type: 'VISIT_NODE', nodeId: target });
    stack.push({ nodeId: target, nextNeighbor: 0 });
  }
  return { events, visitOrder };
}
