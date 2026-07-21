/**
 * Public surface of the explorer-row lens — a pure projection of a `CodeMapNode` into how the sidebar
 * explorer renders its row. View-specific facts (selectability, area, unary) reach it only as explicit
 * parameters, never by the lens reading view state, so any view composes the row it wants.
 */

export type { ExplorerRowProjection } from "./store/explorerRow.projection"
export { projectExplorerRow } from "./store/explorerRow.projection"
