import { toAdjacencyMatrix } from '../utils/graphUtils.js';

/** Standard k/i/j Floyd-Warshall: O(V^3) computation, O(V^2) distances.
 * Events record comparisons separately for deterministic playback.
 */
export function floydWarshall(graph) {
  const { nodeIds, matrix } = toAdjacencyMatrix(graph);
  const distances = matrix.map((row, i) => row.map((weight, j) => (
    i === j ? Math.min(0, weight ?? Infinity) : weight ?? Infinity
  )));
  const labels = graph.nodes.map(({ id, data }) => data?.label ?? id);
  const indices = new Map(nodeIds.map((id, index) => [id, index]));
  const edgeIds = nodeIds.map(() => nodeIds.map(() => null));
  for (const edge of graph.edges) {
    const i = indices.get(edge.source);
    const j = indices.get(edge.target);
    if (edge.data.weight === matrix[i][j] && edgeIds[i][j] === null) edgeIds[i][j] = edge.id;
    if (!graph.directed && edge.data.weight === matrix[j][i] && edgeIds[j][i] === null) edgeIds[j][i] = edge.id;
  }
  const events = [{ type: 'INIT_MATRIX', nodeIds: [...nodeIds], labels, matrix: distances.map((row) => [...row]) }];
  for (let k = 0; k < nodeIds.length; k += 1) {
    events.push({ type: 'SET_INTERMEDIATE', nodeId: nodeIds[k], k });
    for (let i = 0; i < nodeIds.length; i += 1) {
      for (let j = 0; j < nodeIds.length; j += 1) {
        const distance = distances[i][k] + distances[k][j];
        events.push({
          type: 'COMPARE_PATH', source: nodeIds[i], target: nodeIds[j], via: nodeIds[k], i, j, k,
          currentDistance: distances[i][j], candidateDistance: distance,
          edgeIds: [edgeIds[i][k], edgeIds[k][j]].filter((id) => id !== null),
        });
        if (distance < distances[i][j]) {
          const previousDistance = distances[i][j];
          distances[i][j] = distance;
          events.push({ type: 'UPDATE_MATRIX_DISTANCE', source: nodeIds[i], target: nodeIds[j], via: nodeIds[k], i, j, k, previousDistance, distance });
        }
      }
    }
  }
  const negativeCycleNodeIds = nodeIds.filter((_, i) => distances[i][i] < 0);
  if (negativeCycleNodeIds.length) {
    events.push({ type: 'NEGATIVE_CYCLE', nodeIds: negativeCycleNodeIds, message: 'Negative-weight cycle detected. Affected shortest paths are undefined; displayed distances are provisional.' });
  }
  return { nodeIds, distances, events, hasNegativeCycle: negativeCycleNodeIds.length > 0, negativeCycleNodeIds };
}
