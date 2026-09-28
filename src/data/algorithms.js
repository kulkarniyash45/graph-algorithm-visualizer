// Selection metadata only. Algorithm implementations will live separately.
export const algorithms = [
  { id: 'bfs', name: 'Breadth-First Search', shortName: 'BFS', category: 'Traversal', description: 'Explore a graph one level at a time, visiting neighbors before moving deeper.' },
  { id: 'dfs', name: 'Depth-First Search', shortName: 'DFS', category: 'Traversal', description: 'Explore a path as far as possible before backtracking to another branch.' },
  { id: 'dijkstra', name: 'Dijkstra', shortName: 'Dijkstra', category: 'Shortest path', description: 'Find shortest paths from a starting node in a graph with nonnegative edge weights.' },
  { id: 'bellman-ford', name: 'Bellman-Ford', shortName: 'Bellman-Ford', category: 'Shortest path', description: 'Find shortest paths from a starting node, with support for negative edge weights and detection of reachable negative cycles.' },
  { id: 'floyd-warshall', name: 'Floyd-Warshall', shortName: 'Floyd-Warshall', category: 'Shortest path', description: 'Compare paths through intermediate nodes to find distances between all pairs of nodes.' },
  { id: 'prim', name: 'Prim', shortName: 'Prim', category: 'Minimum spanning tree', description: 'Grow a minimum spanning tree by selecting the lightest edge connecting the tree to a new node.' },
  { id: 'kruskal', name: 'Kruskal', shortName: 'Kruskal', category: 'Minimum spanning tree', description: 'Build a minimum spanning forest by selecting edges in weight order while avoiding cycles.' },
];
