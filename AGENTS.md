# Repository Guidelines

## Project Scope
Build an Interactive Graph Algorithm Visualizer using React, Vite, JavaScript, Tailwind CSS, and React Flow. The repository currently has no application scaffold. Do not build the application until explicitly requested; this file defines guidelines for future implementation.

## Project Structure & Module Organization
Use this intended structure when scaffolding:
- `src/algorithms/`: manually implemented BFS, DFS, Dijkstra, Bellman-Ford, Floyd-Warshall, Prim, and Kruskal.
- `src/engine/`: reusable event playback and visualization state management.
- `src/components/`: React Flow canvas, controls, and algorithm information panels.
- `src/utils/`: graph conversion, validation, and shared helpers.
- `src/assets/`: imported assets; `public/`: static files served directly.
- Colocate tests with their modules as `*.test.js` or `*.test.jsx`.

## Algorithm & Visualization Architecture
Algorithms must never manipulate React components, React Flow state, or the DOM. Accept plain graph data and algorithm options, then return ordered visualization events and final results. Implement algorithms manually rather than delegating to graph algorithm libraries.

Define a shared event contract with types such as `VISIT_NODE`, `CHECK_EDGE`, `RELAX_EDGE`, `UPDATE_DISTANCE`, and `SELECT_EDGE`. Include stable node or edge identifiers and relevant values in payloads. A reusable visualization engine consumes these events; React components render its state. Keep timing, pause, stepping, and reset behavior in the engine. Use deterministic traversal ordering for reproducible playback.

## Build, Test, and Development Commands
No package manifest or runnable commands exist yet. When scaffolding, configure and document:
- `npm run dev`: start Vite locally.
- `npm run build`: produce a production build.
- `npm run preview`: preview that build.
- `npm run lint`: run ESLint.
- `npm test`: run the planned Vitest suite.

## Coding Style & Naming Conventions
Use two-space indentation, ES modules, and functional React components. Use PascalCase for component filenames, camelCase for functions and variables, and UPPER_SNAKE_CASE for event types. Prefer Tailwind utilities for styling. Configure ESLint and Prettier during scaffolding; neither is installed yet.

## Testing Guidelines
Use Vitest for algorithm and engine tests. Verify final results, event payloads, deterministic ordering, and playback reset. Cover disconnected graphs, cycles, negative weights and cycles where applicable, and minimum spanning forests. No coverage threshold currently exists.

## Commit & Pull Request Guidelines
There is no commit history to establish conventions. Use concise imperative messages, optionally prefixed with `feat:`, `fix:`, or `docs:`. PRs should describe behavior, link relevant issues, report validation performed, and include screenshots for visual changes.
