// Replaying a prefix makes Previous and Reset restore exactly the same state.
export function getVisualizationState(events, step) {
  const state = { visitedNodeIds: new Set(), checkedEdgeIds: new Set(), currentNode: null, currentEdge: null, currentEvent: null };
  for (const event of events.slice(0, step)) {
    state.currentEvent = event.type;
    state.currentEdge = null;
    if (event.type === 'VISIT_NODE') {
      state.visitedNodeIds.add(event.nodeId);
      state.currentNode = event.nodeId;
    } else if (event.type === 'CHECK_EDGE') {
      state.checkedEdgeIds.add(event.edgeId);
      state.currentEdge = event.edgeId;
      state.currentNode = event.source;
    }
  }
  return state;
}
