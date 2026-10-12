import { useCallback, useEffect } from 'react';
import { useRef, useState } from 'react';
import { ReactFlow, Background, MarkerType, addEdge, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function GraphCanvas({ algorithmId, onRun, onGraphChange, visualization, error }) {
  const traversalEnabled = algorithmId === 'bfs' || algorithmId === 'dfs' || algorithmId === 'dijkstra';
  const runLabel = algorithmId === 'dijkstra' ? 'Run Dijkstra' : algorithmId === 'dfs' ? 'Run DFS' : 'Run BFS';
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [directed, setDirected] = useState(false);
  const [startNodeId, setStartNodeId] = useState('');
  useEffect(() => {
    onGraphChange();
  }, [nodes, edges, directed, startNodeId, onGraphChange]);
  useEffect(() => {
    if (!nodes.some(({ id }) => id === startNodeId)) setStartNodeId('');
  }, [nodes, startNodeId]);
  const flowInstance = useRef(null);
  const nextNodeNumber = useRef(0);

  const onConnect = useCallback((connection) => {
    if (!connection.source || !connection.target || connection.source === connection.target) return;

    setEdges((currentEdges) => {
      // Reverse connections are distinct only in directed mode.
      const duplicate = currentEdges.some((edge) => (
        (edge.source === connection.source && edge.target === connection.target)
        || (!directed && edge.source === connection.target && edge.target === connection.source)
      ));
      return duplicate ? currentEdges : addEdge({
        ...connection,
        data: { weight: 1 },
        label: '1',
      }, currentEdges);
    });
  }, [setEdges, directed]);

  const onEdgeDoubleClick = useCallback((event, edge) => {
    event.stopPropagation();
    const input = window.prompt('Enter edge weight:', String(edge.data.weight));
    if (input === null) return;

    const weight = Number(input.trim());
    if (input.trim() === '' || !Number.isFinite(weight)) {
      window.alert('Enter a finite numeric weight. The weight has not been changed.');
      return;
    }

    setEdges((currentEdges) => currentEdges.map((currentEdge) => (
      currentEdge.id === edge.id
        ? { ...currentEdge, data: { ...currentEdge.data, weight }, label: String(weight) }
        : currentEdge
    )));
  }, [setEdges]);

  const onCanvasDoubleClick = useCallback((event) => {
    if (!event.target.classList.contains('react-flow__pane') || !flowInstance.current) return;

    const number = nextNodeNumber.current++;
    let label = '';
    for (let value = number + 1; value > 0; value = Math.floor((value - 1) / 26)) {
      label = String.fromCharCode(65 + ((value - 1) % 26)) + label;
    }

    const position = flowInstance.current.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    setNodes((currentNodes) => [...currentNodes, {
      id: `node-${number}`,
      position,
      data: { label },
    }]);
  }, [setNodes]);

  return (
    <section aria-labelledby="canvas-heading" className="flex min-h-[400px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white lg:min-h-0">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <h2 id="canvas-heading" className="text-sm font-semibold">Graph canvas</h2>
        <div className="flex gap-3 text-xs text-slate-400">
          <span>{nodes.length} nodes</span>
          <span>{edges.length} edges</span>
        </div>
      </div>
      <div role="group" aria-label="Graph mode" className="flex shrink-0 gap-1 border-b border-slate-100 px-5 py-2">
        {[false, true].map((mode) => (
          <button
            key={String(mode)}
            type="button"
            aria-pressed={directed === mode}
            onClick={() => setDirected(mode)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${directed === mode ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            {mode ? 'Directed' : 'Undirected'}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-2 text-xs">
        <label htmlFor="traversal-start">Starting node</label>
        <select id="traversal-start" value={startNodeId} onChange={(event) => setStartNodeId(event.target.value)} className="rounded border border-slate-200 p-1" disabled={!traversalEnabled || !nodes.length}>
          <option value="">Choose a node</option>
          {nodes.map((node) => <option key={node.id} value={node.id}>{node.data.label}</option>)}
        </select>
        <button type="button" disabled={!traversalEnabled} onClick={() => onRun({ nodes, edges, directed }, startNodeId)} className="rounded bg-indigo-600 px-3 py-1.5 font-semibold text-white disabled:opacity-45">{runLabel}</button>
        {error && <span role="alert" className="text-red-600">{error}</span>}
      </div>
      <div className="relative min-h-0 flex-1 bg-slate-50/50">
        <div className="absolute inset-0" onDoubleClick={onCanvasDoubleClick}>
          <ReactFlow
            nodes={nodes.map((node) => ({
              ...node,
              style: {
                ...node.style,
                width: 60,
                height: 60,
                boxSizing: 'border-box',
                borderRadius: '50%',
                overflow: 'visible',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                ...(visualization.currentNode === node.id
                  ? { background: '#fef08a', borderColor: '#ca8a04' }
                  : visualization.visitedNodeIds.has(node.id)
                    ? { background: '#bbf7d0', borderColor: '#16a34a' } : {}),
              },
            }))}
            edges={edges.map((edge) => ({
              ...edge,
              style: {
                ...edge.style,
                ...(visualization.currentEdge === edge.id ? { stroke: '#ca8a04', strokeWidth: 3 } : {}),
              },
              markerEnd: directed ? { type: MarkerType.ArrowClosed } : undefined,
            }))}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeDoubleClick={onEdgeDoubleClick}
            onInit={(instance) => { flowInstance.current = instance; }}
            nodeOrigin={[0.5, 0.5]}
            deleteKeyCode="Delete"
            zoomOnDoubleClick={false}
            nodesDraggable
            nodesConnectable
            fitView
          >
            <Background />
          </ReactFlow>
        </div>
      </div>
      <p className="shrink-0 border-t border-slate-100 px-5 py-3 text-xs text-slate-400">Visualization workspace &middot; Preview</p>
    </section>
  );
}
