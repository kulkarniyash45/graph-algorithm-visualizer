import { useCallback } from 'react';
import { useRef } from 'react';
import { ReactFlow, Background, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function GraphCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, , onEdgesChange] = useEdgesState([]);
  const flowInstance = useRef(null);
  const nextNodeNumber = useRef(0);

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
      <div className="relative min-h-0 flex-1 bg-slate-50/50">
        <div className="absolute inset-0" onDoubleClick={onCanvasDoubleClick}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onInit={(instance) => { flowInstance.current = instance; }}
            nodeOrigin={[0.5, 0.5]}
            deleteKeyCode="Delete"
            zoomOnDoubleClick={false}
            nodesDraggable
            nodesConnectable={false}
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
