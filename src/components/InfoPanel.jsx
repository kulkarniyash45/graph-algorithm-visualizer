export default function InfoPanel({ selectedEdges = [], totalWeight = 0, matrix = [], matrixLabels = [], matrixNodeIds = [], matrixCell = null, intermediateNode = null, pass = 0, maxPasses = 0, phase = '', warning = '', distances = new Map(), predecessors = new Map(), queue = [], traversalOrder = [], algorithm, status = 'Idle', currentStep = 0, totalSteps = 0, currentNode = '—', currentEvent = '—' }) {
  return (
    <aside aria-label="Algorithm information and execution state" className="min-h-0 min-w-0 space-y-4 lg:space-y-5 lg:overflow-y-auto">
      <section aria-labelledby="info-heading" className="glass-panel rounded-2xl border border-blue-400/15 bg-[#101a30]/80 p-5">
        <h2 id="info-heading" className="text-sm font-semibold">Algorithm inspector</h2>
        <span className="mt-5 inline-block rounded-md bg-blue-500/15 px-2 py-1 text-[11px] font-medium text-cyan-300">{algorithm.category}</span>
        <h3 className="mt-3 text-lg font-semibold tracking-tight">{algorithm.name}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">{algorithm.description}</p>
        <p className="mt-5 border-t border-blue-400/10 pt-4 text-xs leading-5 text-slate-400">Follow each event with the timeline. Step backward to inspect earlier state.</p>
      </section>
      <section aria-labelledby="state-heading" className="glass-panel rounded-2xl border border-blue-400/15 bg-[#101a30]/80 p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 id="state-heading" className="text-sm font-semibold">Execution state</h2>
          <span role="status" className="rounded-full bg-violet-500/15 px-2.5 py-1 text-xs text-slate-400">{status}</span>
        </div>
        {algorithm.id === 'bellman-ford' && totalSteps > 0 && (
          <p className="mt-4 text-xs text-slate-300">Pass {pass} / {maxPasses} {phase && '(' + phase + ')'}</p>
        )}
        {warning && <p role="alert" className="mt-4 text-xs text-rose-300">{warning}</p>}
        <dl className="mt-5 space-y-4 text-xs">
          {[
            ['Step', `${currentStep} / ${totalSteps}`],
            ['Current node', currentNode],
            ['Current event', currentEvent],
            ['Queue', queue.join(' > ') || '-'],
            ['Traversal order', traversalOrder.join(' > ') || '-'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <dt className="text-slate-400">{label}</dt>
              <dd className="break-all text-right font-mono text-slate-200">{value}</dd>
            </div>
          ))}
        </dl>
        {algorithm.id === 'prim' && totalSteps > 0 && (
          <div className="mt-5 text-xs">
            <h3 className="font-semibold text-slate-200">Selected {warning ? 'component' : 'MST'} edges</h3>
            <ul className="mt-2 space-y-1">
              {selectedEdges.map((edge) => <li key={edge.edgeId}>{edge.source} - {edge.target}: {edge.weight}</li>)}
            </ul>
            <p className="mt-2 font-semibold">Total weight: {totalWeight}</p>
            <p className="mt-2 text-slate-400">Cyan edges are candidates; emerald edges are selected.</p>
          </div>
        )}
        {algorithm.id === 'floyd-warshall' && matrix.length > 0 && (
          <div className="mt-5 overflow-x-auto text-xs">
            <h3 className="font-semibold text-slate-200">{warning ? 'Provisional distance matrix' : 'Distance matrix'}</h3>
            <p className="mt-2">Intermediate: {matrixLabels[matrixNodeIds.indexOf(intermediateNode)] ?? '-'}</p>
            <table className="mt-2 w-full text-center">
              <thead><tr><th scope="col">From / To</th>{matrixLabels.map((label, j) => <th scope="col" key={matrixNodeIds[j]} className="p-1">{label}</th>)}</tr></thead>
              <tbody>{matrix.map((row, i) => (
                <tr key={matrixNodeIds[i]}>
                  <th scope="row" className="p-1">{matrixLabels[i]}</th>
                  {row.map((distance, j) => <td key={matrixNodeIds[j]} className={'p-1 ' + (matrixCell?.i === i && matrixCell?.j === j ? matrixCell.updated ? 'bg-emerald-400/20' : 'bg-amber-400/20' : '')}>{distance === Infinity ? '\u221e' : distance}</td>)}
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {(algorithm.id === 'dijkstra' || algorithm.id === 'bellman-ford') && distances.size > 0 && (
          <div className="mt-5 text-xs">
            <h3 className="font-semibold text-slate-200">{warning ? 'Provisional distances' : 'Shortest distances'}</h3>
            <table className="mt-2 w-full text-left">
              <thead><tr><th scope="col">Node</th><th scope="col">Distance</th><th scope="col">Previous</th></tr></thead>
              <tbody>
                {[...distances].map(([nodeId, distance]) => (
                  <tr key={nodeId}>
                    <th scope="row" className="py-1 font-normal">{nodeId}</th>
                    <td>{distance === Infinity ? 'Unreachable' : distance}</td>
                    <td>{predecessors.get(nodeId) ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-5 rounded-lg border border-dashed border-blue-400/15 p-3 text-xs leading-5 text-slate-400">{totalSteps ? 'Highlighted nodes have been visited. Highlighted edges have been checked. Use the controls to explore each event.' : 'Select an implemented algorithm and choose Run to start a visualization.'}</div>
      </section>
    </aside>
  );
}
