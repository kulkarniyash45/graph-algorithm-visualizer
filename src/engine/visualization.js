// Replay a prefix so Previous restores queue, traversal, and highlights exactly.
export function getVisualizationState(events, step) {
  const state = {
    visitedNodeIds: new Set(), checkedEdgeIds: new Set(), discoveredNodeIds: new Set(),
    currentNode: null, currentEdge: null, currentEvent: null, queue: [], traversalOrder: [], distances: new Map(), predecessors: new Map(),
  };
  for (const event of events.slice(0, step)) {
    state.currentEvent = event.type;
    state.currentEdge = null;
    if (event.type === 'VISIT_NODE') {
      state.visitedNodeIds.add(event.nodeId);
      state.traversalOrder.push(event.nodeId);
      state.currentNode = event.nodeId;
    } else if (event.type === 'CHECK_EDGE' || event.type === 'RELAX_EDGE') {
      state.checkedEdgeIds.add(event.edgeId);
      state.currentEdge = event.edgeId;
      state.currentNode = event.source;
    } else if (event.type === 'DISCOVER_NODE') {
      state.discoveredNodeIds.add(event.nodeId);
    } else if (event.type === 'UPDATE_DISTANCE') {
      state.distances.set(event.nodeId, event.distance);
      state.predecessors.set(event.nodeId, event.predecessor);
    } else if (event.type === 'QUEUE_SNAPSHOT') {
      state.queue = [...event.queue];
    }
  }
  return state;
}
