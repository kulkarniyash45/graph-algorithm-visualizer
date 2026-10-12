import { useCallback, useEffect } from 'react';
import { useRef, useState } from 'react';
import { ReactFlow, Background, MarkerType, addEdge, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function GraphCanvas({ algorithmId, onRun, onGraphChange, visualization, error, onGraphSnapshot }) {
  const traversalEnabled = algorithmId === 'bfs' || algorithmId === 'dfs' || algorithmId === 'dijkstra' || algorithmId === 'bellman-ford' || algorithmId === 'floyd-warshall' || algorithmId === 'prim';
  const runLabel = algorithmId === 'prim' ? 'Run Prim' : algorithmId === 'floyd-warshall' ? 'Run Floyd-Warshall' : algorithmId === 'bellman-ford' ? 'Run Bellman-Ford' : algorithmId === 'dijkstra' ? 'Run Dijkstra' : algorithmId === 'dfs' ? 'Run DFS' : 'Run BFS';
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
  useEffect(() => {
    onGraphSnapshot({ nodes, edges, directed });
  }, [nodes, edges, directed, onGraphSnapshot]);
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
    <section aria-labelledby="canvas-heading" className="flex h-[600px] min-h-[530px] min-w-0 flex-col overflow-hidden glass-panel rounded-2xl border border-blue-400/15 bg-[#101a30]/80">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-blue-400/10 px-5 py-4">
        <h2 id="canvas-heading" className="text-sm font-semibold">Graph workspace</h2>
        <div className="flex gap-3 text-xs text-slate-400">
          <span>{nodes.length} nodes</span>
          <span>{edges.length} edges</span>
        </div>
      </div>
      <div role="group" aria-label="Graph mode" className="flex shrink-0 gap-1 border-b border-blue-400/10 px-5 py-2">
        {[false, true].map((mode) => (
          <button
            key={String(mode)}
            type="button"
            aria-pressed={directed === mode}
            onClick={() => setDirected(mode)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${directed === mode ? 'bg-blue-500/15 text-cyan-300' : 'text-slate-400 hover:bg-blue-500/10'}`}
          >
            {mode ? 'Directed' : 'Undirected'}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 border-b border-blue-400/10 px-5 py-2 text-xs">
        {algorithmId !== 'floyd-warshall' && <>
        <label htmlFor="traversal-start">Starting node</label>
        <select id="traversal-start" value={startNodeId} onChange={(event) => setStartNodeId(event.target.value)} className="rounded border border-blue-400/15 p-1" disabled={!traversalEnabled || !nodes.length}>
          <option value="">Choose a node</option>
          {nodes.map((node) => <option key={node.id} value={node.id}>{node.data.label}</option>)}
        </select>
        </>}
        <button type="button" disabled={!traversalEnabled} onClick={() => onRun({ nodes, edges, directed }, startNodeId)} className="rounded bg-blue-600 px-3 py-1.5 font-semibold text-white disabled:opacity-45">{runLabel}</button>
        {error && <span role="alert" className="text-rose-300">{error}</span>}
      </div>
      <div className="relative min-h-0 flex-1 bg-[#080e20]">
        <div className="absolute inset-0" onDoubleClick={onCanvasDoubleClick}>
          <ReactFlow
            colorMode="dark"
            nodes={nodes.map((node) => ({
              ...node,
              style: {
                background: '#0e1b33',
                color: '#e2f8ff',
                border: '1.5px solid #38bdf8',
                boxShadow: '0 0 16px #38bdf825',
                fontWeight: 600,
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
                  ? { background: '#302814', borderColor: '#fbbf24', boxShadow: '0 0 24px #fbbf2450' }
                  : visualization.visitedNodeIds.has(node.id)
                    ? { background: '#0b302b', borderColor: '#34d399', boxShadow: '0 0 20px #34d39935' } : {}),
              },
            }))}
            edges={edges.map((edge) => ({
              ...edge,
              style: {
                stroke: '#466584',
                strokeWidth: 1.5,
                ...edge.style,
                ...(visualization.selectedEdgeIds.has(edge.id)
                  ? { stroke: '#34d399', strokeWidth: 3, filter: 'drop-shadow(0 0 5px #34d399)' }
                  : (visualization.currentEdge === edge.id || visualization.currentEdgeIds.includes(edge.id) || visualization.candidateEdgeIds.has(edge.id))
                    ? { stroke: '#22d3ee', strokeWidth: 3, filter: 'drop-shadow(0 0 5px #22d3ee)' } : {}),
              },
              labelStyle: { fill: '#dbeafe', fontWeight: 600 },
              labelBgStyle: { fill: '#101a30' },
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
            <Background color="#254267" gap={24} size={1} />
          </ReactFlow>
        </div>
      </div>
      <p className="shrink-0 border-t border-blue-400/10 px-5 py-3 text-xs text-slate-400">Double-click canvas to add nodes / Connect handles / Double-click edges to edit weights / Delete to remove</p>
    </section>
  );
}
