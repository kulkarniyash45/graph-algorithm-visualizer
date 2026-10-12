// Replay a prefix so Previous restores queue, traversal, and highlights exactly.
export function getVisualizationState(events, step) {
  const state = {
    visitedNodeIds: new Set(), checkedEdgeIds: new Set(), discoveredNodeIds: new Set(),
    currentNode: null, currentEdge: null, currentEvent: null, queue: [], traversalOrder: [], distances: new Map(), predecessors: new Map(), pass: 0, maxPasses: 0, phase: '', warning: '', matrix: [], matrixNodeIds: [], matrixLabels: [], intermediateNode: null, matrixCell: null, currentEdgeIds: [], candidateEdgeIds: new Set(), selectedEdgeIds: new Set(), selectedEdges: [], totalWeight: 0,
  };
  for (const event of events.slice(0, step)) {
    state.currentEvent = event.type;
    state.currentEdge = null;
    state.currentEdgeIds = [];
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
    } else if (event.type === 'START_PASS') {
      state.pass = event.pass;
      state.maxPasses = event.maxPasses;
      state.phase = event.phase;
      state.currentNode = null;
    } else if (event.type === 'NEGATIVE_CYCLE') {
      state.warning = event.message;
      state.currentEdge = event.edgeId;
      state.currentNode = event.source;
    } else if (event.type === 'INIT_MATRIX') {
      state.matrix = event.matrix.map((row) => [...row]);
      state.matrixNodeIds = [...event.nodeIds];
      state.matrixLabels = [...event.labels];
    } else if (event.type === 'SET_INTERMEDIATE') {
      state.intermediateNode = event.nodeId;
      state.currentNode = event.nodeId;
      state.matrixCell = null;
    } else if (event.type === 'COMPARE_PATH' || event.type === 'UPDATE_MATRIX_DISTANCE') {
      state.currentNode = event.via;
      state.matrixCell = { i: event.i, j: event.j, k: event.k, updated: event.type === 'UPDATE_MATRIX_DISTANCE' };
      state.currentEdgeIds = event.edgeIds ?? [];
      if (event.type === 'UPDATE_MATRIX_DISTANCE') state.matrix[event.i][event.j] = event.distance;
    } else if (event.type === 'CANDIDATE_EDGE') {
      state.candidateEdgeIds.add(event.edgeId);
      state.currentEdge = event.edgeId;
      state.currentNode = event.source;
    } else if (event.type === 'SELECT_EDGE') {
      state.candidateEdgeIds.delete(event.edgeId);
      state.selectedEdgeIds.add(event.edgeId);
      state.selectedEdges.push({ edgeId: event.edgeId, source: event.source, target: event.target, weight: event.weight });
      state.totalWeight = event.totalWeight;
      state.currentEdge = event.edgeId;
    } else if (event.type === 'REJECT_EDGE') {
      state.candidateEdgeIds.delete(event.edgeId);
    } else if (event.type === 'DISCONNECTED_GRAPH') {
      state.warning = event.message;
    } else if (event.type === 'QUEUE_SNAPSHOT') {
      state.queue = [...event.queue];
    }
  }
  return state;
}
